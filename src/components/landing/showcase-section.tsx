"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { LocaleLink } from "@/i18n/navigation";

export function ShowcaseSection() {
  const t = useTranslations("ShowcaseGallery");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const showcaseImages = t.raw("items") as Array<{
    id: number;
    title: string;
    prompt: string;
    image: string;
    tag: string;
  }>;

  const handleCopyPrompt = (id: number, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-slate-50 dark:bg-slate-950/40">
      {/* Background Decorators */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <BlurFade inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {t("badge")}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-800 dark:text-white"
            >
              {t("title")}
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent mt-2">
                {t("subtitle")}
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            >
              {t("description")}
            </motion.p>
          </div>
        </BlurFade>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {showcaseImages.map((item, index) => (
            <BlurFade key={item.id} delay={index * 0.05} inView>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative h-full flex flex-col"
              >
                {/* Image Card */}
                <div className="relative flex flex-col h-full rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-md hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60">
                  {/* Border Beam - Only on first card */}
                  {index === 0 && (
                    <BorderBeam
                      size={250}
                      duration={12}
                      anchor={90}
                      borderWidth={2}
                      colorFrom="#10b981"
                      colorTo="#14b8a6"
                    />
                  )}

                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover Overlay with Copy & Create Actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100">
                      <div className="text-white mb-4">
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
                          {t("promptSeed")}
                        </div>
                        <p className="text-xs leading-5 text-slate-200 line-clamp-3 select-all">
                          {item.prompt}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(item.id, item.prompt);
                          }}
                          className="flex-1 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur border border-white/10 transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400 animate-scale" />
                              <span className="text-emerald-400">{t("copied")}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-white/80" />
                              <span>{t("copyPrompt")}</span>
                            </>
                          )}
                        </button>
                        <LocaleLink
                          href={`/studio?tab=text2img&prompt=${encodeURIComponent(item.prompt)}`}
                          className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                          <span>{t("generateImage")}</span>
                        </LocaleLink>
                      </div>
                    </div>

                    {/* Tag */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-semibold text-white uppercase tracking-wider">{item.tag}</span>
                    </div>
                  </div>

                  {/* Info Panel */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            </BlurFade>
          ))}
        </div>

        {/* Bottom CTA */}
        <BlurFade delay={0.3} inView>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t("ctaText")}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LocaleLink href="/#generator">
                <ShimmerButton
                  shimmerColor="#ffffff"
                  shimmerSize="0.05em"
                  shimmerDuration="3s"
                  borderRadius="100px"
                  background="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  className="px-8 py-3 text-base font-medium shadow-lg shadow-emerald-500/25 w-full sm:w-auto"
                >
                  {t("ctaButton")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ShimmerButton>
              </LocaleLink>
              <LocaleLink href="/gallery?tab=text2img">
                <button
                  type="button"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
                >
                  {t("viewAllTemplates")}
                </button>
              </LocaleLink>
            </div>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
