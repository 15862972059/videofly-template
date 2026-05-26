import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";
import { redirect } from "next/navigation";

interface ModelPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({
  params,
}: ModelPageProps) {
  const { locale } = await params;
  const alternates = buildAlternates("/studio", locale);

  return {
    title: "AI2ART Studio",
    description: "Create AI-generated images and guided photo remixes with AI2ART.",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/studio`);
}
