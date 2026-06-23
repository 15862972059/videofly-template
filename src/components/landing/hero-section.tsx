"use client";

import Image from "next/image";
import { ArrowRight, Check, Images, Sparkles, Type, WandSparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { StudioLink } from "@/components/landing/studio-link";
import { cn } from "@/components/ui";
import { NEW_USER_GIFT } from "@/config/pricing-user";
import { LocaleLink } from "@/i18n/navigation";

export function HeroSection() {
  const t = useTranslations("HeroLanding");
  const trustItems = [
    t("trust.noCard"),
    t("trust.freeCredits", { credits: NEW_USER_GIFT.credits || 1 }),
    t("trust.hdOutput"),
    t("trust.noPrompts"),
    t("trust.oneCredit"),
    t("trust.ultraCheap"),
  ];

  return (
    <section
      id="generator"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,rgba(240,253,244,0.9)_0%,rgba(248,250,252,0.95)_74%,var(--background)_100%)] pb-20 pt-14 dark:bg-[radial-gradient(circle_at_50%_8%,rgba(34,197,94,0.14),transparent_34%),linear-gradient(180deg,rgba(6,20,18,0.92)_0%,rgba(2,6,23,0.98)_74%,var(--background)_100%)]"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-9 py-10 text-center lg:grid lg:max-w-7xl lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:text-left">
          <div className="flex w-full flex-col items-center justify-center gap-9 lg:items-start">
            <div className="flex w-full flex-col items-center space-y-6 lg:items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {t("badge")}
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-800 dark:text-white md:text-6xl lg:text-6xl xl:text-7xl">
                {t("title")}
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                {t("description")}
              </p>

              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {trustItems.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-emerald-900/10 dark:bg-white/10 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-deck w-full">
            <div className="hero-card hero-card-1">
              <Image src="/images/homepage/case323.jpg" alt="AI Photo Remix Case 323" fill sizes="(min-width: 1024px) 270px, 48vw" priority />
              <span>{t("gallery.case323")}</span>
            </div>
            <div className="hero-card hero-card-2">
              <Image src="/images/homepage/case369.jpg" alt="AI Photo Remix Case 369" fill sizes="(min-width: 1024px) 230px, 44vw" priority />
              <span>{t("gallery.case369")}</span>
            </div>
            <div className="hero-card hero-card-3">
              <Image src="/images/homepage/case443.jpg" alt="AI food poster generation example" fill sizes="(min-width: 1024px) 210px, 38vw" loading="lazy" />
              <span>{t("gallery.case443")}</span>
            </div>
            <div className="hero-card hero-card-4">
              <Image src="/images/homepage/5.21.webp" alt="AI Art Case 5.21" fill sizes="(min-width: 1024px) 285px, 52vw" loading="lazy" />
              <span>{t("gallery.case521")}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 lg:mt-16 max-w-5xl lg:max-w-7xl">
          <div className="relative rounded-[2rem] border border-white/80 bg-white/78 p-4 shadow-[0_24px_90px_rgba(16,185,129,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-emerald-300/25 blur-3xl" />
            <div className="flex flex-col gap-4 rounded-[1.5rem] border border-emerald-900/10 bg-white/80 p-5 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-center lg:justify-center">
              <StudioLink className="w-full sm:w-auto">
                <ShimmerButton
                  shimmerColor="#ffffff"
                  borderRadius="999px"
                  background="#059669"
                  className="h-12 w-full px-7 text-sm font-semibold shadow-lg shadow-emerald-700/20 sm:w-auto"
                >
                  <WandSparkles className="mr-2 h-4 w-4" />
                  {t("primaryCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ShimmerButton>
              </StudioLink>
              <LocaleLink
                href="/gallery"
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-900/10 bg-white px-7 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-emerald-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
                )}
              >
                <Images className="h-4 w-4" />
                {t("secondaryCta")}
              </LocaleLink>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 text-left dark:bg-white/5">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                  <Type className="h-4 w-4" />
                  {t("cards.sceneIdeas.title")}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("cards.sceneIdeas.description")}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 text-left dark:bg-emerald-500/5">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4 animate-pulse text-emerald-600 dark:text-emerald-400" />
                  {t("cards.model.title")}
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {t("cards.model.description")}
                </p>
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-4 text-left dark:bg-emerald-500/10">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{t("cards.fast.title")}</div>
                <p className="mt-1 text-[10px] leading-tight text-slate-600 dark:text-slate-300">{t("cards.fast.description")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
