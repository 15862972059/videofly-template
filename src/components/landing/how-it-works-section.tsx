"use client";

import { ArrowRight, Download, ImagePlus, MessageSquareText, Upload } from "lucide-react";
import { motion } from "framer-motion";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { LocaleLink } from "@/i18n/navigation";

const steps = [
  { icon: ImagePlus, step: "01", title: "Pick a Scene", text: "Start with a destination template or a visual reference from the gallery.", meta: "20+ scenes" },
  { icon: Upload, step: "02", title: "Upload Portrait", text: "Add a clean portrait or full-body shot. AI2ART keeps the person recognizable.", meta: "PNG, JPG, WebP" },
  { icon: MessageSquareText, step: "03", title: "Refine Prompt", text: "Use prompt seeds or ask the built-in Q&A helper for scene ideas.", meta: "guided prompts" },
  { icon: Download, step: "04", title: "Export Artwork", text: "Download the finished image and keep every generation in your history.", meta: "HD output" },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-950 md:py-32">
      <div className="container mx-auto px-4">
        <BlurFade inView>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              Simple Process
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl">
              Create your AI artwork in 4 simple steps
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              The workflow stays practical: choose, upload, refine, and export without a complicated editor.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <BlurFade key={step.step} delay={index * 0.08} inView>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative h-full"
                >
                  <MagicCard
                    className="h-full rounded-2xl border border-emerald-900/10 bg-white/80 shadow-sm backdrop-blur dark:bg-white/5"
                    gradientFrom="#10b981"
                    gradientTo="#86efac"
                    gradientColor="rgba(16,185,129,0.16)"
                    gradientOpacity={0.15}
                    gradientSize={220}
                  >
                    <div className="flex min-h-[230px] flex-col p-6">
                      <div className="mb-6 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{step.step}</span>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{step.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.text}</p>
                      <div className="mt-5 border-t border-emerald-900/10 pt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{step.meta}</div>
                    </div>
                  </MagicCard>
                </motion.div>
              </BlurFade>
            );
          })}
        </div>

        <BlurFade delay={0.45} inView>
          <div className="mt-14 flex justify-center">
            <LocaleLink href="/studio">
              <ShimmerButton borderRadius="999px" background="#059669" className="px-8 py-3 text-sm font-semibold shadow-lg shadow-emerald-700/20">
                Start Creating Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </ShimmerButton>
            </LocaleLink>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
