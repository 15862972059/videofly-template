interface ImageResultStorage {
  downloadAndUpload(params: {
    sourceUrl: string;
    key: string;
    contentType?: string;
  }): Promise<{ url: string; key: string }>;
  uploadFile(params: {
    key: string;
    body: Buffer;
    contentType?: string;
  }): Promise<{ url: string; key: string }>;
}

export interface PersistGeneratedImageInput {
  imageData: string;
  key: string;
  contentType?: string;
  storage: ImageResultStorage;
  allowTemporaryUrlFallback?: boolean;
}

export interface PersistGeneratedImageResult {
  key: string;
  url: string;
  temporary: boolean;
}

export function shouldAllowTemporaryImageUrlFallback(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.IMAGE_STORAGE_TEMPORARY_FALLBACK !== "false"
  );
}

export async function persistGeneratedImage(
  input: PersistGeneratedImageInput
): Promise<PersistGeneratedImageResult> {
  if (input.imageData.startsWith("http")) {
    try {
      const uploaded = await input.storage.downloadAndUpload({
        sourceUrl: input.imageData,
        key: input.key,
        contentType: input.contentType,
      });
      return { ...uploaded, temporary: false };
    } catch (error) {
      if (input.allowTemporaryUrlFallback) {
        console.warn(
          "[image-persist] Storage upload failed; using temporary provider URL in development.",
          error
        );
        return {
          key: `temporary:${input.key}`,
          url: input.imageData,
          temporary: true,
        };
      }

      throw new Error(
        `Failed to save generated image to storage: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  const uploaded = await input.storage.uploadFile({
    key: input.key,
    body: Buffer.from(input.imageData, "base64"),
    contentType: input.contentType,
  });
  return { ...uploaded, temporary: false };
}
