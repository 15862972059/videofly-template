// @vitest-environment node

import { beforeEach, describe, expect, test, vi } from "vitest";

const failStaleImageGenerationJobsMock = vi.fn();
const failStaleImageGenerationJobMock = vi.fn();
const releaseMock = vi.fn();

vi.mock("@/services/image/generation-jobs", () => ({
  failStaleImageGenerationJobs: failStaleImageGenerationJobsMock,
  failStaleImageGenerationJob: failStaleImageGenerationJobMock,
}));

vi.mock("@/services/credit", () => ({
  creditService: {
    release: releaseMock,
  },
}));

describe("stale image job reconciliation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  test("fails stale jobs with the expected cutoff and releases their credits", async () => {
    failStaleImageGenerationJobsMock.mockResolvedValue([
      { id: "job_stale_1" },
      { id: "job_stale_2" },
    ]);
    releaseMock.mockResolvedValue(undefined);
    const now = new Date("2026-06-22T00:10:00.000Z");

    const { reconcileStaleImageGenerationJobs } = await import(
      "@/services/image/stale-jobs"
    );
    const jobs = await reconcileStaleImageGenerationJobs("user_1", now);

    expect(failStaleImageGenerationJobsMock).toHaveBeenCalledWith(
      "user_1",
      new Date(now.getTime() - 315_000)
    );
    expect(releaseMock).toHaveBeenCalledTimes(2);
    expect(releaseMock).toHaveBeenNthCalledWith(1, "job_stale_1");
    expect(releaseMock).toHaveBeenNthCalledWith(2, "job_stale_2");
    expect(jobs).toEqual([
      { id: "job_stale_1" },
      { id: "job_stale_2" },
    ]);
  });

  test("does not release credits when no active job was claimed", async () => {
    failStaleImageGenerationJobsMock.mockResolvedValue([]);

    const { reconcileStaleImageGenerationJobs } = await import(
      "@/services/image/stale-jobs"
    );
    await reconcileStaleImageGenerationJobs(
      "user_1",
      new Date("2026-06-22T00:10:00.000Z")
    );

    expect(releaseMock).not.toHaveBeenCalled();
  });

  test("returns the reconciled row for a single polled job", async () => {
    const failedJob = { id: "job_stale", status: "FAILED" };
    failStaleImageGenerationJobMock.mockResolvedValue(failedJob);
    releaseMock.mockResolvedValue(undefined);

    const { reconcileStaleImageGenerationJob } = await import(
      "@/services/image/stale-jobs"
    );
    const result = await reconcileStaleImageGenerationJob(
      "job_stale",
      "user_1",
      new Date("2026-06-22T00:10:00.000Z")
    );

    expect(failStaleImageGenerationJobMock).toHaveBeenCalledWith(
      "job_stale",
      "user_1",
      new Date("2026-06-22T00:04:45.000Z")
    );
    expect(releaseMock).toHaveBeenCalledWith("job_stale");
    expect(result).toEqual(failedJob);
  });
});
