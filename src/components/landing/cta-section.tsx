"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { BlurFade } from "@/components/magicui/blur-fade";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { LocaleLink } from "@/i18n/navigation";
import { NEW_USER_GIFT } from "@/config/pricing-user";

const benefits = [
  `${NEW_USER_GIFT.credits} free credit to start`,
  "No credit card required",
  "Cancel anytime",
  "Commercial use on paid plans",
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-slate-100 py-24 dark:bg-slate-950 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.16),transparent_35%)]" />
      <div className="container mx-auto px-4">
        <BlurFade inView>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-2xl shadow-emerald-950/10 dark:bg-white/5"
          >
            <BorderBeam colorFrom="#10b981" colorTo="#bbf7d0" size={420} duration={12} borderWidth={2} />
            <div className="grid gap-8 p-4 md:grid-cols-[0.95fr_1.05fr] md:p-8">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  Limited Time Offer
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl">
                  Ready to create amazing AI artwork?
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                  Join creators using AI2ART to turn ordinary portraits into destination-ready images, campaign assets, and personal art.
                </p>
                <ul className="mt-6 space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <LocaleLink href="/studio" className="mt-8 w-fit">
                  <ShimmerButton borderRadius="999px" background="#059669" className="px-8 py-3 text-sm font-semibold shadow-lg shadow-emerald-700/20">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ShimmerButton>
                </LocaleLink>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-emerald-50 p-4 dark:bg-emerald-500/10"
              >
                <div className="aspect-video overflow-hidden rounded-2xl bg-slate-200">
                  <img src="/images/homepage/photo-remix-result.png" alt="AI2ART generated travel portrait preview" className="h-full w-full object-cover" />
                </div>
                <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/40">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Generating final artwork</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">100%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
                    <div className="h-full w-full rounded-full bg-emerald-600" />
                  </div>
                  <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">Ready in 2-5 minutes</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  );
}
