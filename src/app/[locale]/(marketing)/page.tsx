import { HeroSection } from "@/components/landing/hero-section";
import { PhotoRemixSection } from "@/components/landing/photo-remix-section";
import { ModelIntroSection } from "@/components/landing/model-intro-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { FAQSection } from "@/components/landing/faq-section";

import type { Locale } from "@/config/i18n-config";
import { i18n } from "@/config/i18n-config";
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
    zh: "AI2ART - AI Photo Remix & Art Generator",
  };

  const descriptions = {
    en: "Turn any photo into world-class AI art. Choose a destination scene, upload a portrait, remix with MiniMax AI, and export polished images.",
    zh: "Turn any photo into world-class AI art. Choose a destination scene, upload a portrait, remix with MiniMax AI, and export polished images.",
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
      <PricingSection />
      <CTASection />
      <FAQSection />
    </>
  );
}
