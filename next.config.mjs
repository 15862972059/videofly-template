// @ts-check
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

if (!process.env.SKIP_ENV_VALIDATION) {
  await import("./src/env.mjs");
  await import("./src/lib/auth/env.mjs");
}

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
  images: {
    remotePatterns: (() => {
      const patterns = [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "avatars.githubusercontent.com" },
        { protocol: "https", hostname: "www.twillot.com" },
        { protocol: "https", hostname: "cdnv2.ruguoapp.com" },
        { protocol: "https", hostname: "www.setupyourpay.com" },
        { protocol: "https", hostname: "cdnv2.ruguoapp.com" },
      ];
      if (process.env.STORAGE_DOMAIN) {
        const domain = process.env.STORAGE_DOMAIN.trim();
        const hostname = domain.startsWith("http")
          ? domain.replace(/^https?:\/\//, "").split("/")[0]
          : domain.split("/")[0];
        if (hostname && !patterns.some(p => p.hostname === hostname)) {
          patterns.push({ protocol: "https", hostname });
        }
      }
      return patterns;
    })(),
    // Allow generated user images from storage domain (uses plain <img> for dynamic hosts)
    unoptimized: false,
  },
  /** Vercel serverless function max duration for image generation routes */
  serverExternalPackages: ["postgres"],
  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
};

// Compose plugins
export default withNextIntl(config);
