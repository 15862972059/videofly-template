# Fast Image Generation Design

## Goal

Make text-to-image and Remix generation finish reliably within the current Vercel execution budget by fixing all image output to the fastest supported product specification:

- Model: `gpt-image-2`
- Size: `1024x1024`
- Quality: `low`
- Format: JPEG
- Credit cost: 1 credit per generation

The application must retain its existing persisted job history and polling flow. It must not copy the reference application's synchronous request architecture.

## Product Behavior

The Studio no longer offers resolution, quality, or aspect-ratio controls for text-to-image or Remix. Both tools show the fixed output specification so users understand what will be generated and charged.

The generated preview is square. Existing historic images keep their original dimensions and remain viewable.

## Server Enforcement

The server is the source of truth. It always sends `size: "1024x1024"`, `quality: "low"`, and `format: "jpeg"` to CiYuan for both generation and Remix requests.

Legacy clients may continue sending resolution, quality, or aspect-ratio fields during rollout, but the server ignores those values. New Studio requests omit them. Persisted job parameters record the effective fixed specification rather than the ignored client values.

Image model configuration exposes only the fixed 1K option and a one-credit cost. No API request can select 2K, 4K, PNG, or a non-square output.

## Storage

Generated images are persisted with a `.jpg` object key and `image/jpeg` content type. The service accepts either an upstream URL or Base64 response, as it does today, then stores the result in the configured object storage.

## Job Lifecycle And Recovery

The current flow remains:

1. Create a database job and freeze one credit.
2. Return HTTP 202 with the local job ID.
3. Run generation after the response.
4. Poll the local job endpoint until success or failure.
5. Settle the credit on success or release it on failure.

Because a Vercel process can be terminated before its catch block runs, status and history reads also reconcile stale jobs. A `QUEUED` or `RUNNING` job with no update for more than 5 minutes 15 seconds is atomically changed to `FAILED`, receives a timeout error, and has its frozen credit released. The threshold is longer than the route's 300-second maximum invocation time, so a live invocation is not reclaimed prematurely.

The client polls for 5 minutes 30 seconds, allowing the stale-job reconciliation response to surface the real timeout error instead of the generic "still running" message.

## Generation History

History displays succeeded, queued, running, and failed jobs. Pending jobs show progress, failed jobs show their error, and succeeded jobs remain selectable and downloadable. Loading history triggers stale-job reconciliation for that user, which also recovers previously abandoned jobs and releases their credit holds.

## Long-Term Constraint

`AGENTS.md` receives a prominent image-generation invariant stating that text-to-image and Remix must remain fixed to `1024x1024`, low quality, JPEG, and one credit unless a future change also introduces execution infrastructure that safely supports slower outputs. Frontend-only defaults are explicitly insufficient; the provider request must enforce the invariant.

## Testing

Automated tests cover:

- CiYuan text and Remix requests always contain the fixed size, quality, and format.
- Legacy client parameters cannot change the effective specification or credit cost.
- Generated object keys and content types are JPEG.
- Stale queued/running jobs are failed and their holds are released.
- Fresh and terminal jobs are not reclaimed.
- History includes all statuses rather than only successful jobs.

Verification includes the focused tests, the complete test suite, TypeScript checking, linting of changed files, and a production build.

## Out Of Scope

- Adding a third-party queue or worker service.
- Upgrading the Vercel plan or increasing `maxDuration`.
- Supporting 2K, 4K, PNG, variable quality, or variable output ratios.
- Rewriting existing historic image records.
