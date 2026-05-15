import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError, apiError } from "@/lib/api/response";
import { getStorage } from "@/lib/storage";
import { buildImageObjectKey, isValidMimeType, isValidFileSize } from "@/services/image/storage";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "source";

    if (!file) {
      return apiError("No file provided", 400);
    }

    if (!isValidMimeType(file.type)) {
      return apiError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF", 400);
    }

    if (!isValidFileSize(file.size)) {
      return apiError("File too large", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = buildImageObjectKey({
      userId: user.id,
      kind: kind as "source" | "result",
      filename: file.name,
    });

    const storage = getStorage();
    const uploaded = await storage.uploadFile({
      key,
      body: buffer,
      contentType: file.type,
    });

    return apiSuccess({
      objectKey: uploaded.key,
      publicUrl: uploaded.url,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
