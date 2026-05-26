export async function parseJsonApiResponse<T = unknown>(
  response: Response
): Promise<T> {
  const rawText = await response.text();
  const text = rawText.trim();

  if (!text) {
    throw new Error(`The server returned an empty response (HTTP ${response.status}).`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const contentType = response.headers.get("content-type") || "";
    const preview = text.replace(/\s+/g, " ").slice(0, 120);

    if (contentType.includes("text/html") || text.startsWith("<")) {
      throw new Error(
        `The server returned HTML instead of JSON (HTTP ${response.status}). Check the API route logs. Preview: ${preview}`
      );
    }

    throw new Error(
      `The server returned invalid JSON (HTTP ${response.status}). Preview: ${preview}`
    );
  }
}
