# Fast Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Force text-to-image and Remix to use one-credit `1024x1024`, low-quality JPEG output while retaining persisted jobs and automatically recovering Vercel-killed generations.

**Architecture:** Define one fixed image-output contract in the image type layer and enforce it again in the CiYuan provider and generation service. Keep the existing 202 response plus local polling, but add an atomic stale-job claim in the database layer and a reconciliation service that releases frozen credits. Simplify both Studio surfaces to present the fixed contract and expose all job states in history.

**Tech Stack:** Next.js 15, React 19, TypeScript, Drizzle ORM/PostgreSQL, Vitest, Tailwind CSS 4.

---

## File Map

- `src/ai/images/types.ts`: canonical fixed model, quality, resolution, ratio, credit, and estimated duration.
- `src/ai/images/index.ts`: normalize every service call to the fixed contract.
- `src/ai/images/providers/ciyuan.ts`: send exact CiYuan `size`, `quality`, and `format` fields.
- `src/lib/validators/image.ts`: accept the required request fields and silently strip legacy output controls.
- `src/services/image/image-generation.ts`: persist effective parameters and save JPEG objects.
- `src/services/image/generation-jobs.ts`: atomically claim stale active jobs as failed.
- `src/services/image/stale-jobs.ts`: coordinate stale-job failure with idempotent credit release.
- `src/app/api/v1/image/generations/route.ts`: reconcile stale jobs before listing history.
- `src/app/api/v1/image/generations/[id]/route.ts`: reconcile the polled job before returning status.
- `src/lib/image-generation-client.ts`: poll long enough to receive the reconciled failure.
- `src/components/studio/text-to-image.tsx`: remove variable output controls and show the fixed contract.
- `src/components/studio/remix-workspace.tsx`: submit only Remix inputs and render square output.
- `src/components/studio/prompt-panel.tsx`: replace model/resolution/ratio selects with fixed-output summary.
- `src/components/generations/generation-history-grid.tsx`: continue rendering all four states.
- `src/app/[locale]/(dashboard)/generations/page.tsx`: stop filtering history to succeeded jobs.
- `src/messages/en.json`, `src/messages/zh.json`: localized fixed-output labels.
- `AGENTS.md`: permanent invariant for future changes.

### Task 1: Lock The Provider Contract

**Files:**
- Modify: `tests/ciyuan-image-provider.test.ts`
- Modify: `tests/image-pricing.test.ts`
- Modify: `src/ai/images/types.ts`
- Modify: `src/ai/images/index.ts`
- Modify: `src/ai/images/providers/ciyuan.ts`

- [ ] **Step 1: Write failing provider and pricing assertions**

Update both provider request assertions to require the exact body fields below, even when callers pass legacy ratio or resolution values:

```ts
expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
  size: "1024x1024",
  quality: "low",
  format: "jpeg",
  n: 1,
});

expect(getImageCreditCost("gpt-image-2", "low", "1k")).toBe(1);
expect(getImageQualityOptions("gpt-image-2").map((option) => option.value)).toEqual(["low"]);
expect(getImageResolutionOptions("gpt-image-2").map((option) => option.value)).toEqual(["1k"]);
expect(getSupportedAspectRatios("gpt-image-2")).toEqual(["1:1"]);
```

Replace the obsolete vendor-margin assertion based on `auto` pricing with the fixed one-credit contract assertion; do not invent a low-quality vendor cost.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `pnpm vitest run tests/ciyuan-image-provider.test.ts tests/image-pricing.test.ts`

Expected: FAIL because CiYuan bodies omit `quality` and `format`, Remix uses a portrait size, and quality still normalizes to `auto`.

- [ ] **Step 3: Implement the fixed contract**

Use these public types and constants in `src/ai/images/types.ts`:

```ts
export type ImageModel = "gpt-image-2";
export type ImageQuality = "low";
export type ImageResolution = "1k";

export const FIXED_IMAGE_OUTPUT = {
  model: "gpt-image-2",
  quality: "low",
  resolution: "1k",
  aspectRatio: "1:1",
  size: "1024x1024",
  format: "jpeg",
  creditCost: 1,
} as const;
```

Make all normalize/get-option helpers return only this contract. In `src/ai/images/index.ts`, ignore caller output options and pass the fixed values. In both CiYuan bodies use:

```ts
size: FIXED_IMAGE_OUTPUT.size,
quality: FIXED_IMAGE_OUTPUT.quality,
format: FIXED_IMAGE_OUTPUT.format,
n: 1,
```

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm vitest run tests/ciyuan-image-provider.test.ts tests/image-pricing.test.ts`

Expected: all provider and pricing tests PASS.

- [ ] **Step 5: Commit the provider contract**

```bash
git add tests/ciyuan-image-provider.test.ts tests/image-pricing.test.ts src/ai/images/types.ts src/ai/images/index.ts src/ai/images/providers/ciyuan.ts
git commit -m "fix: lock image generation to fast jpeg output"
```

### Task 2: Enforce Fixed Jobs And JPEG Persistence

**Files:**
- Modify: `tests/image-generation-moderation.test.ts`
- Modify: `tests/image-persistence.test.ts`
- Modify: `src/lib/validators/image.ts`
- Modify: `src/app/api/v1/image/generate/text/route.ts`
- Modify: `src/app/api/v1/image/generate/remix/route.ts`
- Modify: `src/services/image/image-generation.ts`

- [ ] **Step 1: Write failing service assertions**

Change the Remix start assertion to one credit and assert the created job stores the effective contract:

```ts
expect(started.response.creditsUsed).toBe(1);
expect(createImageGenerationJobMock).toHaveBeenCalledWith(expect.objectContaining({
  creditsUsed: 1,
  parameters: {
    aspectRatio: "1:1",
    model: "gpt-image-2",
    quality: "low",
    resolution: "1k",
    format: "jpeg",
  },
}));
```

Add run-phase assertions using a storage mock:

```ts
expect(storage.downloadAndUpload).toHaveBeenCalledWith(expect.objectContaining({
  key: expect.stringMatching(/\.jpg$/),
  contentType: "image/jpeg",
}));
```

Update persistence fixtures from `.png`/`image/png` to `.jpg`/`image/jpeg`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `pnpm vitest run tests/image-generation-moderation.test.ts tests/image-persistence.test.ts`

Expected: FAIL because job parameters still use caller options and generated objects are PNG.

- [ ] **Step 3: Strip legacy output controls at the API boundary**

Keep only required business fields in the schemas. Zod object parsing strips legacy keys without rejecting old clients:

```ts
export const textGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt must be under 1000 characters"),
});

export const remixRequestSchema = z.object({
  classicImageId: z.string().optional(),
  classicImageSlug: z.string().optional(),
  sourceImageKey: z.string(),
  prompt: z.string().optional(),
}).refine((data) => data.classicImageId || data.classicImageSlug, {
  message: "Either classicImageId or classicImageSlug is required",
});
```

Remove output-option arguments from both route calls.

- [ ] **Step 4: Save effective parameters and JPEG output**

In both start functions use `FIXED_IMAGE_OUTPUT` for cost, task values, and persisted parameters. In both run functions use:

```ts
filename: `${task.jobId}.jpg`,
contentType: "image/jpeg",
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `pnpm vitest run tests/image-generation-moderation.test.ts tests/image-persistence.test.ts`

Expected: all service and persistence tests PASS.

- [ ] **Step 6: Commit service enforcement**

```bash
git add tests/image-generation-moderation.test.ts tests/image-persistence.test.ts src/lib/validators/image.ts src/app/api/v1/image/generate/text/route.ts src/app/api/v1/image/generate/remix/route.ts src/services/image/image-generation.ts
git commit -m "fix: enforce fast image jobs and jpeg storage"
```

### Task 3: Recover Vercel-Killed Jobs

**Files:**
- Create: `tests/stale-image-jobs.test.ts`
- Create: `src/services/image/stale-jobs.ts`
- Modify: `src/services/image/generation-jobs.ts`
- Modify: `src/app/api/v1/image/generations/route.ts`
- Modify: `src/app/api/v1/image/generations/[id]/route.ts`
- Modify: `src/lib/image-generation-client.ts`

- [ ] **Step 1: Write the failing reconciliation tests**

Mock the atomic claim and credit service, then cover claimed and unclaimed jobs:

```ts
failStaleImageGenerationJobsMock.mockResolvedValue([{ id: "job_stale" }]);
await reconcileStaleImageGenerationJobs("user_1", new Date("2026-06-22T00:10:00Z"));
expect(releaseMock).toHaveBeenCalledWith("job_stale");

failStaleImageGenerationJobsMock.mockResolvedValue([]);
await reconcileStaleImageGenerationJobs("user_1", new Date("2026-06-22T00:10:00Z"));
expect(releaseMock).not.toHaveBeenCalled();
```

Also assert the cutoff passed to the claim function is exactly 315,000 ms before `now`.

- [ ] **Step 2: Run the new test and verify RED**

Run: `pnpm vitest run tests/stale-image-jobs.test.ts`

Expected: FAIL because `stale-jobs.ts` and the atomic claim function do not exist.

- [ ] **Step 3: Add the atomic stale claim**

In `generation-jobs.ts`, use one conditional update:

```ts
export async function failStaleImageGenerationJobs(userId: string, cutoff: Date) {
  return db.update(imageGenerationJobs)
    .set({
      status: "FAILED",
      errorMessage: STALE_IMAGE_JOB_ERROR,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(imageGenerationJobs.userId, userId),
      inArray(imageGenerationJobs.status, ["QUEUED", "RUNNING"]),
      lt(imageGenerationJobs.updatedAt, cutoff),
    ))
    .returning();
}
```

For a single polled job, add the same conditional update with both ID and user ID. Define and export `STALE_IMAGE_JOB_ERROR` from `generation-jobs.ts`; `stale-jobs.ts` imports it alongside the claim functions, avoiding a dependency cycle.

- [ ] **Step 4: Add reconciliation and route integration**

Create the coordinator with `STALE_IMAGE_JOB_MS = 315_000`. It claims stale jobs, calls `creditService.release(job.id)` for each claimed row, logs release failures, and returns claimed rows. Call the user-wide function before history listing. In the polling route, validate ownership, reconcile that job, and return the reconciled row when one was claimed.

Set the client default timeout to `330_000` ms so at least one poll occurs after reconciliation becomes eligible.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `pnpm vitest run tests/stale-image-jobs.test.ts tests/api-client-response.test.ts`

Expected: all tests PASS.

- [ ] **Step 6: Commit stale recovery**

```bash
git add tests/stale-image-jobs.test.ts src/services/image/stale-jobs.ts src/services/image/generation-jobs.ts src/app/api/v1/image/generations/route.ts src/app/api/v1/image/generations/[id]/route.ts src/lib/image-generation-client.ts
git commit -m "fix: recover stale image generation jobs"
```

### Task 4: Simplify Studio And Expose Job States

**Files:**
- Modify: `tests/studio-performance.test.ts`
- Modify: `src/components/studio/text-to-image.tsx`
- Modify: `src/components/studio/remix-workspace.tsx`
- Modify: `src/components/studio/prompt-panel.tsx`
- Modify: `src/components/studio/remix-result-panel.tsx`
- Modify: `src/app/[locale]/(dashboard)/generations/page.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/zh.json`

- [ ] **Step 1: Write failing UI boundary assertions**

Extend the source-boundary test to require fixed-output labels and prohibit variable controls/request fields:

```ts
expect(textSource).toContain('t("fixedOutput")');
expect(remixSource).not.toContain("resolution,");
expect(remixSource).not.toContain("aspectRatio,");
expect(historySource).not.toContain('j.status === "succeeded"');
```

- [ ] **Step 2: Run UI boundary test and verify RED**

Run: `pnpm vitest run tests/studio-performance.test.ts`

Expected: FAIL because both Studio surfaces still expose and submit variable controls and history filters pending/failed jobs.

- [ ] **Step 3: Simplify text-to-image**

Remove quality, resolution, and aspect-ratio state and selectors. Submit only `{ prompt }`, render the preview with `aspectRatio="1:1"`, and show localized fixed-output badges for `1024 x 1024`, low quality, JPEG, and one credit.

- [ ] **Step 4: Simplify Remix**

Remove output-option state, effects, and request fields from `remix-workspace.tsx`. Reduce `PromptPanel` props to scene, prompt generation, and disabled/loading state; replace its three selects with the same fixed-output summary. Render `RemixResultPanel` as square.

- [ ] **Step 5: Show every history status**

Replace the succeeded-only assignment with:

```ts
setJobs(data.data.jobs as GenerationJobData[]);
```

Keep the existing grid behavior for queued, running, failed, and succeeded cards.

- [ ] **Step 6: Add localized labels**

Add matching keys under the relevant Studio namespaces:

Use the same `fixedOutput` key in each locale file:

```json
// en.json
"fixedOutput": "1024 x 1024 · Low · JPEG"

// zh.json
"fixedOutput": "1024 x 1024 · 低质量 · JPEG"
```

- [ ] **Step 7: Run UI test and typecheck**

Run: `pnpm vitest run tests/studio-performance.test.ts && pnpm typecheck`

Expected: UI boundary tests PASS and TypeScript exits 0.

- [ ] **Step 8: Commit UI and history**

```bash
git add tests/studio-performance.test.ts src/components/studio/text-to-image.tsx src/components/studio/remix-workspace.tsx src/components/studio/prompt-panel.tsx src/components/studio/remix-result-panel.tsx src/app/[locale]/(dashboard)/generations/page.tsx src/messages/en.json src/messages/zh.json
git commit -m "fix: simplify studio to fast image output"
```

### Task 5: Document The Invariant And Verify The Product

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add the permanent invariant**

Add a prominent section near the image provider overview:

```md
## Critical Image Generation Invariant

Text-to-image and Remix must use `gpt-image-2` with `1024x1024`, `quality: low`, JPEG output, and a one-credit cost. Enforce this in the server/provider request; frontend defaults alone are not sufficient. Do not restore 2K/4K, PNG, variable quality, or variable output ratios unless execution infrastructure is first changed to support slower jobs safely.
```

- [ ] **Step 2: Run all verification commands**

Run:

```bash
pnpm test
pnpm typecheck
pnpm biome check AGENTS.md src/ai/images src/lib/validators/image.ts src/services/image src/app/api/v1/image src/components/studio src/components/generations 'src/app/[locale]/(dashboard)/generations/page.tsx' src/messages tests
pnpm build
git diff --check
```

Expected: all tests pass, typecheck exits 0, Biome reports no errors for changed scope, production build exits 0, and diff check is clean.

- [ ] **Step 3: Review the final diff against the design**

Confirm every requirement in `docs/superpowers/specs/2026-06-21-fast-image-generation-design.md` has a corresponding implementation and no unrelated refactor is included.

- [ ] **Step 4: Commit documentation and any verification-only fixes**

```bash
git add AGENTS.md
git commit -m "docs: record fast image generation invariant"
```
