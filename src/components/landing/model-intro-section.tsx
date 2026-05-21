"use client";

import { Cpu, Sparkles, Zap, Shield, Image, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { LocaleLink } from "@/i18n/navigation";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const features = [
  {
    icon: Shield,
    title: "Unrivaled Face Preservation",
    description: "Unlike generic models that distort features, GPT-Image-2 guarantees 98%+ identity retention, preserving your exact facial expressions and structure.",
  },
  {
    icon: Sparkles,
    title: "Hyper-Realistic Textures",
    description: "Generates skin pores, individual hair strands, clothing textures, and lighting reflections with cinematic precision and zero distortion.",
  },
  {
    icon: Image,
    title: "Cohesive Style Blending",
    description: "Bridges the portrait and destination scene dynamically. Shadow directions, depth of field, and color tones are naturally matched and fused.",
  },
  {
    icon: Zap,
    title: "Turbo-Charged Inference",
    description: "Optimized on dedicated high-performance clusters to deliver breathtaking, high-fidelity 4K output in less than 30 seconds.",
  },
];

export function ModelIntroSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background text-slate-800 dark:text-white">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[150px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Model Brand Presentation */}
          <div className="space-y-8">
            <BlurFade inView>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="h-3.5 w-3.5" />
                Next-Gen AI Core
              </div>
            </BlurFade>

            <BlurFade delay={0.1} inView>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-slate-800 dark:text-white">
                100% Powered by <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">GPT-Image-2</span>
              </h2>
            </BlurFade>
            <BlurFade delay={0.15} inView>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                We believe that compromise has no place in art. That's why we bypassed generic models and built AI2ART entirely on top of <strong className="text-slate-800 dark:text-white font-bold">GPT-Image-2</strong>—the world's most powerful, details-aware, and face-preserving image generation model.
              </p>
            </BlurFade>

            {/* Performance Statistics Grid */}
            <BlurFade delay={0.2} inView>
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">98.6%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-450 mt-1 uppercase tracking-wider font-semibold">Face Retention</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-teal-600 dark:text-teal-400">4K Ultra</div>
                  <div className="text-xs text-slate-500 dark:text-slate-450 mt-1 uppercase tracking-wider font-semibold">Max Resolution</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">&lt; 30s</div>
                  <div className="text-xs text-slate-500 dark:text-slate-450 mt-1 uppercase tracking-wider font-semibold">Remix Speed</div>
                </div>
              </div>
            </BlurFade>

            <BlurFade delay={0.25} inView>
              <div className="flex flex-wrap gap-4 items-center">
                <LocaleLink href="/studio">
                  <ShimmerButton
                    shimmerColor="#ffffff"
                    borderRadius="999px"
                    background="#10b981"
                    className="h-12 px-7 text-sm font-semibold shadow-lg shadow-emerald-700/20"
                  >
                    Experience GPT-Image-2 Power
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </LocaleLink>
              </div>
            </BlurFade>
          </div>

          {/* Right Column: Key Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <BlurFade key={item.title} delay={0.1 + idx * 0.08} inView>
                  <MagicCard
                    className="h-full rounded-2xl border border-slate-200/80 bg-white shadow-md dark:border-white/5 dark:bg-slate-900/60 p-6 backdrop-blur hover:shadow-lg dark:hover:border-emerald-500/25 transition-all duration-300"
                    gradientFrom="#10b981"
                    gradientTo="#14b8a6"
                    gradientColor="rgba(16,185,129,0.12)"
                    gradientOpacity={0.2}
                    gradientSize={180}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 mb-4 border border-emerald-100 dark:border-emerald-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
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
