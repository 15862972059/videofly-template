type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type CreemModerationDecision = "allow" | "flag" | "deny";

interface CreemModerationResponse {
  decision?: CreemModerationDecision;
}

interface AssertCreemPromptAllowedOptions {
  apiKey?: string;
  externalId?: string;
  fetcher?: Fetcher;
  timeoutMs?: number;
}

export class CreemModerationRejectedError extends Error {
  constructor() {
    super("Your prompt violates our content policy. Please revise it and try again.");
    this.name = "CreemModerationRejectedError";
  }
}

export class CreemModerationUnavailableError extends Error {
  constructor(message = "Creem moderation is temporarily unavailable") {
    super(message);
    this.name = "CreemModerationUnavailableError";
  }
}

export function resolveCreemModerationBaseUrl(apiKey: string): string {
  return apiKey.startsWith("creem_test_")
    ? "https://test-api.creem.io"
    : "https://api.creem.io";
}

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined" || !("timeout" in AbortSignal)) {
    return undefined;
  }

  return AbortSignal.timeout(timeoutMs);
}

export async function assertCreemPromptAllowed(
  prompt: string,
  options: AssertCreemPromptAllowedOptions = {}
): Promise<void> {
  const apiKey = options.apiKey ?? process.env.CREEM_API_KEY;
  if (!apiKey) {
    throw new CreemModerationUnavailableError("Creem moderation is not configured");
  }

  const fetcher = options.fetcher ?? fetch;
  const baseUrl = resolveCreemModerationBaseUrl(apiKey);

  let response: Response;
  try {
    response = await fetcher(`${baseUrl}/v1/moderation/prompt`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        prompt,
        external_id: options.externalId,
      }),
      signal: createTimeoutSignal(options.timeoutMs ?? 5000),
    });
  } catch (error) {
    throw new CreemModerationUnavailableError(
      error instanceof Error ? error.message : "Creem moderation request failed"
    );
  }

  if (!response.ok) {
    throw new CreemModerationUnavailableError(
      `Creem moderation returned HTTP ${response.status}`
    );
  }

  let result: CreemModerationResponse;
  try {
    result = (await response.json()) as CreemModerationResponse;
  } catch {
    throw new CreemModerationUnavailableError("Creem moderation returned invalid JSON");
  }

  if (result.decision === "allow") {
    return;
  }

  if (result.decision === "deny" || result.decision === "flag") {
    throw new CreemModerationRejectedError();
  }

  throw new CreemModerationUnavailableError("Creem moderation returned an unknown decision");
}
