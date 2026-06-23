"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/components/ui";
import * as Icons from "@/components/ui/icons";

import { ModeToggle } from "@/components/mode-toggle";

export function SiteFooter({
  className,
}: {
  className?: string;
}) {
  const t = useTranslations('SiteFooter');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.Logo className="h-9 w-9 shrink-0" />
          <p className="text-center text-sm leading-loose md:text-left">
            {t('copyright', { currentYear })}
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  );
}
