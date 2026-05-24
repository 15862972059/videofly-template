import type { Locale } from "@/config/i18n-config";

export const metadata = {
    title: "Privacy Policy - AI2ART",
    description: "Privacy Policy for AI2ART",
};

export default async function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 md:py-24">
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1>Privacy Policy</h1>
                <p className="lead">Effective Date: May 24, 2026</p>

                <h2>1. Introduction</h2>
                <p>
                    AI2ART ("we" or "us") values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our services.
                </p>

                <h2>2. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul>
                    <li><strong>Account Information:</strong> When you register, we collect information such as your email address, profile name, and profile image.</li>
                    <li><strong>Usage Data:</strong> We collect information about how you interact with our service, such as the tools you use, generation activity, access times, and device or browser metadata.</li>
                    <li><strong>Input Content:</strong> Images, text prompts, and other content you upload or submit for image or video generation.</li>
                    <li><strong>Generated Content:</strong> The images, videos, and related outputs created through the service.</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>We use the collected information for the following purposes:</p>
                <ul>
                    <li>To provide, maintain, and improve our services.</li>
                    <li>To process your transactions and manage your credits.</li>
                    <li>To send you relevant notifications, including service updates and security alerts.</li>
                    <li>To monitor and analyze trends, usage, and activities to improve user experience.</li>
                    <li>To detect, investigate, and prevent fraud and other illegal activities.</li>
                </ul>

                <h2>4. Information Sharing</h2>
                <p>
                    We do not sell your personal information to third parties. We share your information only in the following circumstances:
                </p>
                <ul>
                    <li>With service providers who assist us in operating our services (e.g., cloud hosting, payment processing).</li>
                    <li>With AI infrastructure and moderation providers solely to process prompts, media inputs, or outputs needed to provide the service safely.</li>
                    <li>To comply with legal obligations, court orders, or legal processes.</li>
                    <li>To protect the rights, property, or safety of us, our users, or the public.</li>
                </ul>

                <h2>5. Payment Processing</h2>
                <p>
                    We use Creem as our third-party payment processor. When you purchase credits or subscriptions:
                </p>
                <ul>
                    <li>You provide payment information directly to Creem. We do not store your full credit card number.</li>
                    <li>Creem's privacy policy governs their handling of your payment transactions.</li>
                    <li>All payment sessions are processed through secure encrypted connections.</li>
                </ul>

                <h2>6. Data Retention</h2>
                <p>
                    We retain account information, billing records, and generated content for as long as reasonably necessary to provide the service, comply with legal obligations, prevent abuse, resolve disputes, and enforce our agreements. We may delete or anonymize data when it is no longer needed for these purposes.
                </p>

                <h2>7. Data Security</h2>
                <p>
                    We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h2>8. Your Rights</h2>
                <p>
                    Depending on applicable laws, you may have the right to access, correct, delete, or restrict the processing of your personal information. You can exercise these rights at any time through your account settings or by contacting us.
                </p>

                <h2>9. Credits and Subscriptions</h2>
                <ul>
                    <li><strong>Credit Purchases:</strong> Credits are non-transferable, non-refundable, and cannot be exchanged for cash.</li>
                    <li><strong>Subscription Management:</strong> Subscribers can manage billing, payment methods, invoices, and cancellation through the Creem customer portal linked from our product.</li>
                    <li><strong>Subscription Cancellation:</strong> You may cancel your subscription at any time. If you cancel at period end, you retain access through the end of the current billing period. In some cases, cancellation may take effect immediately based on the option selected in the portal.</li>
                    <li><strong>Refund Requests:</strong> Refund requests should be sent to support@ai2art.net. We review requests according to our posted terms and applicable law.</li>
                    <li><strong>Credit Expiration:</strong> Credits expire after a certain period. Please use them before expiration.</li>
                </ul>

                <h2>10. Children's Privacy</h2>
                <p>
                    Our services are not intended for children under 13 (or other age as required by local law). If we discover we have collected personal information from children, we will take steps to delete it as soon as possible.
                </p>

                <h2>11. Changes to Policy</h2>
                <p>
                    We reserve the right to update this Privacy Policy at any time. If we make material changes, we will notify you through the service or by email.
                </p>

                <h2>12. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, need help with billing, or want to exercise a privacy right, please contact us at: support@ai2art.net
                </p>
            </div>
        </div>
    );
}
