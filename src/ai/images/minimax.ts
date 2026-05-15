export interface MiniMaxGenerateRequest {
  model: string;
  prompt: string;
  aspectRatio?: string;
  imageCount?: number;
}

export interface MiniMaxGenerateResponse {
  base64ImageList?: string[];
  imageUrls?: string[];
}

const DEFAULT_MINIMAX_API_BASE = "https://api.minimaxi.com/v1";

function getMiniMaxApiBase(): string {
  const configuredBase = process.env.MINIMAX_API_URL?.trim();
  if (!configuredBase) {
    return DEFAULT_MINIMAX_API_BASE;
  }

  if (configuredBase.startsWith("https://api.minimax.chat")) {
    return configuredBase.replace("https://api.minimax.chat", "https://api.minimaxi.com");
  }

  if (configuredBase.startsWith("https://api.minimax.io")) {
    return configuredBase.replace("https://api.minimax.io", "https://api.minimaxi.com");
  }

  return configuredBase;
}

function normalizeResponse(payload: unknown): MiniMaxGenerateResponse {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const data = "data" in payload && payload.data && typeof payload.data === "object"
    ? payload.data as Record<string, unknown>
    : payload as Record<string, unknown>;

  const imageUrls = Array.isArray(data.image_urls)
    ? (data.image_urls as string[]).filter((v): v is string => typeof v === "string")
    : Array.isArray(data.imageUrls)
      ? (data.imageUrls as string[]).filter((v): v is string => typeof v === "string")
      : undefined;

  const base64ImageList = Array.isArray(data.image_base64)
    ? (data.image_base64 as string[]).filter((v): v is string => typeof v === "string")
    : Array.isArray(data.base64ImageList)
      ? (data.base64ImageList as string[]).filter((v): v is string => typeof v === "string")
      : undefined;

  return {
    ...(imageUrls ? { imageUrls } : {}),
    ...(base64ImageList ? { base64ImageList } : {}),
  };
}

async function parseMiniMaxResponse(response: Response): Promise<MiniMaxGenerateResponse> {
  const payload = await response.json();

  if (payload && typeof payload === "object" && "base_resp" in payload) {
    const baseResp = payload.base_resp;
    if (
      baseResp &&
      typeof baseResp === "object" &&
      "status_code" in baseResp &&
      baseResp.status_code !== 0
    ) {
      const statusCode = typeof baseResp.status_code === "number" ? baseResp.status_code : "unknown";
      const statusMsg = "status_msg" in baseResp && typeof baseResp.status_msg === "string"
        ? baseResp.status_msg
        : "Unknown MiniMax API error";
      throw new Error(`MiniMax API error: ${statusCode} ${statusMsg}`);
    }
  }

  return normalizeResponse(payload);
}

export async function generateImage(request: MiniMaxGenerateRequest): Promise<MiniMaxGenerateResponse> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not configured");
  }

  const response = await fetch(`${getMiniMaxApiBase()}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: request.model,
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio || "1:1",
      response_format: "url",
      n: request.imageCount || 1,
      prompt_optimizer: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${error}`);
  }

  return parseMiniMaxResponse(response);
}

export async function remixImage(input: {
  prompt: string;
  sourceImageUrl: string;
  aspectRatio?: string;
}): Promise<MiniMaxGenerateResponse> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not configured");
  }

  const response = await fetch(`${getMiniMaxApiBase()}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "image-01",
      prompt: input.prompt,
      aspect_ratio: input.aspectRatio || "16:9",
      subject_reference: [
        {
          type: "character",
          image_file: input.sourceImageUrl,
        },
      ],
      response_format: "url",
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${error}`);
  }

  return parseMiniMaxResponse(response);
}
