"use client";

import { Clock, Image, Layers, Lock, MessageSquareText, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { StudioLink } from "@/components/landing/studio-link";

const primaryIconMap = [Image, MessageSquareText, Layers];
const supportIconMap = [Zap, Lock, Clock];

export function FeaturesSection() {
  const t = useTranslations("HomeFeatures");
  const primaryFeatures = t.raw("primary") as Array<{
    title: string;
    description: string;
    stat: { value: number; suffix: string; label: string };
  }>;
  const supportFeatures = t.raw("support") as Array<{
    title: string;
    description: string;
    stat: { value: number; suffix: string };
  }>;

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.10),transparent_30%)]" />
      <div className="container mx-auto px-4">
        <BlurFade inView>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              {t("badge")}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {t("description")}
            </p>
          </div>
        </BlurFade>

        <div className="mb-5 grid gap-4 lg:grid-cols-3">
          {primaryFeatures.map((feature, index) => {
            const Icon = primaryIconMap[index] ?? Image;
            return (
              <BlurFade key={feature.title} delay={index * 0.08} inView>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="h-full"
                >
                  <MagicCard
                    className="h-full rounded-2xl border border-emerald-900/10 bg-white/80 shadow-sm backdrop-blur dark:bg-white/5"
                    gradientFrom="#10b981"
                    gradientTo="#86efac"
                    gradientColor="rgba(16,185,129,0.18)"
                    gradientOpacity={0.16}
                    gradientSize={260}
                  >
                    <div className="flex min-h-[250px] flex-col p-7">
                      <div className="mb-8 flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        {index === 0 && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                            {t("popular")}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{feature.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
                      <div className="mt-6 flex items-end justify-between border-t border-emerald-900/10 pt-4">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{feature.stat.label}</span>
                        <span className="text-2xl font-bold text-slate-800 dark:text-white">
                          <NumberTicker value={feature.stat.value} />
                          <span className="text-base text-slate-500">{feature.stat.suffix}</span>
                        </span>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {supportFeatures.map((feature, index) => {
            const Icon = supportIconMap[index] ?? Zap;
            return (
              <BlurFade key={feature.title} delay={0.24 + index * 0.08} inView>
                <MagicCard
                  className="h-full rounded-2xl border border-emerald-900/10 bg-white/70 shadow-sm backdrop-blur dark:bg-white/5"
                  gradientFrom="#10b981"
                  gradientTo="#bbf7d0"
                  gradientColor="rgba(16,185,129,0.14)"
                  gradientOpacity={0.14}
                  gradientSize={200}
                >
                  <div className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-slate-800 dark:text-white">
                        <NumberTicker value={feature.stat.value} delay={0.2} />
                        <span className="text-sm text-slate-500">{feature.stat.suffix}</span>
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
                  </div>
                </MagicCard>
              </BlurFade>
            );
          })}
        </div>

        <BlurFade delay={0.5} inView>
          <div className="mt-14 flex justify-center">
            <StudioLink>
              <ShimmerButton borderRadius="999px" background="#059669" className="px-8 py-3 text-sm font-semibold shadow-lg shadow-emerald-700/20">
                {t("cta")}
              </ShimmerButton>
            </StudioLink>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
