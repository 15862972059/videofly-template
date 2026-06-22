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

  it("keeps both studio tools on the fixed fast output contract", () => {
    const textSource = readFileSync(
      join(projectRoot, "src/components/studio/text-to-image.tsx"),
      "utf8"
    );
    const remixSource = readFileSync(
      join(projectRoot, "src/components/studio/remix-workspace.tsx"),
      "utf8"
    );
    const promptSource = readFileSync(
      join(projectRoot, "src/components/studio/prompt-panel.tsx"),
      "utf8"
    );

    expect(textSource).toContain('t("fixedOutput")');
    expect(textSource).not.toContain("setResolution");
    expect(textSource).not.toContain("aspectRatioOptions");
    expect(remixSource).toContain('t("fixedOutput")');
    expect(remixSource).not.toContain("setResolution");
    expect(remixSource).not.toContain("setAspectRatio");
    expect(promptSource).toContain('t("fixedOutput")');
    expect(promptSource).not.toContain("onResolutionChange");
    expect(promptSource).not.toContain("onAspectRatioChange");
  });

  it("does not hide pending and failed jobs from generation history", () => {
    const historySource = readFileSync(
      join(projectRoot, "src/app/[locale]/(dashboard)/generations/page.tsx"),
      "utf8"
    );

    expect(historySource).not.toContain('j.status === "succeeded"');
  });
});
