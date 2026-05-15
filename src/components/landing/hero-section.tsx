"use client";

import Link from "next/link";
import { ArrowRight, Check, Images, Sparkles, Type, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { Meteors } from "@/components/magicui/meteors";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { cn } from "@/components/ui";
import { NEW_USER_GIFT } from "@/config/pricing-user";

const trustItems = ["No credit card", `${NEW_USER_GIFT.credits || 2} free credits`, "4K HD output"];

export function HeroSection() {
  const locale = useLocale();

  return (
    <section id="generator" className="relative overflow-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(34,197,94,0.18),transparent_34%),linear-gradient(180deg,rgba(240,253,244,0.9)_0%,rgba(248,250,252,0.95)_74%,var(--background)_100%)] pb-20 pt-14 dark:bg-[radial-gradient(circle_at_50%_8%,rgba(34,197,94,0.14),transparent_34%),linear-gradient(180deg,rgba(6,20,18,0.92)_0%,rgba(2,6,23,0.98)_74%,var(--background)_100%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <Meteors number={12} minDelay={0.8} maxDelay={3} minDuration={4} maxDuration={9} />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto flex min-h-[760px] max-w-5xl flex-col items-center justify-center gap-9 text-center">
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="space-y-6"
          >
            <BlurFade delay={0.05} inView>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
                Powered by MiniMax AI
              </div>
            </BlurFade>

            <BlurFade delay={0.1} inView>
              <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-800 dark:text-white md:text-6xl lg:text-7xl">
                Turn Any Photo Into World-Class AI Art
              </h1>
            </BlurFade>

            <BlurFade delay={0.18} inView>
              <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                Choose a destination, upload your portrait, and let AI2ART remix it into a polished travel poster, cinematic portrait, or social-ready artwork.
              </p>
            </BlurFade>

            <BlurFade delay={0.24} inView className="flex flex-wrap justify-center gap-2">
              {trustItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-emerald-900/10 dark:bg-white/10 dark:text-slate-300">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  {item}
                </span>
              ))}
            </BlurFade>
          </motion.div>

          <BlurFade delay={0.32} inView className="w-full max-w-3xl">
            <div className="relative rounded-[2rem] border border-white/80 bg-white/78 p-4 shadow-[0_24px_90px_rgba(16,185,129,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-emerald-300/25 blur-3xl" />
              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-emerald-900/10 bg-white/80 p-5 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-center">
                <Link href={`/${locale}/studio`} className="w-full sm:w-auto">
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
                </Link>
                <Link
                  href={`/${locale}/gallery`}
                  className={cn(
                    "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-900/10 bg-white px-7 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-emerald-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
                  )}
                >
                  <Images className="h-4 w-4" />
                  Browse Scenes
                </Link>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 text-left dark:bg-white/5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                    <Type className="h-4 w-4" />
                    AI Scene Ideas
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Ask for scene prompts like “Paris sunset editorial portrait” or “Kyoto lantern street with cinematic depth.”
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/80 p-4 text-left dark:bg-emerald-500/10">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">30s</div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">to start a remix workflow</p>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
