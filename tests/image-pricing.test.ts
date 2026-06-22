// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  IMAGE_MODELS,
  getImageCreditCost,
  getImageQualityOptions,
  getImageResolutionOptions,
  getSupportedAspectRatios,
  resolveImageProviderModel,
  resolveImageProviderSettings,
} from "@/ai/images/types";
import {
  CREDIT_PACKAGES,
  NEW_USER_GIFT,
  SUBSCRIPTION_PRODUCTS,
} from "@/config/pricing-user";
import { priceDataMap } from "@/config/price/price-data";

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
      "low",
    ]);
  });

  test("exposes only the fixed fast output contract", () => {
    expect(getImageResolutionOptions("gpt-image-2").map((option) => option.value)).toEqual([
      "1k",
    ]);
    expect(getSupportedAspectRatios("gpt-image-2")).toEqual(["1:1"]);
    expect(getImageCreditCost("gpt-image-2", "low" as never, "1k")).toBe(1);
  });

  test("quality choices map to the correct provider fields", () => {
    expect(resolveImageProviderSettings("gpt-image-2", "low" as never)).toEqual({
      quality: "low",
      resolution: "1k",
    });
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
