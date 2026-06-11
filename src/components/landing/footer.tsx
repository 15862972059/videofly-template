"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { LocaleLink } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations();
  const tFooter = useTranslations("LandingFooter");
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: t("Footer.product"),
      links: [
        { title: t("Header.studio"), href: "/studio" },
        { title: t("Header.gallery"), href: "/gallery" },
        { title: t("Header.pricing"), href: "/pricing" },
      ],
    },
    {
      title: t("Footer.legal"),
      links: [
        { title: t("Footer.privacy"), href: "/privacy-policy" },
        { title: t("Footer.terms"), href: "/terms-of-service" },
        { title: tFooter("acceptableUse"), href: "/acceptable-use" },
      ],
    },
    {
      title: tFooter("support"),
      links: [
        { title: t("FAQ.title"), href: "/#faq" },
        { title: tFooter("contact"), href: "mailto:support@ai2art.net" },
      ],
    },
  ];

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
              {tFooter("tagline")}
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
          <p>{tFooter("copyright", { year: currentYear })}</p>
          <p>{tFooter("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
