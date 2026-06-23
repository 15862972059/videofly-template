"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ImagePlus, Lightbulb, MapPin, Sparkles, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { cn } from "@/components/ui";
import { LocaleLink } from "@/i18n/navigation";

function StepCard({
  icon: Icon,
  step,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  step: string;
  title: string;
  text: string;
}) {
  return (
    <MagicCard
      className="h-full rounded-2xl border border-emerald-900/10 bg-white/80 shadow-sm backdrop-blur dark:bg-white/5"
      gradientFrom="#10b981"
      gradientTo="#86efac"
      gradientColor="rgba(16,185,129,0.20)"
      gradientOpacity={0.16}
      gradientSize={220}
    >
      <div className="p-6 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">{step}</div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </MagicCard>
  );
}

export function PhotoRemixSection() {
  const t = useTranslations("PhotoRemixSection");
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const remixCases = t.raw("cases") as Array<{
    id: string;
    tabName: string;
    sceneLabel: string;
    sceneTitle: string;
    sceneImage: string;
    portraitLabel: string;
    portraitTitle: string;
    portraitImage: string;
    resultLabel: string;
    resultTitle: string;
    resultImage: string;
    promptSeed: string;
  }>;
  const destinations = t.raw("destinations") as Array<{
    title: string;
    place: string;
    image: string;
    tag: string;
  }>;
  const ideas = t.raw("ideas") as string[];
  const currentCase = remixCases[activeCaseIndex];

  return (
    <section id="photo-remix" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-950 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.16),transparent_32%)]" />
      <div className="container mx-auto px-4">
        <BlurFade inView>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
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

        <div className="mb-16 grid gap-4 md:grid-cols-3">
          <BlurFade inView delay={0.05}>
            <StepCard icon={MapPin} step="01" title={t("steps.chooseScene.title")} text={t("steps.chooseScene.text")} />
          </BlurFade>
          <BlurFade inView delay={0.12}>
            <StepCard icon={Upload} step="02" title={t("steps.uploadPhoto.title")} text={t("steps.uploadPhoto.text")} />
          </BlurFade>
          <BlurFade inView delay={0.19}>
            <StepCard icon={ImagePlus} step="03" title={t("steps.remix.title")} text={t("steps.remix.text")} />
          </BlurFade>
        </div>

        {/* Tab Selector */}
        <BlurFade inView>
          <div className="mb-8 flex justify-center gap-2 flex-wrap">
            {remixCases.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCaseIndex(index)}
                className={cn(
                  "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 border cursor-pointer",
                  activeCaseIndex === index
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                    : "bg-white/80 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900/60 dark:text-slate-300 dark:border-white/10 dark:hover:bg-emerald-500/10"
                )}
              >
                {item.tabName}
              </button>
            ))}
          </div>
        </BlurFade>

        <div className="grid gap-6">
          <BlurFade inView>
            <MagicCard
              className="rounded-[2rem] border border-emerald-900/10 bg-white/85 p-4 shadow-xl shadow-emerald-950/5 backdrop-blur dark:bg-white/5"
              gradientFrom="#10b981"
              gradientTo="#bbf7d0"
              gradientColor="rgba(16,185,129,0.18)"
              gradientOpacity={0.15}
              gradientSize={320}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCaseIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-4 p-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center"
                >
                  <PreviewCard label={currentCase.sceneLabel} title={currentCase.sceneTitle} image={currentCase.sceneImage} />
                  <ArrowRight className="mx-auto hidden h-5 w-5 text-emerald-600 md:block animate-pulse" />
                  <PreviewCard label={currentCase.portraitLabel} title={currentCase.portraitTitle} image={currentCase.portraitImage} />
                  <ArrowRight className="mx-auto hidden h-5 w-5 text-emerald-600 md:block animate-pulse" />
                  <PreviewCard label={currentCase.resultLabel} title={currentCase.resultTitle} image={currentCase.resultImage} emphasis />
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5 dark:bg-emerald-500/10">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">{t("promptSeedLabel")}</div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeCaseIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm leading-6 text-slate-600 dark:text-slate-300"
                    >
                      {currentCase.promptSeed}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 dark:bg-white/5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                    <Lightbulb className="h-4 w-4" />
                    {t("ideasLabel")}
                  </div>
                  <div className="space-y-2">
                    {ideas.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        className="block w-full rounded-xl border border-emerald-900/10 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-emerald-500/10"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </MagicCard>
          </BlurFade>

          <BlurFade inView delay={0.1}>
            <div className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-5 shadow-xl shadow-emerald-950/5 backdrop-blur dark:bg-white/5">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{t("destinationsTitle")}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("destinationsDescription")}</p>
                </div>
                <LocaleLink
                  href="/gallery"
                  className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  {t("viewAllScenes")}
                </LocaleLink>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {destinations.map((destination, index) => (
                  <motion.div
                    key={destination.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    className="group overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm dark:bg-white/5"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={destination.image}
                        alt={`${destination.title} scene template`}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
                        {destination.tag}
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">{destination.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{destination.place}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({ label, title, image, emphasis = false }: { label: string; title: string; image: string; emphasis?: boolean }) {
  return (
    <div className={cn("rounded-2xl border bg-white p-3 shadow-sm dark:bg-slate-950/40", emphasis ? "border-emerald-300" : "border-emerald-900/10")}>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">{label}</div>
      <div className="mb-3 text-sm font-semibold text-slate-800 dark:text-white">{title}</div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 30vw, 90vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
