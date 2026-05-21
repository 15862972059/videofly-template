import { readFile } from "node:fs/promises";
import path from "node:path";

export type ObjectKind = "source" | "result";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function getMaxUploadSize(): number {
  return Number.parseInt(process.env.MAX_UPLOAD_MB ?? "10") * 1024 * 1024;
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

function isLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".localhost")
  );
}

function isPublicHttpsBaseUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !isLocalHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function resolvePublicImageUrl(
  imageUrl: string,
  options: {
    publicBaseUrl?: string;
    fallbackBaseUrl?: string;
  } = {}
): string {
  try {
    return new URL(imageUrl).toString();
  } catch {
    const configuredBase =
      options.publicBaseUrl ??
      process.env.NEXT_PUBLIC_ASSET_BASE_URL ??
      process.env.NEXT_PUBLIC_APP_URL;
    const fallbackBase = options.fallbackBaseUrl ?? "https://ai2art.net";
    const base = isPublicHttpsBaseUrl(configuredBase)
      ? configuredBase
      : fallbackBase;

    return new URL(imageUrl, base).toString();
  }
}

function getSceneAssetMimeType(filePath: string): string {
  const normalized = filePath.toLowerCase();
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }
  if (normalized.endsWith(".gif")) {
    return "image/gif";
  }
  return "image/png";
}

function getLocalSceneAssetPath(imageUrl: string): { pathname: string; absolutePath: string } | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/^['"]|['"]$/g, "");
  const appHost = appUrl
    ? (() => {
        try {
          return new URL(appUrl).hostname.toLowerCase();
        } catch {
          return null;
        }
      })()
    : null;

  let pathname: string | null = null;

  if (imageUrl.startsWith("/")) {
    pathname = imageUrl;
  } else {
    try {
      const parsed = new URL(imageUrl);
      const host = parsed.hostname.toLowerCase();
      if (
        host === "ai2art.net" ||
        host === "www.ai2art.net" ||
        (appHost !== null && host === appHost)
      ) {
        pathname = parsed.pathname;
      }
    } catch {
      pathname = null;
    }
  }

  if (!pathname?.startsWith("/images/")) {
    return null;
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const absolutePath = path.resolve(publicRoot, `.${decodeURIComponent(pathname)}`);
  if (
    absolutePath !== publicRoot &&
    !absolutePath.startsWith(`${publicRoot}${path.sep}`)
  ) {
    return null;
  }

  return { pathname, absolutePath };
}

function buildSceneAssetStorageKey(pathname: string): string {
  const normalized = pathname
    .replace(/^\/+/, "")
    .replace(/[\\/]/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  return `images/system/scenes/${normalized}`;
}

interface SceneAssetStorage {
  uploadFile(params: {
    key: string;
    body: Buffer;
    contentType?: string;
  }): Promise<{ url: string; key: string }>;
}

export async function resolveSceneReferenceImageUrl(
  imageUrl: string,
  storage: SceneAssetStorage
): Promise<string> {
  const localAsset = getLocalSceneAssetPath(imageUrl);
  if (!localAsset) {
    return resolvePublicImageUrl(imageUrl);
  }

  const body = await readFile(localAsset.absolutePath);
  const uploaded = await storage.uploadFile({
    key: buildSceneAssetStorageKey(localAsset.pathname),
    body,
    contentType: getSceneAssetMimeType(localAsset.absolutePath),
  });

  return uploaded.url;
}

export function validateSourceImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return false;
    }

    if (isLocalHost(parsed.hostname)) {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (host.includes("example.com") || host.includes("example.org") || host.includes("example.net")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
