# saas_cloudflare Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `D:\dev\cc\saas_cloudflare` into `D:\dev\cc\videofly-template` as a Vercel-ready Next.js template, using VideoFly's PostgreSQL/Drizzle database, Better Auth authentication, shared credit/payment system, storage layer, frontend conventions, and API style.

**Architecture:** Keep `videofly-template` as the host application and port source features into its `src/` structure. Rewrite Cloudflare-only pieces instead of copying them: D1 repositories become Drizzle services, Supabase auth becomes Better Auth, R2 bindings become S3/R2 API calls through `src/lib/storage.ts`, and OpenNext/Wrangler deployment code is removed from the migrated runtime. Preserve the existing video generation code and APIs, but remove public navigation, landing page, sitemap, and dashboard entry points so the product surface becomes the migrated AI photo/gallery/studio experience.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/Radix UI, next-intl, Better Auth, PostgreSQL, Drizzle ORM, Creem, Vercel, R2/S3-compatible object storage, MiniMax image generation.

---

## Current Inventory

### Target Project: `D:\dev\cc\videofly-template`

- Uses `src/` layout with Next.js App Router and locale route group `src/app/[locale]`.
- Database is PostgreSQL through Drizzle in `src/db/schema.ts` and `src/db/index.ts`.
- Auth is Better Auth in `src/lib/auth/*`, with Google OAuth, magic link, admin field, and Creem plugin support.
- Credit system already exists in `src/services/credit.ts` with FIFO packages and freeze/settle/release.
- Storage already exists in `src/lib/storage.ts` using S3-compatible R2 credentials.
- Existing video generation exists under:
  - `src/ai/*`
  - `src/services/video.ts`
  - `src/components/video-generator/*`
  - `src/app/api/v1/video/*`
  - `src/app/[locale]/(tool)/text-to-video`
  - `src/app/[locale]/(tool)/image-to-video`
  - `src/app/[locale]/(tool)/reference-to-video`
- Current package manager is `pnpm`.
- Current deploy target is already Vercel-compatible through normal Next build.

### Source Project: `D:\dev\cc\saas_cloudflare`

- Product is AI photo remix and text-to-image generation.
- Runtime is Cloudflare-first:
  - `@opennextjs/cloudflare`
  - Wrangler
  - Cloudflare D1
  - Cloudflare R2 binding
  - Supabase Auth
- Source business modules:
  - Public homepage
  - Gallery
  - Studio with Image Remix and Text-to-Image
  - Uploads
  - Generation history
  - Credits
  - Creem checkout/webhooks
  - Admin gallery/users/stats
- Source data schema:
  - `customers`
  - `credits_history`
  - `subscriptions`
  - `classic_images`
  - `generation_jobs`
- Source static gallery assets: 54 files under `public/images`.
- Source tests are Vitest-based and cover D1 repos, R2 keying, gallery, generation, auth redirects, subscriptions, and UI resilience.

### Source Files To Port

| Area | Source files | Target destination |
| --- | --- | --- |
| MiniMax image client | `lib/minimax-images.ts` | `src/ai/images/minimax.ts` or `src/services/image/minimax.ts` |
| Prompt logic | `lib/generation-prompts.ts` | `src/services/image/prompts.ts` |
| Safety policy | `lib/safety.ts` | `src/services/image/safety.ts` |
| Validators | `lib/validators/generation.ts`, `lib/validators/ai-photo.ts` | `src/services/image/validators.ts` or `src/lib/validators/image.ts` |
| Gallery data fallback | `data/classic-images.ts` | `src/data/classic-images.ts` and seed script |
| Types | `types/ai-photo.ts`, `types/studio.ts` | `src/types/ai-photo.ts`, `src/types/studio.ts` |
| Gallery UI | `components/gallery/*`, `app/gallery/page.tsx` | `src/components/gallery/*`, `src/app/[locale]/(marketing)/gallery/page.tsx` |
| Studio UI | `components/studio/*`, `app/studio/*` | `src/components/studio/*`, `src/app/[locale]/(tool)/studio/page.tsx` |
| Generations UI | `components/generations/*`, `app/generations/page.tsx` | `src/components/generations/*`, `src/app/[locale]/(dashboard)/generations/page.tsx` |
| Admin gallery | `app/admin/gallery/*`, `app/api/admin/gallery/route.ts` | `src/app/[locale]/(admin)/admin/gallery/*`, `src/app/api/v1/admin/gallery/route.ts` |
| Public assets | `public/images/*` | `public/images/*` after conflict audit |
| Tests | `tests/*.test.ts(x)` | `tests/*.test.ts(x)` after adapting to Drizzle/Better Auth/storage |

### Source Files To Rewrite Or Skip

| Source files | Decision |
| --- | --- |
| `utils/supabase/*` | Do not migrate. Replace with `src/lib/auth`, `getCurrentUser`, `requireAuth`, `requireAdmin`. |
| `lib/d1/*` | Do not copy as runtime code. Rebuild as Drizzle services. |
| `lib/cloudflare-env.ts` | Do not migrate. Replace with `process.env` and `src/lib/storage.ts`. |
| `lib/r2.ts` | Migrate only object-key/public-url helpers. Upload implementation must use `getStorage()`. |
| `open-next.config.ts`, `wrangler*.toml`, `.dev.vars`, `scripts/build-cloudflare.mjs` | Do not migrate into target runtime. Keep only as historical reference if needed. |
| `app/auth/*`, `app/(auth-pages)/*` | Do not migrate. Use target Better Auth pages. |
| `app/api/creem/*`, `app/api/webhooks/creem/route.ts` | Prefer target Creem plugin and credit hooks. Add compatibility wrappers only if UI migration temporarily needs them. |
| `components/ui/*` | Do not overwrite target UI library. Reuse target `src/components/ui/*`. |

---

## Target Route Map

Use target locale routing. Default locale keeps no prefix, Chinese uses `/zh`.

| Source route | Target route | Notes |
| --- | --- | --- |
| `/` | `src/app/[locale]/(marketing)/page.tsx` | Replace video landing with AI photo/gallery/studio landing. |
| `/gallery` | `src/app/[locale]/(marketing)/gallery/page.tsx` | Public browseable gallery. |
| `/studio` | `src/app/[locale]/(tool)/studio/page.tsx` | Primary creation surface. May allow viewing while signed out, but generation/upload requires auth. |
| `/generations` | `src/app/[locale]/(dashboard)/generations/page.tsx` | Auth-required user generation history. |
| `/my-uploads` | `src/app/[locale]/(dashboard)/my-uploads/page.tsx` | Optional. Source currently stores upload list client-side only; persist only if required. |
| `/dashboard` | `src/app/[locale]/(dashboard)/dashboard/page.tsx` or existing dashboard shell | Use target dashboard layout and cards. |
| `/admin/gallery` | `src/app/[locale]/(admin)/admin/gallery/page.tsx` | Auth-required, `user.isAdmin === true`. |
| `/admin/users` | Existing target admin users plus migrated image metrics | Avoid source password admin login. |
| `/api/gallery` | `/api/v1/gallery` | Update clients to target response shape. |
| `/api/uploads` | `/api/v1/image/upload` | Use target storage. |
| `/api/generate/text` | `/api/v1/image/generate/text` | Better Auth + Drizzle + credit freeze/settle. |
| `/api/generate/remix` | `/api/v1/image/generate/remix` | Better Auth + gallery table lookup. |
| `/api/generations` | `/api/v1/image/generations` | User history. |
| `/api/generations/[id]` | `/api/v1/image/generations/[id]` | User-scoped detail. |

Compatibility aliases for the old source API paths are optional. If used, keep them thin and delete after frontend fetches are migrated.

---

## Target Database Design

### Add New Tables To `src/db/schema.ts`

Keep the existing `users`, `customers`, `credit_packages`, `credit_holds`, `credit_transactions`, `videos`, and `creem_subscriptions` tables.

Add image domain tables:

```ts
export const imageGenerationTypeEnum = pgEnum("ImageGenerationType", [
  "TEXT",
  "REMIX",
]);

export const imageGenerationStatusEnum = pgEnum("ImageGenerationStatus", [
  "QUEUED",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
]);

export const classicImages = pgTable(
  "classic_images",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    promptTemplate: text("prompt_template").notNull(),
    heroImageUrl: text("hero_image_url").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("classic_images_slug_idx").on(table.slug),
    categoryIdx: index("classic_images_category_idx").on(table.category),
    subcategoryIdx: index("classic_images_subcategory_idx").on(table.subcategory),
    activeIdx: index("classic_images_is_active_idx").on(table.isActive),
  })
);

export const imageGenerationJobs = pgTable(
  "image_generation_jobs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: imageGenerationTypeEnum("type").notNull(),
    status: imageGenerationStatusEnum("status").default("QUEUED").notNull(),
    classicImageId: text("classic_image_id"),
    prompt: text("prompt"),
    sourceImageKey: text("source_image_key"),
    resultImageKey: text("result_image_key"),
    resultImageUrl: text("result_image_url"),
    creditsUsed: integer("credits_used").default(0).notNull(),
    errorMessage: text("error_message"),
    parameters: jsonb("parameters"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdx: index("image_generation_jobs_user_id_idx").on(table.userId),
    statusIdx: index("image_generation_jobs_status_idx").on(table.status),
    typeIdx: index("image_generation_jobs_type_idx").on(table.type),
    classicImageIdx: index("image_generation_jobs_classic_image_id_idx").on(table.classicImageId),
    createdAtIdx: index("image_generation_jobs_created_at_idx").on(table.createdAt),
  })
);

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    scope: text("scope").notNull(),
    windowStart: timestamp("window_start").notNull(),
    count: integer("count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userScopeWindowIdx: uniqueIndex("rate_limit_events_user_scope_window_idx").on(
      table.userId,
      table.scope,
      table.windowStart
    ),
  })
);
```

### Credit Mapping

Do not port source `customers.credits` as a second balance system.

Use target credit tables as the single source of truth:

- New user credits: existing `creditService.grantNewUserCredits`.
- One-time purchases: existing Creem hooks call `creditService.recharge`.
- Image generation charge: use `creditService.freeze`, `creditService.settle`, and `creditService.release`.
- For first migration, pass `imageGenerationJobs.id` into the current `videoUuid` parameter. This avoids a risky credit schema refactor while preserving idempotent holds. Add a comment in the image generation service explaining this compatibility use.
- After migration is stable, optionally refactor credit holds from `video_uuid` to generic `resource_type/resource_id` in a separate cleanup.

### Source D1 To Target Postgres Mapping

| Source D1 table | Target table | Mapping |
| --- | --- | --- |
| `classic_images` | `classic_images` | Direct field migration with camelCase Drizzle names. |
| `generation_jobs` | `image_generation_jobs` | Map `queued/running/succeeded/failed` to uppercase enum values. |
| `customers` | `users`, `customers`, `credit_packages` | Do not import sessions. If production data is needed, map by email and legacy user ID. |
| `credits_history` | `credit_transactions` plus package records | Only for production data migration. New runtime uses target credits. |
| `subscriptions` | `creem_subscriptions` and credit packages | Prefer Creem plugin state. Import only if subscription continuity is required. |

---

## Phase 0: Preparation And Baseline

**Files:** no code edits.

- [ ] Create a migration branch:

```powershell
git checkout -b codex/migrate-saas-cloudflare
```

- [ ] Record target baseline:

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

Expected: any existing failures are recorded before migration starts.

- [ ] Record source feature inventory:

```powershell
rg --files D:\dev\cc\saas_cloudflare\app D:\dev\cc\saas_cloudflare\components D:\dev\cc\saas_cloudflare\lib D:\dev\cc\saas_cloudflare\types
```

- [ ] Confirm the source project remains read-only during migration. All edits happen in `D:\dev\cc\videofly-template`.

- [ ] Commit only if the repo owner wants checkpoint commits:

```powershell
git add docs/superpowers/plans/2026-05-14-saas-cloudflare-migration.md
git commit -m "docs: add saas cloudflare migration plan"
```

**Acceptance:** Baseline command results and known failures are documented before feature code moves.

---

## Phase 1: Dependencies, Environment, And Vercel Guardrails

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.env.example`
- Modify: `src/env.mjs`
- Modify: `src/lib/auth/env.mjs`
- Modify: `next.config.mjs`
- Create: `src/config/features.ts`

### Tasks

- [ ] Keep target package manager as `pnpm`. Do not import source `package-lock.json`.

- [ ] Do not add these source dependencies to target runtime:
  - `@opennextjs/cloudflare`
  - `@cloudflare/workers-types`
  - `wrangler`
  - `@supabase/ssr`
  - `@supabase/supabase-js`

- [ ] Add only missing dependencies that the migrated code genuinely needs. Current target already has most UI dependencies: Radix, `lucide-react`, `framer-motion`, `react-hook-form`, and `zod`.

- [ ] If porting source tests, add Vitest test dependencies:

```powershell
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/dom jsdom
```

- [ ] Add environment variables to `.env.example` and env validation:

```bash
MINIMAX_API_KEY=your-minimax-api-key
MINIMAX_API_URL=https://api.minimaxi.com/v1
MAX_UPLOAD_MB=10
NEXT_PUBLIC_SHOW_VIDEO_FEATURES=false
```

- [ ] Keep existing storage env vars:

```bash
STORAGE_ENDPOINT=https://xxx.r2.cloudflarestorage.com
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=your_r2_access_key_id
STORAGE_SECRET_KEY=your_r2_secret_access_key
STORAGE_BUCKET=your_bucket_name
STORAGE_DOMAIN=https://pub-xxx.r2.dev
```

- [ ] Create `src/config/features.ts`:

```ts
export const featureFlags = {
  showVideoFeatures: process.env.NEXT_PUBLIC_SHOW_VIDEO_FEATURES === "true",
  showImageFeatures: true,
} as const;
```

- [ ] Update `next.config.mjs` for image domains. Use regular `<img>` for generated user images if storage domain is dynamic. Use `next/image` for local gallery assets and configured static domains only.

- [ ] Set serverless route duration where image generation may run longer:

```ts
export const maxDuration = 60;
```

Use this only in Vercel route handlers that call MiniMax synchronously.

**Acceptance:**

```powershell
pnpm install
pnpm typecheck
```

Expected: env validation passes with example-compatible local env.

---

## Phase 2: Drizzle Schema And Data Access Layer

**Files:**

- Modify: `src/db/schema.ts`
- Create: `src/services/image/gallery.ts`
- Create: `src/services/image/generation-jobs.ts`
- Create: `src/services/image/rate-limit.ts`
- Create: `scripts/seed-classic-images.ts`
- Generated: `src/db/migrations/*`

### Tasks

- [ ] Add `classicImages`, `imageGenerationJobs`, and `rateLimitEvents` tables to `src/db/schema.ts`.

- [ ] Export new table types:

```ts
export type ClassicImage = typeof classicImages.$inferSelect;
export type ImageGenerationJob = typeof imageGenerationJobs.$inferSelect;
```

- [ ] Generate migration:

```powershell
pnpm db:generate
```

- [ ] Write gallery service methods:
  - `listClassicImages(filters)`
  - `getClassicImageById(id)`
  - `getClassicImageBySlug(slug)`
  - `getGalleryCategories()`
  - `updateClassicImage(id, patch)`
  - `deleteClassicImage(id)` or soft-disable with `isActive=false`

- [ ] Write generation job service methods:
  - `listImageGenerationJobs({ userId, status, type, limit, offset })`
  - `countImageGenerationJobs({ userId, status, type })`
  - `getImageGenerationJobById(id)`
  - `createImageGenerationJob(input)`
  - `updateImageGenerationJobStatus(id, status, updates)`

- [ ] Replace source string-built SQL with Drizzle query builders.

- [ ] Write DB-backed rate limiter:
  - `checkRateLimit(userId, scope, limitConfig)`
  - `incrementRateLimit(userId, scope, limitConfig)`
  - scopes: `image:text`, `image:remix`, `image:upload`

- [ ] Write seed script using `src/data/classic-images.ts`.

```powershell
pnpm tsx scripts/seed-classic-images.ts
```

**Acceptance:**

```powershell
pnpm db:generate
pnpm typecheck
```

Expected: schema compiles; generated migration creates the three new tables and indexes.

---

## Phase 3: Image Generation Services

**Files:**

- Create: `src/ai/images/minimax.ts`
- Create: `src/services/image/prompts.ts`
- Create: `src/services/image/safety.ts`
- Create: `src/services/image/storage.ts`
- Create: `src/services/image/image-generation.ts`
- Create: `src/lib/validators/image.ts`
- Create or modify: `src/types/ai-photo.ts`

### Tasks

- [ ] Port source MiniMax client from `lib/minimax-images.ts`.

Required behavior:

```ts
export async function generateImage(request: MiniMaxGenerateRequest): Promise<MiniMaxGenerateResponse>;
export async function remixImage(input: {
  prompt: string;
  sourceImageUrl: string;
  aspectRatio?: string;
}): Promise<MiniMaxGenerateResponse>;
```

- [ ] Normalize MiniMax base URL:
  - default to `https://api.minimaxi.com/v1`
  - rewrite `api.minimax.chat` and `api.minimax.io` to `api.minimaxi.com`

- [ ] Port prompt builders:
  - `buildTextPrompt`
  - `buildRemixPrompt`
  - `inferRemixAspectRatio`

- [ ] Port safety policy:
  - `assertPromptAllowed(prompt)`
  - return `400` for blocked prompts

- [ ] Port validators to target `zod` version. Keep request contracts:

```ts
text: {
  prompt: string;
  aspectRatio?: "1:1" | "3:4" | "9:16" | "16:9";
}

remix: {
  classicImageId?: string;
  classicImageSlug?: string;
  sourceImageKey: string;
  prompt?: string;
  aspectRatio?: "1:1" | "3:4" | "9:16" | "16:9";
}
```

- [ ] Replace source R2 binding uploads with `getStorage().uploadFile`.

- [ ] Create image object key helper:

```ts
export function buildImageObjectKey(input: {
  userId: string;
  kind: "source" | "result";
  filename: string;
}): string {
  const sanitized = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `images/${input.userId}/${input.kind}/${Date.now()}-${sanitized}`;
}
```

- [ ] Create `imageGenerationService.generateTextImage`.

Flow:

1. Validate auth user.
2. Check DB-backed rate limit.
3. Validate body.
4. Build prompt.
5. Safety-check prompt.
6. Calculate credit cost, first version `1`.
7. Create `image_generation_jobs` row as `QUEUED`.
8. Freeze credits with job id.
9. Update job to `RUNNING`.
10. Call MiniMax.
11. Upload result to storage.
12. Update job to `SUCCEEDED`.
13. Settle credits.
14. Increment rate limit.
15. Return job id, object key, and public URL.

- [ ] Create `imageGenerationService.generateRemixImage`.

Flow is the same as text generation, plus:

1. Resolve classic image by id or slug from Postgres.
2. Require `sourceImageKey`.
3. Build public URL from storage domain.
4. Validate source image URL is HTTPS and not localhost/example placeholder.
5. Call MiniMax remix endpoint.

- [ ] On any failure after freeze, call `creditService.release(job.id)` and update job to `FAILED`.

**Acceptance:**

```powershell
pnpm typecheck
```

Expected: no imports from `@opennextjs/cloudflare`, `@cloudflare/workers-types`, or `@supabase/*` in migrated service code.

---

## Phase 4: API Routes

**Files:**

- Create: `src/app/api/v1/gallery/route.ts`
- Create: `src/app/api/v1/image/upload/route.ts`
- Create: `src/app/api/v1/image/generate/text/route.ts`
- Create: `src/app/api/v1/image/generate/remix/route.ts`
- Create: `src/app/api/v1/image/generations/route.ts`
- Create: `src/app/api/v1/image/generations/[id]/route.ts`
- Create: `src/app/api/v1/admin/gallery/route.ts`
- Modify or create: `src/app/api/v1/admin/stats/route.ts`

### Tasks

- [ ] Use target API helpers:

```ts
import { requireAuth, requireAdmin } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { ApiError } from "@/lib/api/error";
```

- [ ] Implement `GET /api/v1/gallery`.

Query params:

```text
category?: string
subcategory?: string
q?: string
```

Response:

```ts
apiSuccess({
  images,
  categories,
  total: images.length,
});
```

- [ ] Implement `POST /api/v1/image/upload`.

Input: multipart form with `file` and optional `kind`.

Response:

```ts
apiSuccess({
  objectKey,
  publicUrl,
  filename,
  size,
  contentType,
});
```

- [ ] Implement `POST /api/v1/image/generate/text`.

Response:

```ts
apiSuccess({
  jobId,
  objectKey,
  publicUrl,
});
```

- [ ] Implement `POST /api/v1/image/generate/remix`.

Response matches text route.

- [ ] Implement `GET /api/v1/image/generations`.

Auth required. Query params: `limit`, `offset`, `type`, `status`.

- [ ] Implement `GET /api/v1/image/generations/[id]`.

Auth required. User must own the job unless admin.

- [ ] Implement admin gallery route:
  - `GET`: list all, including inactive.
  - `PUT`: update title, description, hero image, thumbnail, active state.
  - `DELETE`: soft-disable or delete. Prefer soft-disable for templates.

- [ ] Avoid old source response shape in new routes. Update clients to unwrap `data`.

- [ ] Add temporary compatibility aliases only if migration needs incremental UI testing:
  - `/api/gallery` forwards to `/api/v1/gallery`
  - `/api/uploads` forwards to `/api/v1/image/upload`
  - `/api/generate/text` forwards to `/api/v1/image/generate/text`
  - `/api/generate/remix` forwards to `/api/v1/image/generate/remix`

**Acceptance:**

```powershell
pnpm typecheck
```

Manual smoke test after server starts:

```powershell
Invoke-WebRequest http://localhost:3000/api/v1/gallery
```

Expected: JSON response with `success: true`.

---

## Phase 5: Auth And Admin Migration

**Files:**

- Modify migrated server components under `src/app/[locale]/*`
- Modify migrated route handlers under `src/app/api/v1/*`
- Modify: `src/lib/auth/auth.ts` only if admin seeding needs improvement
- Do not migrate: `utils/supabase/*`
- Do not migrate: source `app/auth/*`
- Do not migrate: source `app/(auth-pages)/*`

### Tasks

- [ ] Replace source Supabase auth calls:

Source pattern:

```ts
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

Target route handler pattern:

```ts
const user = await requireAuth(request);
```

Target server component pattern:

```ts
const user = await getCurrentUser();
```

- [ ] Replace source user metadata access:

```ts
user.user_metadata?.full_name
user.user_metadata?.avatar_url
```

with target fields:

```ts
user.name
user.image
user.email
```

- [ ] Delete the source password admin flow from the migrated design:
  - do not port `app/api/admin/login/route.ts`
  - do not port `admin_session` cookie logic
  - use `requireAdmin(request)` and `user.isAdmin`

- [ ] Ensure `ADMIN_EMAIL` can grant admin during setup. If target does not already do this reliably, add a small script:

```powershell
pnpm tsx scripts/set-admin.ts admin@example.com
```

- [ ] Keep target login/register pages as the only auth UI.

**Acceptance:**

- Signed-out user can view public gallery and landing pages.
- Signed-out user receives `401` on upload/generation/history APIs.
- Signed-in user can upload and generate if they have credits.
- Non-admin user receives `403` on admin gallery mutation.
- Admin user can mutate gallery records.

---

## Phase 6: Frontend Migration

**Files:**

- Modify: `src/app/[locale]/(marketing)/page.tsx`
- Create: `src/app/[locale]/(marketing)/gallery/page.tsx`
- Create: `src/app/[locale]/(tool)/studio/page.tsx`
- Create: `src/app/[locale]/(tool)/studio/StudioContent.tsx`
- Create: `src/app/[locale]/(dashboard)/generations/page.tsx`
- Optional create: `src/app/[locale]/(dashboard)/my-uploads/page.tsx`
- Create: `src/components/gallery/*`
- Create: `src/components/studio/*`
- Create: `src/components/generations/*`
- Modify: `src/styles/globals.css`
- Modify: `src/messages/en.json`
- Modify: `src/messages/zh.json`

### Tasks

- [ ] Copy source gallery/studio/generation components into target `src/components`, but do not overwrite target shared components.

- [ ] Replace imports:

```ts
import { cn } from "@/lib/utils";
```

with target-compatible imports. Target already has `src/lib/utils.ts` and UI helpers; verify exact exported names.

- [ ] Replace source UI imports with target UI components:
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/select`
  - `@/components/ui/tabs`

- [ ] Update client fetch URLs:

```ts
fetch("/api/v1/gallery")
fetch("/api/v1/image/upload")
fetch("/api/v1/image/generate/text")
fetch("/api/v1/image/generate/remix")
fetch("/api/v1/image/generations")
```

- [ ] Update client response parsing for target shape:

```ts
const payload = await res.json();
if (!payload.success) throw new Error(payload.error?.message ?? "Request failed");
const data = payload.data;
```

- [ ] Convert routes to locale-aware navigation:

Use target `LocaleLink` and `next-intl` routing helpers instead of plain `next/link` where the target project convention requires it.

- [ ] Move source hardcoded UI strings into `src/messages/en.json` and `src/messages/zh.json` where practical.

First pass can keep low-risk English strings inside deeply nested components, but route titles, nav labels, CTA copy, empty states, and error states should be internationalized.

- [ ] Merge only necessary CSS from source `app/globals.css` into target `src/styles/globals.css`.

Do not copy Tailwind 3 config wholesale. Target uses Tailwind 4 and existing theme tokens.

- [ ] Use local public gallery images through `/images/...`.

- [ ] Use regular `<img>` or configured `next/image` remote patterns for generated storage URLs.

**Acceptance:**

```powershell
pnpm typecheck
pnpm lint
pnpm dev
```

Manual browser checks:

- `/`
- `/zh`
- `/gallery`
- `/zh/gallery`
- `/studio`
- `/generations`
- `/admin/gallery`

Expected: no layout break, no missing images, no unauthenticated mutation paths.

---

## Phase 7: Hide Video Features While Preserving Code

**Files:**

- Modify: `src/config/navigation.ts`
- Modify: `src/config/site.ts`
- Modify: `src/components/landing/header.tsx`
- Modify: `src/app/[locale]/(marketing)/page.tsx`
- Modify: `src/app/sitemap.ts`
- Optional modify: `src/middleware.ts`
- Do not delete: `src/ai/*`
- Do not delete: `src/services/video.ts`
- Do not delete: `src/components/video-generator/*`
- Do not delete: `src/app/api/v1/video/*`
- Do not delete unless explicitly approved: existing video tool routes

### Tasks

- [ ] Add image-first navigation:

```ts
export const headerTools = [
  { id: "studio", title: "Studio", href: "/studio", icon: "Sparkles" },
  { id: "gallery", title: "Gallery", href: "/gallery", icon: "Images" },
];
```

- [ ] Remove or feature-flag visible video nav entries:
  - `Text to Video`
  - `Image to Video`
  - `Reference Video`
  - video model dropdowns

- [ ] Update `sidebarNavigation` to show image/studio/history/credits/account entries.

- [ ] Keep video routes buildable but unlinked. If the product owner wants direct access blocked, add a middleware redirect guarded by `featureFlags.showVideoFeatures === false`; otherwise leave direct URLs accessible but hidden.

- [ ] Remove video routes from sitemap output.

- [ ] Replace landing page copy and hero from VideoFly video generation to source AI photo/gallery/studio product.

- [ ] Keep pricing linked to target credit products.

**Acceptance:**

- Public navigation has no video generator links.
- Landing page has no video-generation copy.
- Dashboard/sidebar has no video-generation entry.
- `src/app/api/v1/video/*` still typechecks.
- Existing video code remains in the repository.

---

## Phase 8: Billing, Credits, And Pricing

**Files:**

- Modify: `src/config/pricing-user.ts`
- Modify: `src/config/credits.ts` only if image model pricing needs a new config section
- Modify: `src/components/landing/pricing-section.tsx` or migrated pricing section
- Modify: `src/services/image/image-generation.ts`
- Do not port: source custom Creem webhook unless target plugin cannot cover a required event

### Tasks

- [ ] Decide product set:
  - Basic: 50 credits/month
  - Pro: 120 credits/month
  - Unlimited: 500 credits/month
  - Starter Pack: 3 credits
  - Standard Pack: 10 credits
  - Value Pack: 25 credits

- [ ] Map these into target `src/config/pricing-user.ts` with actual Creem product IDs.

- [ ] Keep one unified credit balance in target `creditService`.

- [ ] Image generation first version cost:

```ts
const IMAGE_GENERATION_CREDIT_COST = 1;
```

Place this in image config, not inline in routes.

- [ ] In image generation, use credit flow:

```ts
await creditService.freeze({ userId: user.id, credits: cost, videoUuid: job.id });
// call provider and upload
await creditService.settle(job.id);
```

On failure:

```ts
await creditService.release(job.id);
```

- [ ] Ensure duplicate provider retries do not double-charge by creating the job and hold before calling MiniMax.

- [ ] Do not run both source webhook and target Creem plugin for the same payment event.

**Acceptance:**

- User purchase gives credits through target Creem flow.
- Image generation consumes exactly one credit on success.
- Image generation failure releases frozen credit.
- Credit history page shows image consumption with a clear remark.

---

## Phase 9: Assets And Gallery Seed Data

**Files:**

- Copy: `D:\dev\cc\saas_cloudflare\public\images\*` to `public/images/*`
- Create or modify: `src/data/classic-images.ts`
- Create: `scripts/seed-classic-images.ts`
- Optional create: `docs/migration/gallery-seed.md`

### Tasks

- [ ] Compare existing target `public/images` with source filenames before copying:

```powershell
Get-ChildItem D:\dev\cc\videofly-template\public\images -File
Get-ChildItem D:\dev\cc\saas_cloudflare\public\images -File
```

- [ ] Copy only unique gallery assets or confirm overwrites file-by-file.

- [ ] Port `data/classic-images.ts` to `src/data/classic-images.ts`.

- [ ] Convert seed data into Drizzle inserts with idempotent upsert by `slug`.

- [ ] Seed local database:

```powershell
pnpm tsx scripts/seed-classic-images.ts
```

- [ ] Verify:

```powershell
pnpm tsx -e "import { db, classicImages } from './src/db'; console.log(await db.select().from(classicImages).limit(3))"
```

**Acceptance:**

- Gallery page displays source gallery images from local `/images/...`.
- Seed script can run twice without duplicate rows.
- Admin gallery can edit seeded records.

---

## Phase 10: Test Migration

**Files:**

- Create or modify: `vitest.config.ts`
- Create: `tests/setup.ts`
- Port selected source tests into `tests/`
- Modify: `package.json`

### Tasks

- [ ] Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] Port high-value source tests first:
  - `generation-request.test.ts`
  - `generation-prompts.test.ts`
  - `safety-policy.test.ts`
  - `r2-keying.test.ts` converted to storage key tests
  - `gallery-query.test.ts` converted to Drizzle service tests
  - `credits-ledger.test.ts` converted to target credit service expectations
  - `admin-gallery-client.test.tsx`
  - `studio-page-resilience.test.tsx`

- [ ] Skip or rewrite Cloudflare-only tests:
  - `d1-schema-contract.test.ts`
  - `d1-repositories.test.ts`
  - `cloudflare-bindings.test.ts`
  - `build-cloudflare-stubs.test.ts`

- [ ] Mock Better Auth user at API boundary for route handler tests.

- [ ] Mock MiniMax responses:

```ts
vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
  data: { image_urls: ["https://example-cdn.test/generated.png"] },
  base_resp: { status_code: 0 },
}))));
```

- [ ] Mock storage upload by replacing `getStorage()` with a test double in service tests.

**Acceptance:**

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all migrated tests pass; build succeeds on normal Next/Vercel path.

---

## Phase 11: Vercel Deployment Readiness

**Files:**

- Modify: `vercel.json` only if needed
- Modify: `.env.example`
- Modify: `docs/CONFIGURATION_GUIDE.md`
- Create: `docs/migration/vercel-deploy-checklist.md`

### Tasks

- [ ] Ensure Vercel env vars include:

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...
RESEND_FROM=...
CREEM_API_KEY=...
CREEM_WEBHOOK_SECRET=...
MINIMAX_API_KEY=...
MINIMAX_API_URL=https://api.minimaxi.com/v1
STORAGE_ENDPOINT=...
STORAGE_REGION=auto
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=...
STORAGE_DOMAIN=https://...
MAX_UPLOAD_MB=10
NEXT_PUBLIC_SHOW_VIDEO_FEATURES=false
```

- [ ] Remove source Cloudflare env requirements from target docs:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `BASE_URL`
  - `NEXT_PUBLIC_BASE_URL`
  - Wrangler secrets

- [ ] Configure Google OAuth callbacks for Better Auth:

```text
https://your-domain.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

- [ ] Configure Creem webhook to target Better Auth route/plugin endpoint currently used by this project. Verify exact endpoint from target Creem integration before production.

- [ ] Run production-like build locally:

```powershell
pnpm build
pnpm start
```

- [ ] Deploy to Vercel preview and verify:
  - landing
  - gallery
  - login
  - upload
  - text image generation
  - remix generation
  - credits decrement
  - generation history
  - admin gallery edit

**Acceptance:**

- No code imports Cloudflare runtime bindings.
- Vercel preview build passes.
- Core migrated feature works without Wrangler or Supabase.

---

## Phase 12: Optional Production Data Migration

Do this only if source project already has production users, gallery edits, generations, subscriptions, or credits that must be preserved.

**Files:**

- Create: `scripts/migrate-saas-cloudflare-data.ts`
- Create: `docs/migration/data-migration-runbook.md`
- Optional create: `legacy_user_mappings` table if user IDs cannot be mapped by email

### Tasks

- [ ] Export source D1 tables:

```powershell
npx wrangler d1 execute simple-saas --remote --command "SELECT * FROM classic_images;" --json > classic_images.json
npx wrangler d1 execute simple-saas --remote --command "SELECT * FROM generation_jobs;" --json > generation_jobs.json
npx wrangler d1 execute simple-saas --remote --command "SELECT * FROM customers;" --json > customers.json
npx wrangler d1 execute simple-saas --remote --command "SELECT * FROM credits_history;" --json > credits_history.json
npx wrangler d1 execute simple-saas --remote --command "SELECT * FROM subscriptions;" --json > subscriptions.json
```

- [ ] Export or list source R2 objects for generated images.

- [ ] Decide auth migration strategy:
  - Preferred: users sign in again with Better Auth; map old records by email on first login.
  - If historical generation ownership must show immediately: pre-create Better Auth users by email and store a `legacy_user_mappings` table.

- [ ] Import `classic_images` first.

- [ ] Import `generation_jobs` after user mapping exists.

- [ ] Import credit balances as credit packages, not scalar customer credits.

- [ ] Do not import Supabase sessions or password hashes into Better Auth.

- [ ] Dry-run against a staging Postgres database first.

**Acceptance:**

- Row counts match expected export counts.
- Sample users see their historical generations after login.
- Credit balance in target equals source intended balance.
- No duplicate Creem credit grant occurs during import.

---

## Phase 13: Rollout Order

Recommended implementation order:

1. Schema and services.
2. API routes.
3. Gallery and seed data.
4. Studio generation flow.
5. Auth/admin adaptation.
6. Billing/credits integration.
7. Navigation and landing replacement.
8. Hide video UI.
9. Tests.
10. Vercel preview.
11. Optional production data migration.
12. Production deployment.

Each phase should end with:

```powershell
pnpm typecheck
```

Each UI phase should also run:

```powershell
pnpm dev
```

and verify in the browser.

---

## Definition Of Done

- The app deploys to Vercel without OpenNext, Wrangler, D1 bindings, Supabase, or Cloudflare Workers runtime assumptions.
- Target PostgreSQL/Drizzle is the only business database.
- Better Auth is the only login/session system.
- Target `creditService` is the only credit balance system.
- Migrated AI photo features work:
  - public gallery
  - Studio remix
  - Studio text-to-image
  - upload
  - generation history
  - admin gallery management
  - Creem-powered credits
- Video generation code and APIs remain present and buildable.
- Video generation is not visible in landing, navigation, sidebar, sitemap, or dashboard entry points.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`, and migrated tests pass.
- Vercel preview smoke test passes.

---

## Main Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Source uses Cloudflare D1/R2 bindings directly | Rewrite all data/storage access through Drizzle and `getStorage()`. Add a grep gate for `getCloudflareContext`, `D1Database`, `R2Bucket`, `@opennextjs/cloudflare`. |
| Supabase user IDs differ from Better Auth user IDs | For new deployments, ignore legacy IDs. For production migration, create explicit email/legacy ID mapping. |
| Credits double-charge on failed generation | Freeze before provider call, settle only after upload succeeds, release in catch block. |
| In-memory rate limiting breaks on Vercel | Use Postgres-backed `rateLimitEvents`. |
| MiniMax generation exceeds Vercel function duration | Set route `maxDuration`; if still too slow, move image generation to async job + polling in a follow-up. |
| Dynamic R2 image hosts break `next/image` | Use plain `<img>` for generated URLs or configure remote patterns from storage domain. |
| Copying source UI overwrites target shadcn components | Namespace migrated components and reuse target `src/components/ui`. |
| Video routes accidentally remain visible | Add `featureFlags.showVideoFeatures`, update navigation/sitemap/landing, and grep for visible video links before release. |

---

## Verification Grep Gates

Run before final review:

```powershell
rg -n "@opennextjs/cloudflare|@cloudflare/workers-types|getCloudflareContext|D1Database|R2Bucket|wrangler|Supabase|supabase" src package.json next.config.mjs
```

Expected: no runtime source matches except migration docs or intentionally retained comments.

```powershell
rg -n "Text to Video|Image to Video|Reference Video|Sora 2|Veo 3.1|Wan 2.6|Seedance" src/app src/components src/config src/messages
```

Expected: no public UI/sitemap/navigation matches unless guarded by `featureFlags.showVideoFeatures`.

```powershell
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

Expected: all pass before Vercel preview.
