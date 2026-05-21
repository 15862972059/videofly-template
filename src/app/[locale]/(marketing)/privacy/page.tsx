import type { Locale } from "@/config/i18n-config";

export const metadata = {
    title: "Privacy Policy - ar2art",
    description: "Privacy Policy for ar2art",
};

export default async function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 md:py-24">
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h1>Privacy Policy</h1>
                <p className="lead">Effective Date: May 19, 2026</p>

                <h2>1. Introduction</h2>
                <p>
                    ar2art ("we" or "us") values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our services.
                </p>

                <h2>2. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul>
                    <li><strong>Account Information:</strong> When you register, we collect your email address, username, and profile picture.</li>
                    <li><strong>Usage Data:</strong> We collect information about how you interact with our service, such as the types of videos you generate, frequency of use, and access times.</li>
                    <li><strong>Input Content:</strong> Images, text, or other inputs you upload to generate videos.</li>
                    <li><strong>Generated Content:</strong> Video content you generate using our service.</li>
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

                <h2>6. Data Security</h2>
                <p>
                    We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>

                <h2>7. Your Rights</h2>
                <p>
                    Depending on applicable laws, you may have the right to access, correct, delete, or restrict the processing of your personal information. You can exercise these rights at any time through your account settings or by contacting us.
                </p>

                <h2>8. Credits and Subscriptions</h2>
                <ul>
                    <li><strong>Credit Purchases:</strong> Credits are non-transferable, non-refundable, and cannot be exchanged for cash.</li>
                    <li><strong>Subscription Cancellation:</strong> You may cancel your subscription at any time. You will retain access until the end of your current billing period.</li>
                    <li><strong>Credit Expiration:</strong> Credits expire after a certain period. Please use them before expiration.</li>
                </ul>

                <h2>9. Children's Privacy</h2>
                <p>
                    Our services are not intended for children under 13 (or other age as required by local law). If we discover we have collected personal information from children, we will take steps to delete it as soon as possible.
                </p>

                <h2>10. Changes to Policy</h2>
                <p>
                    We reserve the right to update this Privacy Policy at any time. If we make material changes, we will notify you through the service or by email.
                </p>

                <h2>11. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at: privacy@ar2art.net
                </p>
            </div>
        </div>
    );
}