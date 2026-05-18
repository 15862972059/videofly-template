import type { ImageGenerationRequest, ImageGenerationResult } from "../types";

const DEFAULT_API_BASE = "https://api.minimaxi.com/v1";

function getApiBase(): string {
  const configured = process.env.MINIMAX_API_URL?.trim();
  if (!configured) return DEFAULT_API_BASE;
  if (configured.includes("api.minimax.chat")) {
    return configured.replace("api.minimax.chat", "api.minimaxi.com");
  }
  return configured;
}

function normalizeResponse(payload: unknown): ImageGenerationResult {
  if (!payload || typeof payload !== "object") return {};

  const data =
    "data" in payload && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : (payload as Record<string, unknown>);

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

async function parseResponse(response: Response): Promise<ImageGenerationResult> {
  const payload = await response.json();

  if (payload && typeof payload === "object" && "base_resp" in payload) {
    const baseResp = payload.base_resp;
    if (
      baseResp &&
      typeof baseResp === "object" &&
      "status_code" in baseResp &&
      baseResp.status_code !== 0
    ) {
      throw new Error(
        `MiniMax API error: ${baseResp.status_code} ${baseResp.status_msg || "Unknown"}`
      );
    }
  }

  return normalizeResponse(payload);
}

export async function generateWithMiniMax(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not configured");
  }

  const response = await fetch(`${getApiBase()}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "image-01",
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio || "1:1",
      response_format: "url",
      n: 1,
      prompt_optimizer: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${error}`);
  }

  return parseResponse(response);
}

export async function remixWithMiniMax(request: {
  prompt: string;
  sourceImageUrl: string;
  aspectRatio?: string;
}): Promise<ImageGenerationResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not configured");
  }

  const response = await fetch(`${getApiBase()}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "image-01",
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio || "16:9",
      subject_reference: [
        {
          type: "character",
          image_file: request.sourceImageUrl,
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

  return parseResponse(response);
}
