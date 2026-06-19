import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("marketing performance boundaries", () => {
  it("does not block public marketing layout rendering on server session lookup", () => {
    const layoutSource = readFileSync(
      join(projectRoot, "src/app/[locale]/(marketing)/layout.tsx"),
      "utf8"
    );

    expect(layoutSource).not.toContain("@/lib/auth");
    expect(layoutSource).not.toContain("getCurrentUser");
  });

  it("does not reference heavyweight PNG assets in homepage marketing content", () => {
    const checkedFiles = [
      "src/components/landing/hero-section.tsx",
      "src/messages/en.json",
      "src/messages/zh.json",
    ];
    const heavyweightPngReferences = checkedFiles.flatMap((filePath) => {
      const source = readFileSync(join(projectRoot, filePath), "utf8");
      const matches = source.matchAll(/\/images\/homepage\/[^"')\s]+\.png/g);

      return Array.from(matches, (match) => match[0]).filter((assetPath) => {
        const assetStats = statSync(join(projectRoot, "public", assetPath));
        return assetStats.size > 1_000_000;
      });
    });

    expect(heavyweightPngReferences).toEqual([]);
  });

  it("does not fetch credit balance from public pricing for anonymous visitors", () => {
    const pricingSource = readFileSync(
      join(projectRoot, "src/components/price/dark-pricing.tsx"),
      "utf8"
    );

    expect(pricingSource).toContain("useCredits(!!effectiveUserId)");
  });

  it("uses auth-aware studio links for homepage creation CTAs", () => {
    const ctaFiles = [
      "src/components/landing/hero-section.tsx",
      "src/components/landing/model-intro-section.tsx",
      "src/components/landing/features-section.tsx",
      "src/components/landing/how-it-works-section.tsx",
      "src/components/landing/cta-section.tsx",
    ];

    for (const filePath of ctaFiles) {
      const source = readFileSync(join(projectRoot, filePath), "utf8");
      expect(source).toContain("StudioLink");
      expect(source).not.toContain('LocaleLink href="/studio"');
    }
  });
});
