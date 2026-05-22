import { URL } from "node:url";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const DOWNLOAD_TIMEOUT_MS = 60_000;
let configuredGlobalProxyUrl: string | undefined;
let originalGlobalFetch: typeof globalThis.fetch | undefined;
let globalProxyAgent: ProxyAgent | undefined;
let globalFetchOverridden = false;

function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy
  );
}

export function shouldBypassProxy(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  // Localhost and loopback addresses always bypass the proxy
  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".localhost")
  ) {
    return true;
  }

  // Parse standard NO_PROXY/no_proxy environment variables
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  if (noProxy) {
    const rules = noProxy.split(",").map((r) => r.trim().toLowerCase());
    for (const rule of rules) {
      if (!rule) continue;
      if (rule.startsWith(".")) {
        if (normalized.endsWith(rule)) return true;
      } else {
        if (normalized === rule || normalized.endsWith("." + rule)) return true;
      }
    }
  }

  // Internal, storage, and known CDNs that must bypass the proxy to prevent TLS/connectivity issues
  const bypassList = [
    "link-gpt.link",
  ];

  for (const domain of bypassList) {
    if (normalized === domain || normalized.endsWith("." + domain)) {
      return true;
    }
  }

  return false;
}

export function configureGlobalFetchProxy(): void {
  const proxyUrl = getProxyUrl();

  // If proxy configuration changes, update the Agent
  if (proxyUrl !== configuredGlobalProxyUrl) {
    if (proxyUrl) {
      globalProxyAgent = new ProxyAgent(proxyUrl);
    } else {
      globalProxyAgent = undefined;
    }
    configuredGlobalProxyUrl = proxyUrl;
  }

  if (!globalFetchOverridden) {
    originalGlobalFetch ??= globalThis.fetch.bind(globalThis);

    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      // Clean up Content-Length header to prevent duplicate content-length errors
      // with undici dispatcher loaded.
      if (init?.headers) {
        const headers = init.headers;
        if (headers instanceof Headers) {
          headers.delete('content-length');
        } else if (typeof (headers as any).delete === 'function') {
          (headers as any).delete('content-length');
        } else if (Array.isArray(headers)) {
          for (let i = headers.length - 1; i >= 0; i--) {
            const pair = headers[i];
            if (Array.isArray(pair) && pair[0]?.toLowerCase() === 'content-length') {
              headers.splice(i, 1);
            }
          }
        } else if (typeof headers === 'object') {
          for (const key of Object.keys(headers)) {
            if (key.toLowerCase() === 'content-length') {
              delete (headers as Record<string, string>)[key];
            }
          }
        }
      }

      if (globalProxyAgent) {
        const requestUrl =
          typeof input === "string" || input instanceof URL
            ? new URL(input)
            : new URL(input.url);

        if (
          (requestUrl.protocol === "http:" || requestUrl.protocol === "https:") &&
          !shouldBypassProxy(requestUrl.hostname)
        ) {
          return undiciFetch(input as any, {
            ...(init as any),
            dispatcher: globalProxyAgent,
          }) as unknown as Promise<Response>;
        }
      }

      return originalGlobalFetch?.(input, init) ?? fetch(input, init);
    }) as typeof globalThis.fetch;

    globalFetchOverridden = true;
  }
}

export async function downloadImage(url: string): Promise<Buffer> {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported download protocol: ${parsed.protocol}`);
  }

  const bypass = shouldBypassProxy(parsed.hostname);
  const proxyUrl = !bypass ? getProxyUrl() : undefined;
  const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await undiciFetch(url, {
      ...(dispatcher ? { dispatcher } : {}),
      redirect: "follow",
      signal: controller.signal,
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Download timed out after ${Math.round(DOWNLOAD_TIMEOUT_MS / 1000)}s`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
    await dispatcher?.close();
  }
}
