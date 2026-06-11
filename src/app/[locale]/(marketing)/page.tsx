import { Suspense } from "react";

import { CTASection } from "@/components/landing/cta-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works-section";
import { ModelIntroSection } from "@/components/landing/model-intro-section";
import { PhotoRemixSection } from "@/components/landing/photo-remix-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";

import { i18n, type Locale } from "@/config/i18n-config";
import { siteConfig } from "@/config/site";
import { buildAlternates, resolveOgImage } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

interface PageMetadataProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: PageMetadataProps) {
  const { locale } = await params;

  const titles = {
    en: "AI2ART - AI Photo Remix & Art Generator",
    zh: "AI2ART - AI 照片重绘与艺术生成平台",
  };

  const descriptions = {
    en: "Turn authorized photos into polished AI art. Choose a destination scene, upload a portrait you have rights to use, and export polished images.",
    zh: "把你有权使用的人像照片变成精致的 AI 艺术作品。选择目的地场景，上传照片，然后导出高质量重绘图像。",
  };

  const canonicalUrl = `${siteConfig.url}${locale === i18n.defaultLocale ? "" : `/${locale}`}`;
  const alternates = buildAlternates("/", locale);
  const ogImage = resolveOgImage();

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonicalUrl,
      siteName: "AI2ART",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  await params;

  return (
    <>
      <HeroSection />
      <PhotoRemixSection />
      <ModelIntroSection />
      <ShowcaseSection />
      <FeaturesSection />
      <HowItWorks />
      <Suspense fallback={<PricingSectionFallback />}>
        <PricingSection />
      </Suspense>
      <CTASection />
      <FAQSection />
    </>
  );
}

function PricingSectionFallback() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mx-auto h-10 w-48 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="mx-auto mt-4 h-5 w-80 max-w-full rounded-full bg-slate-100 dark:bg-white/5" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-80 rounded-2xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </section>
  );
}
