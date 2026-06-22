// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  remixRequestSchema,
  textGenerationRequestSchema,
} from "@/lib/validators/image";

describe("fixed image request schemas", () => {
  test("strips legacy text output controls", () => {
    expect(
      textGenerationRequestSchema.parse({
        prompt: "A quiet mountain lake",
        aspectRatio: "16:9",
        model: "gpt-image-2",
        quality: "auto",
        resolution: "4k",
      })
    ).toEqual({ prompt: "A quiet mountain lake" });
  });

  test("strips legacy remix output controls", () => {
    expect(
      remixRequestSchema.parse({
        classicImageId: "classic_1",
        sourceImageKey: "images/user/source.jpg",
        prompt: "Use softer light",
        aspectRatio: "9:16",
        model: "gpt-image-2",
        quality: "auto",
        resolution: "2k",
      })
    ).toEqual({
      classicImageId: "classic_1",
      sourceImageKey: "images/user/source.jpg",
      prompt: "Use softer light",
    });
  });
});
