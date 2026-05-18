import type { ImageGenerationRequest, ImageGenerationResult } from "../types";

// Replicate API base
const REPLICATE_API_BASE = "https://api.replicate.com/v1";

// Map our aspect ratio to Replicate format
function mapAspectRatio(ratio: string | undefined): string {
  switch (ratio) {
    case "16:9":
      return "16:9";
    case "9:16":
      return "9:16";
    case "3:4":
      return "3:4";
    case "1:1":
    default:
      return "1:1";
  }
}

export async function generateWithFluxSchnell(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  // Get the latest version of flux-schnell
  const modelRes = await fetch(
    `${REPLICATE_API_BASE}/models/black-forest-labs/flux-schnell`,
    { headers: { Authorization: `Bearer ${apiToken}` } }
  );

  if (!modelRes.ok) {
    throw new Error(`Failed to get model info: ${modelRes.status}`);
  }

  const modelData = await modelRes.json();
  const version = modelData.latest_version?.id;
  if (!version) {
    throw new Error("Could not find flux-schnell version");
  }

  // Create prediction
  const predRes = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version,
      input: {
        prompt: request.prompt,
        aspect_ratio: mapAspectRatio(request.aspectRatio),
        num_outputs: 1,
        num_inference_steps: 4,
      },
    }),
  });

  if (!predRes.ok) {
    const error = await predRes.text();
    throw new Error(`Failed to create prediction: ${error}`);
  }

  let prediction = await predRes.json();

  // Poll for result
  if (prediction.urls?.get) {
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      const getRes = await fetch(prediction.urls.get, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      prediction = await getRes.json();

      if (prediction.status === "succeeded") break;
      if (prediction.status === "failed") {
        throw new Error(prediction.error || "Generation failed");
      }
    }
  }

  if (prediction.status !== "succeeded") {
    throw new Error("Prediction timed out");
  }

  const output = prediction.output;
  if (!output) {
    throw new Error("No output from model");
  }

  // Output can be an array of URLs
  const urls = Array.isArray(output) ? output : [output];
  return { imageUrls: urls.filter((u): u is string => typeof u === "string") };
}

export async function generateWithGptImage2(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  // First get model info
  const modelRes = await fetch(
    `${REPLICATE_API_BASE}/models/goodex/gpt-image-2`,
    { headers: { Authorization: `Bearer ${apiToken}` } }
  );

  if (!modelRes.ok) {
    throw new Error(`Failed to get model info: ${modelRes.status}`);
  }

  const modelData = await modelRes.json();
  const version = modelData.latest_version?.id;
  if (!version) {
    throw new Error("Could not find gpt-image-2 version");
  }

  // Create prediction
  const predRes = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version,
      input: {
        prompt: request.prompt,
        aspect_ratio: mapAspectRatio(request.aspectRatio),
      },
    }),
  });

  if (!predRes.ok) {
    const error = await predRes.text();
    throw new Error(`Failed to create prediction: ${error}`);
  }

  let prediction = await predRes.json();

  // Poll for result
  if (prediction.urls?.get) {
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 1000));

      const getRes = await fetch(prediction.urls.get, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      prediction = await getRes.json();

      if (prediction.status === "succeeded") break;
      if (prediction.status === "failed") {
        throw new Error(prediction.error || "Generation failed");
      }
    }
  }

  if (prediction.status !== "succeeded") {
    throw new Error("Prediction timed out");
  }

  const output = prediction.output;
  if (!output) {
    throw new Error("No output from model");
  }

  const urls = Array.isArray(output) ? output : [output];
  return { imageUrls: urls.filter((u): u is string => typeof u === "string") };
}

export async function generateWithNanoBanana2(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  // First get model info
  const modelRes = await fetch(
    `${REPLICATE_API_BASE}/models/google/nano-banana-2`,
    { headers: { Authorization: `Bearer ${apiToken}` } }
  );

  if (!modelRes.ok) {
    throw new Error(`Failed to get model info: ${modelRes.status}`);
  }

  const modelData = await modelRes.json();
  const version = modelData.latest_version?.id;
  if (!version) {
    throw new Error("Could not find nano-banana-2 version");
  }

  // Create prediction
  const predRes = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      version,
      input: {
        prompt: request.prompt,
        aspect_ratio: "1:1", // Only 1:1 supported
      },
    }),
  });

  if (!predRes.ok) {
    const error = await predRes.text();
    throw new Error(`Failed to create prediction: ${error}`);
  }

  const prediction = await predRes.json();

  if (prediction.status === "failed") {
    throw new Error(prediction.error || "Generation failed");
  }

  if (prediction.status !== "succeeded") {
    throw new Error("Prediction timed out");
  }

  const output = prediction.output;
  if (!output) {
    throw new Error("No output from model");
  }

  const urls = Array.isArray(output) ? output : [output];
  return { imageUrls: urls.filter((u): u is string => typeof u === "string") };
}
