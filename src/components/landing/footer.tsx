"use client";

import Image from "next/image";
import { LocaleLink } from "@/i18n/navigation";

const footerSections = [
  {
    title: "Product",
    links: [
      { title: "Studio", href: "/studio" },
      { title: "Gallery", href: "/gallery" },
      { title: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Support",
    links: [
      { title: "FAQ", href: "/#faq" },
      { title: "Contact", href: "mailto:support@ai2art.app" },
    ],
  },
];

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-900/10 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 grid gap-8 md:grid-cols-4">
          <div>
            <LocaleLink href="/" className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-white">
              <Image src="/logo.svg" alt="AI2ART" width={28} height={28} className="rounded-md" />
              AI2ART
            </LocaleLink>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Transform portraits into world-class AI artwork with curated destination scenes.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href} className="text-sm text-slate-500 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300">
                        {link.title}
                      </a>
                    ) : (
                      <LocaleLink href={link.href} className="text-sm text-slate-500 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300">
                        {link.title}
                      </LocaleLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-emerald-900/10 pt-8 text-sm text-slate-500 dark:text-slate-400 sm:flex-row">
          <p>© {currentYear} AI2ART. All rights reserved.</p>
          <p>Built for fast, polished AI image creation.</p>
        </div>
      </div>
    </footer>
  );
}
