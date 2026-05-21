import { NextResponse } from "next/server";

const DOWNLOAD_TIMEOUT_MS = 15_000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ success: false, error: { message: "Missing url parameter" } }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    const allowedHosts = [
      process.env.STORAGE_DOMAIN,
      "r2.cloudflarestorage.com",
      "cloudflarestorage.com",
      "amazonaws.com",
      "s3.amazonaws.com",
    ].filter(Boolean) as string[];

    const isAllowed = allowedHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );

    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && !isAllowed) {
      return NextResponse.json({ success: false, error: { message: "URL not allowed" } }, { status: 403 });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: { Accept: "image/*" },
        signal: controller.signal,
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: { message: `Upstream error: ${response.status}` } },
          { status: 502 }
        );
      }

      const contentType = response.headers.get("content-type") || "image/png";

      // Stream the response directly - no buffering
      return new Response(response.body, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": 'attachment; filename="ai-art-generation.png"',
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: { message: "Download timed out" } },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: error instanceof Error ? error.message : "Download failed" } },
      { status: 500 }
    );
  }
}
