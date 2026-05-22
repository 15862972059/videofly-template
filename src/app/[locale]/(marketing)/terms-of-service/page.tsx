import { useTranslations } from "next-intl";
import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const alternates = buildAlternates("/terms-of-service", locale);

  return {
    title: "Terms of Service",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default function TermsOfServicePage() {
    const t = useTranslations("Terms");

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            <div className="prose dark:prose-invert">
                <p>Last updated: {new Date().getFullYear()}</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using AI2ART, you accept and agree to be bound by the terms and provision of this agreement.</p>

                <h2>2. Use License</h2>
                <p>Permission is granted to temporarily download one copy of the materials (information or software) on AI2ART's website for personal, non-commercial transitory viewing only.</p>

                <h2>3. Disclaimer</h2>
                <p>The materials on AI2ART's website are provided "as is". AI2ART makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>

                <h2>4. Limitations</h2>
                <p>In no event shall AI2ART or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AI2ART's website.</p>

                <h2>5. Prohibited Use (NSFW/Adult Content)</h2>
                <p>You are strictly prohibited from using AI2ART to generate or distribute any NSFW (Not Safe For Work), adult, sexually explicit, sexually suggestive, or obscene content.</p>

                <h2>6. Consent and Face Safety</h2>
                <p>You may not use AI2ART to create deepfakes, face swaps, impersonation, or face manipulation of another person without clear permission. Only upload photos that you own, have licensed, or have permission to use.</p>
            </div>
        </div>
    );
}
