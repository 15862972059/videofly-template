import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai2art.net";

  return {
    rules: {
      // Allow all search engines and AI crawlers:
      // Googlebot (Google + Google AI Overview)
      // Bingbot (Bing + Microsoft Copilot)
      // GPTBot (OpenAI / ChatGPT)
      // ChatGPT-User (ChatGPT with browsing)
      // PerplexityBot (Perplexity)
      // ClaudeBot (Claude)
      // anthropic-ai (Anthropic)
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/admin/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
