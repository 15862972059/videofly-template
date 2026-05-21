const REMIX_PROMPT_MARKER = "Treat the selected scene image as the authoritative background";

export function buildRemixSystemPrompt(_classicTitle: string): string {
  return [
    `${REMIX_PROMPT_MARKER}. The first reference image is the scene; keep the scene, framing, and major background details as unchanged as possible.`,
    "The second reference image is the person; keep the person's identity, face, hairstyle, gender presentation, clothing, and overall look unchanged.",
    "Use the reference images as the only source of truth for both the scene and the person. Do not infer or replace scene or person details from titles or text.",
    "This is image compositing, not scene redesign. Place the person naturally into the existing scene with realistic scale, lighting, perspective, shadows, and occlusion. Do not create a new location, heavily alter the scene or outfit, or add extra people, extra limbs, or duplicate body parts.",
  ].join(" ");
}

export function isGeneratedRemixPrompt(prompt: string): boolean {
  return prompt.trimStart().startsWith(REMIX_PROMPT_MARKER);
}

export function buildRemixPrompt(input: {
  classicTitle: string;
  classicCategory: string;
  userPrompt?: string;
  promptTemplate: string;
}): string {
  const userDetails = input.userPrompt?.trim();
  const parts = [buildRemixSystemPrompt(input.classicTitle)];

  if (userDetails) {
    parts.push(
      `Additional refinement request: ${userDetails}. This must not override the scene and identity preservation rules.`
    );
  }

  return parts.join(" ");
}

export function inferRemixAspectRatio(input: {
  classicTitle: string;
  heroImageUrl?: string | null;
}): "16:9" | "3:4" {
  const sceneSignals = `${input.classicTitle} ${input.heroImageUrl ?? ""}`.toLowerCase();
  if (sceneSignals.includes("scenic") || sceneSignals.includes("_001")) {
    return "16:9";
  }

  return "3:4";
}

export function buildTextPrompt(input: {
  userPrompt: string;
  style?: string;
}): string {
  if (input.style) {
    return `${input.userPrompt}. Style: ${input.style}`;
  }
  return input.userPrompt;
}
