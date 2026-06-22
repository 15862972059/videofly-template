import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { textGenerationRequestSchema } from "@/lib/validators/image";
import {
  runStartedTextImageGeneration,
  startTextImageGeneration,
} from "@/services/image/image-generation";
import { after } from "next/server";

export const maxDuration = 300;

function classifyError(error: unknown) {
  if (!(error instanceof Error)) return { message: "Internal server error", status: 500 };

  const msg = error.message;

  if (msg.includes("Insufficient credits")) {
    return { message: "Insufficient credits. Please purchase more credits to continue.", status: 402 };
  }
  if (msg.includes("Rate limit exceeded")) {
    return { message: "Rate limit exceeded. Please wait a moment and try again.", status: 429 };
  }
  if (msg.includes("not configured")) {
    return { message: "Image generation is not available at the moment. Please try again later.", status: 503 };
  }
  if (msg.includes("blocked by safety policy")) {
    return { message: "Your prompt was blocked by safety policy. Please modify your prompt and try again.", status: 400 };
  }
  if (msg.includes("violates our content policy")) {
    return { message: "Your prompt violates our content policy. Please revise it and try again.", status: 400 };
  }
  if (msg.includes("Creem moderation")) {
    return { message: "Content safety screening is temporarily unavailable. Please try again shortly.", status: 503 };
  }

  return { message: process.env.NODE_ENV === "development" ? msg : "Internal server error", status: 500 };
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const parsed = textGenerationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid request", 400, parsed.error.flatten());
    }

    const started = await startTextImageGeneration({
      userId: user.id,
      prompt: parsed.data.prompt,
    });

    after(async () => {
      try {
        await runStartedTextImageGeneration(started.task);
      } catch (error) {
        console.error("[text-generate] Background task failed:", error);
      }
    });

    return apiSuccess(started.response, 202);
  } catch (error) {
    const { message, status } = classifyError(error);
    console.error("[text-generate] Error:", error instanceof Error ? error.stack : error);
    return apiError(message, status);
  }
}
