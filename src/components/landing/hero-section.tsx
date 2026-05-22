"use client";

import Image from "next/image";
import { ArrowRight, Check, Images, Sparkles, Type, WandSparkles } from "lucide-react";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { cn } from "@/components/ui";
import { NEW_USER_GIFT } from "@/config/pricing-user";
import { LocaleLink } from "@/i18n/navigation";

const trustItems = ["No credit card", `${NEW_USER_GIFT.credits || 1} free credit`, "4K HD output"];

export function HeroSection() {
  return (
    <section id="generator" className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,rgba(240,253,244,0.9)_0%,rgba(248,250,252,0.95)_74%,var(--background)_100%)] pb-20 pt-14 dark:bg-[radial-gradient(circle_at_50%_8%,rgba(34,197,94,0.14),transparent_34%),linear-gradient(180deg,rgba(6,20,18,0.92)_0%,rgba(2,6,23,0.98)_74%,var(--background)_100%)]">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex min-h-[760px] max-w-5xl lg:max-w-7xl flex-col lg:grid lg:grid-cols-[1.15fr_0.85fr] items-center justify-center gap-9 lg:gap-12 text-center lg:text-left py-10">
          
          {/* Left Column: Text Copy & CTAs */}
          <div className="flex flex-col items-center lg:items-start justify-center gap-9 w-full">
            <div className="space-y-6 w-full flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Powered by GPT-Image-2 (Ultimate Creative Engine)
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-800 dark:text-white md:text-6xl lg:text-6xl xl:text-7xl">
                Turn Any Photo Into World-Class AI Art
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                Choose a destination, upload your portrait, and let AI2ART remix it using <strong>GPT-Image-2</strong>, the world's most powerful creative generation engine, into a polished artwork.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {trustItems.map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-emerald-900/10 dark:bg-white/10 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full max-w-3xl">
              <div className="relative rounded-[2rem] border border-white/80 bg-white/78 p-4 shadow-[0_24px_90px_rgba(16,185,129,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
                <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-emerald-300/25 blur-3xl" />
                <div className="flex flex-col gap-4 rounded-[1.5rem] border border-emerald-900/10 bg-white/80 p-5 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                  <LocaleLink href="/studio" className="w-full sm:w-auto">
                    <ShimmerButton
                      shimmerColor="#ffffff"
                      borderRadius="999px"
                      background="#059669"
                      className="h-12 w-full px-7 text-sm font-semibold shadow-lg shadow-emerald-700/20 sm:w-auto"
                    >
                      <WandSparkles className="mr-2 h-4 w-4" />
                      Start Creating Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </ShimmerButton>
                  </LocaleLink>
                  <LocaleLink
                    href="/gallery"
                    className={cn(
                      "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-900/10 bg-white px-7 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-emerald-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
                    )}
                  >
                    <Images className="h-4 w-4" />
                    Browse Scenes
                  </LocaleLink>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1.1fr_1.1fr_0.8fr]">
                  <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 text-left dark:bg-white/5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                      <Type className="h-4 w-4" />
                      AI Scene Ideas
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Ask for scene prompts like “Paris sunset editorial portrait” or “Kyoto lantern street.”
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 text-left dark:bg-emerald-500/5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      Ultimate Model
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      100% powered by <strong className="text-emerald-700 dark:text-emerald-300 font-bold">GPT-Image-2</strong>, the most powerful creative engine for details and face-preservation.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-4 text-left dark:bg-emerald-500/10 flex flex-col justify-center">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">30s</div>
                    <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 leading-tight">to start a remix workflow</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Cards Deck */}
          <div className="hero-deck w-full">
            <div className="hero-card hero-card-1">
              <Image src="/images/homepage/case323.jpg" alt="AI Photo Remix Case 323" fill sizes="(min-width: 1024px) 270px, 48vw" />
              <span>Remix #323</span>
            </div>
            <div className="hero-card hero-card-2">
              <Image src="/images/homepage/case369.jpg" alt="AI Photo Remix Case 369" fill sizes="(min-width: 1024px) 230px, 44vw" />
              <span>Remix #369</span>
            </div>
            <div className="hero-card hero-card-3">
              <Image src="/images/homepage/case378.jpg" alt="AI Photo Remix Case 378" fill sizes="(min-width: 1024px) 210px, 38vw" />
              <span>Remix #378</span>
            </div>
            <div className="hero-card hero-card-4">
              <Image src="/images/homepage/5.21.png" alt="AI Art Case 5.21" fill sizes="(min-width: 1024px) 285px, 52vw" />
              <span>Remix #5.21</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
