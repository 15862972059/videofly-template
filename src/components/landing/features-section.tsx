"use client";

import { Clock, Image, Layers, Lock, MessageSquareText, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { LocaleLink } from "@/i18n/navigation";

const primaryFeatures = [
  {
    icon: Image,
    title: "Photo Remix",
    description: "Place authorized portraits into curated scenes while keeping the result natural and coherent.",
    stat: { value: 4, suffix: "K", label: "Max output" },
  },
  {
    icon: MessageSquareText,
    title: "Text to Image",
    description: "Generate polished artwork from prompts, or ask AI2ART to suggest scene directions for you.",
    stat: { value: 30, suffix: "s", label: "Idea to draft" },
  },
  {
    icon: Layers,
    title: "Reference Control",
    description: "Use scenes, portraits, and prompt seeds together for more predictable AI art direction.",
    stat: { value: 9, suffix: "+", label: "Inputs" },
  },
];

const supportFeatures = [
  { icon: Zap, title: "Lightning Fast", description: "Start from a template and generate social-ready images quickly.", stat: { value: 2, suffix: "min" } },
  { icon: Lock, title: "Secure & Private", description: "Your uploads and generated files are stored safely in your account.", stat: { value: 100, suffix: "%" } },
  { icon: Clock, title: "Real-time Updates", description: "Track generation progress and return to your history anytime.", stat: { value: 24, suffix: "/7" } },
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.10),transparent_30%)]" />
      <div className="container mx-auto px-4">
        <BlurFade inView>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              Everything You Need
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl">
              Practical features to create polished AI art
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              A quieter, more focused AI art workflow: scenes, portraits, prompt help, and export-ready results in one place.
            </p>
          </div>
        </BlurFade>

        <div className="mb-5 grid gap-4 lg:grid-cols-3">
          {primaryFeatures.map((feature, index) => {
            const Icon = feature.icon;
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
                            Popular
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
            const Icon = feature.icon;
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
            <LocaleLink href="/studio">
              <ShimmerButton borderRadius="999px" background="#059669" className="px-8 py-3 text-sm font-semibold shadow-lg shadow-emerald-700/20">
                Start Creating Now
              </ShimmerButton>
            </LocaleLink>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
