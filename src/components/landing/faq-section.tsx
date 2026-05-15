"use client";

import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlurFade } from "@/components/magicui/blur-fade";

const faqData = [
  {
    question: "What is AI2ART?",
    answer: "AI2ART is an AI photo generation and remix platform. You can choose a destination scene, upload a portrait, and generate realistic artwork in seconds.",
  },
  {
    question: "Can I use AI2ART without writing prompts?",
    answer: "Yes. The gallery templates and built-in scene idea helper let you start from a visual direction, then refine the prompt only if you want more control.",
  },
  {
    question: "Will it preserve my identity and outfit?",
    answer: "The photo remix workflow is designed to preserve identity, clothing, and composition while adapting lighting, scenery, and style to the selected template.",
  },
  {
    question: "Can I use generated images commercially?",
    answer: "Paid plans include commercial usage rights for generated assets. Always make sure uploaded reference images are yours or licensed for your use.",
  },
  {
    question: "How do credits work?",
    answer: "Each generation uses credits based on output type and quality. New users receive free credits to try the workflow before upgrading.",
  },
  {
    question: "Do you support text-to-image too?",
    answer: "Yes. AI2ART supports both photo remix and text-to-image, so you can create from a portrait, a scene template, or a written prompt.",
  },
];

export function FAQSection() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="bg-background py-24 md:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <BlurFade inView>
            <div className="mb-12 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white md:text-5xl"
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-base text-slate-600 dark:text-slate-300"
              >
                Everything you need to know before creating with AI2ART.
              </motion.p>
            </div>
          </BlurFade>

          <BlurFade delay={0.15} inView>
            <Accordion type="single" collapsible className="space-y-3">
              {faqData.map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem value={`faq-${index}`} className="rounded-2xl border border-emerald-900/10 bg-white/70 px-5 backdrop-blur transition-colors hover:border-emerald-300 dark:bg-white/5">
                    <AccordionTrigger className="py-4 text-left hover:no-underline">
                      <span className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-white">{item.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-10 leading-7 text-slate-600 dark:text-slate-300">{item.answer}</AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </BlurFade>

          <BlurFade delay={0.35} inView>
            <div className="mt-10 rounded-2xl border border-emerald-900/10 bg-emerald-50 p-5 text-center text-sm text-slate-600 dark:bg-emerald-500/10 dark:text-slate-300">
              Still have questions? Contact us at{" "}
              <a href="mailto:support@ai2art.app" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
                support@ai2art.app
              </a>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
