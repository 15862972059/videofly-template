// @vitest-environment node

import { expect, test } from "vitest";

import {
  buildRemixPrompt,
  buildRemixSystemPrompt,
  isGeneratedRemixPrompt,
} from "@/services/image/prompts";

test("builds a remix system prompt that preserves both scene and person", () => {
  const prompt = buildRemixSystemPrompt("Kyoto Lantern Street");

  expect(prompt).toContain(
    "Treat the selected scene image as the authoritative background"
  );
  expect(prompt).toContain("The first reference image is the scene");
  expect(prompt).toContain("The second reference image is the person");
  expect(prompt).toContain("keep the scene, framing, and major background details");
  expect(prompt).toContain(
    "keep the person's identity, face, hairstyle, gender presentation, clothing"
  );
  expect(prompt).toContain("Use the reference images as the only source of truth");
  expect(prompt).toContain(
    "Do not infer or replace scene or person details from titles or text"
  );
  expect(prompt).toContain("This is image compositing, not scene redesign");
  expect(prompt).not.toContain("Kyoto Lantern Street");
});

test("appends user refinements without weakening preservation rules", () => {
  const prompt = buildRemixPrompt({
    classicTitle: "Kyoto Lantern Street",
    classicCategory: "travel",
    promptTemplate: "warm lantern street at dusk",
    userPrompt: "Make the integration more cinematic and slightly warmer.",
  });

  expect(prompt).toContain("Additional refinement request");
  expect(prompt).toContain("Make the integration more cinematic and slightly warmer.");
  expect(prompt).toContain("must not override the scene and identity preservation rules");
});

test("detects generated remix prompts so the backend does not duplicate them", () => {
  const generated = buildRemixSystemPrompt("Kyoto Lantern Street");
  const freeform = "Place this person in a lantern street at dusk";

  expect(isGeneratedRemixPrompt(generated)).toBe(true);
  expect(isGeneratedRemixPrompt(freeform)).toBe(false);
});
