import { MetadataRoute } from "next";
import { i18n } from "@/config/i18n-config";

// Allow sitemap to be revalidated daily (86400 seconds)
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai2art.net";

  // Clean, predefined list of public indexable routes
  const routes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "gallery", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "privacy", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "privacy-policy", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "terms", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "terms-of-service", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "acceptable-use", priority: 0.3, changeFrequency: "monthly" as const },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];
  const currentDate = new Date();

  for (const route of routes) {
    for (const locale of i18n.locales) {
      const localePath = locale === i18n.defaultLocale ? "" : `/${locale}`;
      const url = `${baseUrl}${localePath}${route.path ? `/${route.path}` : ""}`;

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  console.log(`🗺️  Sitemap: Generated ${sitemapEntries.length} URLs`);

  return sitemapEntries;
}
