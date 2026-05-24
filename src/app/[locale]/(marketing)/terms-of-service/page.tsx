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
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="prose dark:prose-invert">
                <h1>Terms of Service</h1>
                <p className="lead">Effective Date: May 24, 2026</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    Welcome to AI2ART ("we," "our," or "us"). By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to any part of these Terms, you do not have permission to access the Service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                    AI2ART is an AI-powered image and video generation platform that allows users to create or remix content from text prompts, uploaded images, and other inputs. We provide a custom interface on top of third-party AI models and related infrastructure. We are an independent service and are not affiliated with, endorsed by, or sponsored by the underlying model providers.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                    To access certain features, you may need to register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must provide accurate and complete information.
                </p>

                <h2>4. Usage Guidelines</h2>
                <p>You agree not to use the Service to:</p>
                <ul>
                    <li>Generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable. Generating any NSFW (Not Safe For Work), adult, sexually explicit, sexually suggestive, or obscene content is strictly prohibited.</li>
                    <li>Create deepfakes, face swaps, impersonation, or face manipulation of another person without clear permission.</li>
                    <li>Upload or remix photos unless you own them, have licensed them, or have permission from the people shown in them.</li>
                    <li>Infringe upon the intellectual property or other rights of any person or entity.</li>
                    <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                    <li>Attempt to gain unauthorized access to the Service or its related systems or networks.</li>
                </ul>

                <h2>5. Intellectual Property</h2>
                <p>
                    Subject to these Terms, you retain ownership of the content you upload to the platform. For content generated using the platform, we grant you the right to use, reproduce, and distribute such content, provided you comply with these Terms.
                </p>

                <h2>6. Credits and Payments</h2>
                <p>
                    Certain features of the Service require credits. Credits can be obtained through purchase or subscription.
                </p>
                <ul>
                    <li><strong>Credit Purchases:</strong> Credits are non-transferable, non-refundable, and cannot be exchanged for cash.</li>
                    <li><strong>Subscriptions:</strong> Subscriptions are billed monthly or annually. Except as required by law, all fees are non-refundable.</li>
                    <li><strong>Subscription Management:</strong> Subscribers can manage billing, invoices, payment methods, and cancellation from within the product through the Creem customer portal.</li>
                    <li><strong>Subscription Cancellation:</strong> You may cancel your subscription at any time. If you cancel at period end, you will retain access until the end of your current billing period. If you choose immediate cancellation where available, access may stop sooner.</li>
                    <li><strong>Refund Requests:</strong> Refund requests must be submitted to support@ai2art.net. We review refund eligibility under these Terms, our posted policies, and applicable law.</li>
                    <li><strong>Credit Expiration:</strong> Credits expire after a certain period. Please use them before expiration.</li>
                </ul>

                <h2>7. Payment Processing</h2>
                <p>
                    We use Creem as our third-party payment processor. All payments are processed by Creem, and Creem's terms and conditions apply to your purchases. We do not store your full credit card information.
                </p>

                <h2>8. Customer Support</h2>
                <p>
                    Support is available at support@ai2art.net. For billing, cancellation, and refund-related requests, contact us using that email address. We aim to respond to customer support requests within 3 business days.
                </p>

                <h2>9. Disclaimer of Warranties</h2>
                <p>
                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.
                </p>

                <h2>10. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, AI2ART shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill.
                </p>

                <h2>11. Changes to Terms</h2>
                <p>
                    We reserve the right to modify these Terms at any time. Modified terms will become effective upon posting to the website. Your continued use of the Service after changes constitutes your acceptance of the modified Terms.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us at: support@ai2art.net
                </p>
            </div>
        </div>
    );
}
