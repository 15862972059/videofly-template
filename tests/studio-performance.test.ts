import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("studio performance boundaries", () => {
  it("keeps expensive studio tab panels mounted while switching tabs", () => {
    const source = readFileSync(
      join(projectRoot, "src/app/[locale]/(tool)/studio/StudioContent.tsx"),
      "utf8"
    );

    expect(source).toContain('hidden={activeTab !== "remix"}');
    expect(source).toContain('hidden={activeTab !== "text2img"}');
  });
});
