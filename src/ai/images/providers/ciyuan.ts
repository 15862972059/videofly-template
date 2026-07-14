import type {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageResolution,
} from "../types";
import { FIXED_IMAGE_OUTPUT } from "../types";
import { configureGlobalFetchProxy } from "@/lib/proxy";

const DEFAULT_TIMEOUT_MS = 300_000;
const DEFAULT_GENERATION_MODEL = "gpt-image-2";
const DEFAULT_EDIT_MODEL = "gpt-image-2";

function getApiBase(): string {
  const configured = process.env.CIYUAN_API_URL?.trim();
  return (configured || "https://ciyuan.today/v1").replace(/\/$/, "");
}

function getApiKey(): string {
  const apiKey = process.env.CIYUAN_API_KEY;
  if (!apiKey) {
    throw new Error("CIYUAN_API_KEY is not configured");
  }
  return apiKey;
}

function normalizeModelOverride(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized || normalized.toLowerCase() === "undefined") {
    return undefined;
  }
  return normalized;
}

function getGenerationModel(): string {
  return normalizeModelOverride(process.env.CIYUAN_IMAGE_GENERATION_MODEL) || DEFAULT_GENERATION_MODEL;
}

function getEditModel(): string {
  return normalizeModelOverride(process.env.CIYUAN_IMAGE_EDIT_MODEL) || DEFAULT_EDIT_MODEL;
}

async function readApiError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    return (
      payload?.error?.message ||
      payload?.message ||
      `CiYuan API error: ${response.status} ${response.statusText}`
    );
  } catch {
    const text = await response.text().catch(() => "");
    return text || `CiYuan API error: ${response.status} ${response.statusText}`;
  }
}

async function readJsonPayload<T>(response: Response, context: string): Promise<T> {
  const responseClone = response.clone();
  try {
    return (await response.json()) as T;
  } catch {
    const bodyPreview = await responseClone
      .text()
      .then((text) => text.trim().slice(0, 120))
      .catch(() => "");

    const suffix = bodyPreview ? ` Response preview: ${bodyPreview}` : "";
    throw new Error(`${context} returned invalid JSON.${suffix}`);
  }
}

/**
 * Text-to-image generation via CiYuan API (OpenAI-compatible).
 * POST /v1/images/generations
 */
export async function generateWithCiyuan(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  configureGlobalFetchProxy();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const body = {
      model: getGenerationModel(),
      prompt: request.prompt,
      size: FIXED_IMAGE_OUTPUT.size,
      quality: FIXED_IMAGE_OUTPUT.quality,
      format: FIXED_IMAGE_OUTPUT.format,
      n: 1,
    };

    console.log(`[ciyuan] Text generation request:`, { model: body.model, size: body.size });

    let response: Response;
    try {
      response = await fetch(`${getApiBase()}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      throw new Error(
        `Failed to call CiYuan image generation API: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const result = await readJsonPayload<{ data?: Array<{ url?: string; b64_json?: string }> }>(
      response,
      "CiYuan image generation"
    );
    const data = result?.data;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("CiYuan image generation returned no data");
    }

    // OpenAI returns either url or b64_json
    const imageUrls: string[] = [];
    const base64ImageList: string[] = [];

    for (const item of data) {
      if (item.url) {
        imageUrls.push(item.url);
      } else if (item.b64_json) {
        base64ImageList.push(item.b64_json);
      }
    }

    if (imageUrls.length === 0 && base64ImageList.length === 0) {
      throw new Error("CiYuan image generation returned empty results");
    }

    return {
      ...(imageUrls.length > 0 ? { imageUrls } : {}),
      ...(base64ImageList.length > 0 ? { base64ImageList } : {}),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `CiYuan image generation timed out after ${Math.round(DEFAULT_TIMEOUT_MS / 1000)}s`
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download image from URL ${url}: ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Image compositing/editing via CiYuan API using standard multipart/form-data.
 * POST /v1/images/edits
 */
export async function remixWithCiyuan(request: {
  prompt: string;
  imageUrls: string[];
  aspectRatio?: string;
  resolution?: ImageResolution;
}): Promise<ImageGenerationResult> {
  configureGlobalFetchProxy();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    console.log(`[ciyuan] Remix request: ${request.imageUrls.length} images`);

    // Download reference images to buffers
    const buffers = await Promise.all(
      request.imageUrls.map((url) => downloadImage(url))
    );

    const formData = new FormData();
    formData.append("model", getEditModel());
    formData.append("prompt", request.prompt);
    formData.append("size", FIXED_IMAGE_OUTPUT.size);
    formData.append("quality", FIXED_IMAGE_OUTPUT.quality);
    formData.append("format", FIXED_IMAGE_OUTPUT.format);
    formData.append("n", "1");

    for (let i = 0; i < buffers.length; i++) {
      const blob = new Blob([buffers[i]], { type: "image/png" });
      formData.append("image", blob, `image_${i}.png`);
    }

    let response: Response;
    try {
      response = await fetch(`${getApiBase()}/images/edits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: formData,
        signal: controller.signal,
      });
    } catch (error) {
      throw new Error(
        `Failed to call CiYuan image edit API: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const result = await readJsonPayload<{ data?: Array<{ url?: string; b64_json?: string }> }>(
      response,
      "CiYuan image edit"
    );
    const data = result?.data;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("CiYuan image edit returned no data");
    }

    const imageUrls: string[] = [];
    const base64ImageList: string[] = [];

    for (const item of data) {
      if (item.url) {
        imageUrls.push(item.url);
      } else if (item.b64_json) {
        base64ImageList.push(item.b64_json);
      }
    }

    if (imageUrls.length === 0 && base64ImageList.length === 0) {
      throw new Error("CiYuan image edit returned empty results");
    }

    return {
      ...(imageUrls.length > 0 ? { imageUrls } : {}),
      ...(base64ImageList.length > 0 ? { base64ImageList } : {}),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `CiYuan image edit timed out after ${Math.round(DEFAULT_TIMEOUT_MS / 1000)}s`
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
