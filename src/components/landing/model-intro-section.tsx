"use client";

import { ArrowRight, Cpu, Image, Shield, Sparkles, Zap } from "lucide-react";

import { BlurFade } from "@/components/magicui/blur-fade";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { MagicCard } from "@/components/magicui/magic-card";
import { LocaleLink } from "@/i18n/navigation";

const features = [
  {
    icon: Shield,
    title: "Identity-Aware Remixing",
    description:
      "Designed to keep recognizable portrait details while adapting light, scene context, and visual style.",
  },
  {
    icon: Sparkles,
    title: "Detailed Textures",
    description:
      "Creates polished skin, hair, fabric, and lighting details for social-ready artwork.",
  },
  {
    icon: Image,
    title: "Cohesive Style Blending",
    description:
      "Blends portraits and destination scenes with consistent color, composition, and atmosphere.",
  },
  {
    icon: Zap,
    title: "Fast Creative Workflow",
    description:
      "Start from a template, refine the prompt, and generate polished artwork without a complex editor.",
  },
];

export function ModelIntroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24 text-slate-800 dark:text-white md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/10" />
        <div className="absolute right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-teal-500/5 blur-[150px] dark:bg-teal-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-8">
            <BlurFade inView>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 font-semibold text-emerald-700 text-xs uppercase tracking-wider dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Cpu className="h-3.5 w-3.5" />
                AI Image Core
              </div>
            </BlurFade>

            <BlurFade delay={0.1} inView>
              <h2 className="font-bold text-4xl text-slate-800 leading-tight tracking-tight dark:text-white md:text-5xl lg:text-6xl">
                Built With
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400">
                  {" GPT-Image-2"}
                </span>
              </h2>
            </BlurFade>

            <BlurFade delay={0.15} inView>
              <p className="max-w-2xl text-lg text-slate-600 leading-relaxed dark:text-slate-300">
                AI2ART provides a focused creative interface built on top of{" "}
                <strong className="font-bold text-slate-800 dark:text-white">GPT-Image-2</strong>{" "}
                for detailed, style-aware image generation. AI2ART is an independent product and is not affiliated with or endorsed by underlying AI model providers.
              </p>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <div className="grid grid-cols-3 gap-6 border-slate-200 border-t pt-4 dark:border-slate-800">
                <div>
                  <div className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-400 md:text-4xl">Guided</div>
                  <div className="mt-1 font-semibold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-450">Portrait Remix</div>
                </div>
                <div>
                  <div className="font-extrabold text-3xl text-teal-600 dark:text-teal-400 md:text-4xl">HD</div>
                  <div className="mt-1 font-semibold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-450">Export Ready</div>
                </div>
                <div>
                  <div className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-400 md:text-4xl">Safe</div>
                  <div className="mt-1 font-semibold text-slate-500 text-xs uppercase tracking-wider dark:text-slate-450">Prompt Screening</div>
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={0.25} inView>
              <div className="flex flex-wrap items-center gap-4">
                <LocaleLink href="/studio">
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    borderRadius="999px"
                    background="#10b981"
                    className="h-12 px-7 font-semibold text-sm shadow-emerald-700/20 shadow-lg"
                  >
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </LocaleLink>
              </div>
            </BlurFade>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <BlurFade key={item.title} delay={0.1 + idx * 0.08} inView>
                  <MagicCard
                    className="h-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md backdrop-blur transition-all duration-300 hover:shadow-lg dark:border-white/5 dark:bg-slate-900/60 dark:hover:border-emerald-500/25"
                    gradientFrom="#10b981"
                    gradientTo="#14b8a6"
                    gradientColor="rgba(16,185,129,0.12)"
                    gradientOpacity={0.2}
                    gradientSize={180}
                  >
                    <div className="flex h-full flex-col">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-2 font-bold text-base text-slate-800 dark:text-white">{item.title}</h3>
                      <p className="flex-grow text-slate-600 text-xs leading-relaxed dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
