// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  IMAGE_MODELS,
  getImageCreditCost,
  getImageQualityOptions,
  resolveImageProviderModel,
  resolveImageProviderSettings,
} from "@/ai/images/types";
import {
  CREDIT_PACKAGES,
  NEW_USER_GIFT,
  SUBSCRIPTION_PRODUCTS,
} from "@/config/pricing-user";
import { priceDataMap } from "@/config/price/price-data";

const ESTIMATED_VENDOR_COST_USD: Record<string, number> = {
  "gpt-image-2:auto": 0.047,
};

function cheapestPaidCreditValueUsd(): number {
  const products = [...SUBSCRIPTION_PRODUCTS, ...CREDIT_PACKAGES].filter(
    (product) => product.enabled
  );
  return Math.min(
    ...products.map((product) => product.priceUsd / product.credits)
  );
}

describe("image generation pricing", () => {
  test("new users receive at least one free credit", () => {
    expect(NEW_USER_GIFT.credits).toBeGreaterThanOrEqual(1);
  });

  test("enabled models expose model-specific quality options", () => {
    const enabledModels = Object.entries(IMAGE_MODELS)
      .filter(([, config]) => config.isEnabled)
      .map(([model]) => model);

    expect(enabledModels).toEqual([
      "gpt-image-2",
    ]);
    expect(getImageQualityOptions("gpt-image-2").map((option) => option.value)).toEqual([
      "auto",
    ]);
  });

  test("site credits preserve at least 40 percent gross margin at the best paid rate", () => {
    const creditValueUsd = cheapestPaidCreditValueUsd();

    for (const [key, vendorCostUsd] of Object.entries(ESTIMATED_VENDOR_COST_USD)) {
      const [model, quality] = key.split(":");
      const revenueUsd = getImageCreditCost(
        model as keyof typeof IMAGE_MODELS,
        quality as never
      ) * creditValueUsd;
      const margin = (revenueUsd - vendorCostUsd) / revenueUsd;

      expect(margin, key).toBeGreaterThanOrEqual(0.4);
    }
  });

  test("quality choices map to the correct provider fields", () => {
    expect(resolveImageProviderSettings("gpt-image-2", "auto")).toEqual({});
  });

  test("site model names map to official model ids", () => {
    expect(resolveImageProviderModel("gpt-image-2")).toBe("gpt-image-2");
  });

  test("pricing page data only includes enabled monthly subscription credits", () => {
    expect(priceDataMap.en.find((plan) => plan.id === "basic")?.credits).toEqual({
      monthly: 80,
      yearly: 0,
    });
    expect(priceDataMap.en.find((plan) => plan.id === "pro")?.credits).toEqual({
      monthly: 220,
      yearly: 0,
    });
    expect(priceDataMap.en.find((plan) => plan.id === "ultimate")?.credits).toEqual({
      monthly: 700,
      yearly: 0,
    });
  });
});
