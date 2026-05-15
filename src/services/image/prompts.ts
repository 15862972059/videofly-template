export function buildRemixPrompt(input: {
  classicTitle: string;
  classicCategory: string;
  userPrompt?: string;
  promptTemplate: string;
}): string {
  const userDetails = input.userPrompt?.trim();
  const parts = [
    `Blend the referenced person naturally into the scene ${input.classicTitle}`,
    `${input.classicCategory} scene`,
    input.promptTemplate,
    "Keep the person's identity recognizable and place them realistically within the destination",
    "Keep the original clothing, hairstyle, body shape, and facial features unless the user explicitly asks for a change",
    "Preserve the selected scenic background composition, landmark placement, camera framing, and overall environment",
    "Use a full-body composition whenever possible and keep the entire person visible from head to toe",
    "Do not crop the person, do not zoom in to a half-body portrait, and do not blur the face or background",
    "Match perspective, scale, lighting, shadows, and color grading to the environment",
    "photorealistic travel photo, natural composition, high detail, sharp focus, crisp facial details",
    userDetails || "natural pose, believable integration, clean facial details",
  ];

  return parts.join(". ");
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
