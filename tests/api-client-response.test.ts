// @vitest-environment node

import { describe, expect, test } from "vitest";

import { parseJsonApiResponse } from "@/lib/api/client-response";

describe("parseJsonApiResponse", () => {
  test("returns JSON payloads", async () => {
    await expect(
      parseJsonApiResponse(
        new Response(JSON.stringify({ success: true, data: { id: "job_1" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    ).resolves.toEqual({ success: true, data: { id: "job_1" } });
  });

  test("reports HTML responses without leaking JSON syntax errors", async () => {
    await expect(
      parseJsonApiResponse(
        new Response("<!DOCTYPE html><html><body>Internal Server Error</body></html>", {
          status: 500,
          headers: { "content-type": "text/html" },
        })
      )
    ).rejects.toThrow("The server returned HTML instead of JSON");
  });
});
