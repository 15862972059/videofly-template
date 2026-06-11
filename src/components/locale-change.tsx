"use client";

import * as React from "react";
import { Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LOCALE_COOKIE_NAME, type Locale, i18n } from "@/config/i18n-config";
import { cn } from "@/components/ui";

interface LocaleChangeProps {
  compact?: boolean;
  className?: string;
}

export function LocaleChange({ compact = false, className }: LocaleChangeProps) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();

  const labels: Record<Locale, string> = {
    en: t("english"),
    zh: t("chinese"),
  };

  function onClick(nextLocale: Locale) {
    if (typeof window === "undefined" || nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000`;

    const query = searchParams.toString();
    const hash = window.location.hash;
    const currentPath = window.location.pathname;
    const normalizedPath = currentPath === "/" ? "" : currentPath;
    const pathWithoutLocale = normalizedPath.replace(/^\/zh(?=\/|$)/, "");
    const nextPath = nextLocale === "en"
      ? (pathWithoutLocale || "/")
      : `/zh${pathWithoutLocale || ""}`;

    window.location.assign(`${nextPath}${query ? `?${query}` : ""}${hash}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={cn(
            "h-9 rounded-full border border-transparent px-3 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:border-emerald-500/20 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300",
            compact && "h-8 px-2.5",
            className,
          )}
          aria-label={t("label")}
        >
          <Globe2 className="h-4 w-4" />
          {!compact && (
            <span className="ml-2">
              {labels[locale]}
            </span>
          )}
          {compact && <span className="sr-only">{t("label")}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-2xl p-2">
        <DropdownMenuLabel className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("label")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1">
          {i18n.locales.map((nextLocale) => (
            <DropdownMenuCheckboxItem
              key={nextLocale}
              checked={nextLocale === locale}
              onSelect={() => onClick(nextLocale)}
              className="rounded-xl py-2 pl-8 pr-3"
            >
              {labels[nextLocale]}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
