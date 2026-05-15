export type ObjectKind = "source" | "result";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function getMaxUploadSize(): number {
  return parseInt(process.env.MAX_UPLOAD_MB ?? "10") * 1024 * 1024;
}

export function isValidMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= getMaxUploadSize();
}

export function buildImageObjectKey(input: {
  userId: string;
  kind: ObjectKind;
  filename: string;
}): string {
  const sanitized = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `images/${input.userId}/${input.kind}/${Date.now()}-${sanitized}`;
}

export function validateSourceImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (parsed.protocol !== "https:") {
      return false;
    }

    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".localhost")
    ) {
      return false;
    }

    if (host.includes("example.com") || host.includes("example.org") || host.includes("example.net")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
