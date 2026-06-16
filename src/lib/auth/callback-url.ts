import { i18n, type Locale } from "@/config/i18n-config";
import { siteConfig } from "@/config/site";

const AUTH_PATH_PATTERN = /^\/(?:(?:en|zh)\/)?(?:login|register)(?:\/|$)/;
const CALLBACK_URL_BASE = "https://ai2art.local";

function isLocale(value: string): value is Locale {
  return i18n.locales.includes(value as Locale);
}

export function getLocalizedPath(locale: string, path: string) {
  const safeLocale = isLocale(locale) ? locale : i18n.defaultLocale;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return safeLocale === i18n.defaultLocale
    ? normalizedPath
    : `/${safeLocale}${normalizedPath}`;
}

export function sanitizeCallbackPath(
  value: string | null | undefined,
  fallback: string
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, CALLBACK_URL_BASE);

    if (parsed.origin !== CALLBACK_URL_BASE) {
      return fallback;
    }

    if (AUTH_PATH_PATTERN.test(parsed.pathname)) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getDefaultAuthCallbackURL(locale: string) {
  return getLocalizedPath(locale, siteConfig.routes.defaultLoginRedirect);
}

export function getAuthCallbackURL(
  searchParams: URLSearchParams | null | undefined,
  locale: string
) {
  const fallback = getDefaultAuthCallbackURL(locale);
  return sanitizeCallbackPath(searchParams?.get("from"), fallback);
}
