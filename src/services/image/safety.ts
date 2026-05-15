const BLOCKED_TERMS = [
  "graphic violence", "gore", "mutilation", "dismemberment", "torture",
  "self-harm", "suicide", "hanging", "execution", "massacre",
  "sexual minor", "child", "underage", "lolita", "teen nude", "pedo",
  "jailbait", "preteen", "toddlercon",
  "celebrity deepfake", "deepfake", "face swap celebrity",
  "non-consensual", "revenge porn", "upskirt", "voyeur",
  "hate symbol", "terrorist", "extremist", "genocide",
  "racial slur", "white power", "nazi",
];

export function assertPromptAllowed(prompt: string): void {
  const lowerPrompt = prompt.toLowerCase();

  for (const term of BLOCKED_TERMS) {
    if (lowerPrompt.includes(term.toLowerCase())) {
      throw new Error(`Prompt blocked by safety policy: contains "${term}"`);
    }
  }
}

export function isPromptAllowed(prompt: string): boolean {
  try {
    assertPromptAllowed(prompt);
    return true;
  } catch {
    return false;
  }
}

export function getBlockedTerms(): string[] {
  return [...BLOCKED_TERMS];
}
