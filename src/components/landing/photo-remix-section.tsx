"use client";

import { ArrowRight, ImagePlus, Lightbulb, MapPin, Sparkles, Upload } from "lucide-react";
import { motion } from "framer-motion";

import { BlurFade } from "@/components/magicui/blur-fade";
import { MagicCard } from "@/components/magicui/magic-card";
import { cn } from "@/components/ui";
import { LocaleLink } from "@/i18n/navigation";

const destinations = [
  { title: "Eiffel Tower", place: "Paris", image: "/images/gallery-france-paris-a.jpeg", tag: "Popular" },
  { title: "Lavender Fields", place: "Provence", image: "/images/gallery-france-provence-a.jpeg", tag: "Romance" },
  { title: "Santorini Cliffs", place: "Greece", image: "/images/gallery-greece-santorini-a.jpeg", tag: "Coastal" },
  { title: "Cherry Blossom", place: "Tokyo", image: "/images/gallery-japan-tokyo-a.jpeg", tag: "Spring" },
  { title: "Mt. Fuji", place: "Japan", image: "/images/gallery-japan-fuji-a.jpeg", tag: "Iconic" },
  { title: "Rome Streets", place: "Italy", image: "/images/gallery-italy-rome-a.jpeg", tag: "Classic" },
  { title: "Swiss Alps", place: "Zermatt", image: "/images/gallery-switzerland-zermatt-a.jpeg", tag: "Alpine" },
  { title: "Aurora Fjord", place: "Norway", image: "/images/gallery-norway-aurora.jpeg", tag: "Dream" },
];

const ideas = [
  "Golden hour fashion portrait in Paris",
  "Quiet Kyoto lantern street with soft depth",
  "Santorini editorial photo with clean white architecture",
];

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
  return (
    <section id="photo-remix" className="relative overflow-hidden bg-slate-50 py-24 dark:bg-slate-950 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.16),transparent_32%)]" />
      <div className="container mx-auto px-4">
        <BlurFade inView>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Photo Remix Studio
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl">
              Your portrait, placed anywhere in the world
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Keep the strongest function from the original site: choose a scene, upload a portrait, then generate a believable AI artwork with matching light, composition, and style.
            </p>
          </div>
        </BlurFade>

        <div className="mb-16 grid gap-4 md:grid-cols-3">
          <BlurFade inView delay={0.05}>
            <StepCard icon={MapPin} step="01" title="Choose Scene" text="Browse curated destination templates from Paris to Santorini." />
          </BlurFade>
          <BlurFade inView delay={0.12}>
            <StepCard icon={Upload} step="02" title="Upload Your Photo" text="Use a portrait or full-body shot. AI2ART preserves identity and outfit." />
          </BlurFade>
          <BlurFade inView delay={0.19}>
            <StepCard icon={ImagePlus} step="03" title="AI Remix" text="Generate a final portrait that feels shot in the selected place." />
          </BlurFade>
        </div>

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
              <div className="grid gap-4 p-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <PreviewCard label="Destination Photo" title="Santorini scene" image="/images/homepage/photo-remix-scene.png" />
                <ArrowRight className="mx-auto hidden h-5 w-5 text-emerald-600 md:block" />
                <PreviewCard label="Upload Portrait" title="User image" image="/images/homepage/photo-remix-portrait.png" />
                <ArrowRight className="mx-auto hidden h-5 w-5 text-emerald-600 md:block" />
                <PreviewCard label="Generated Result" title="AI remix result" image="/images/homepage/photo-remix-result.png" emphasis />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-5 dark:bg-emerald-500/10">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Prompt seed</div>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Cinematic travel portrait at a stylish location, soft body and natural distance, warm sunset light, clean composition, realistic photography.
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 dark:bg-white/5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                    <Lightbulb className="h-4 w-4" />
                    Ask AI for scene ideas
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
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Explore Iconic Destinations</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Pick a backdrop and start from a proven visual direction.</p>
                </div>
                <LocaleLink
                  href="/gallery"
                  className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  View all scenes
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
                    <div className="relative aspect-[5/6] overflow-hidden">
                      <img src={destination.image} alt={`${destination.title} scene template`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
