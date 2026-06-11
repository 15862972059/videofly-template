import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const alternates = buildAlternates("/privacy-policy", locale);

  return {
    title: locale === "zh" ? "隐私政策" : "Privacy Policy",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-24">
      <div className="prose prose-gray max-w-none dark:prose-invert">
        {isZh ? (
          <>
            <h1>隐私政策</h1>
            <p className="lead">生效日期：2026 年 5 月 24 日</p>

            <h2>1. 简介</h2>
            <p>
              AI2ART（以下简称“我们”）重视您的隐私。本隐私政策说明您在使用我们的服务时，我们如何收集、使用、披露和保护您的信息。
            </p>

            <h2>2. 我们收集的信息</h2>
            <p>我们会收集以下类型的信息：</p>
            <ul>
              <li><strong>账户信息：</strong>当您注册时，我们会收集邮箱地址、昵称和头像等信息。</li>
              <li><strong>使用数据：</strong>我们会收集您如何使用服务的信息，例如使用过的工具、生成记录、访问时间，以及设备或浏览器元数据。</li>
              <li><strong>输入内容：</strong>您上传或提交用于图像生成、重绘或相关处理的图片、文本提示词和其他内容。</li>
              <li><strong>生成内容：</strong>通过服务生成的图像及相关输出内容。</li>
            </ul>

            <h2>3. 我们如何使用您的信息</h2>
            <p>我们会将收集的信息用于以下目的：</p>
            <ul>
              <li>提供、维护并改进我们的服务。</li>
              <li>处理交易并管理您的积分。</li>
              <li>向您发送相关通知，包括服务更新和安全提醒。</li>
              <li>监测和分析趋势、使用情况和活动，以改进用户体验。</li>
              <li>检测、调查并防止欺诈和其他违法活动。</li>
            </ul>

            <h2>4. 信息共享</h2>
            <p>我们不会向第三方出售您的个人信息。我们仅在以下情况下共享您的信息：</p>
            <ul>
              <li>与帮助我们运营服务的服务提供商共享，例如云存储、支付处理等。</li>
              <li>与 AI 基础设施或内容审核服务提供商共享，仅用于安全地处理提示词、媒体输入或输出。</li>
              <li>为遵守法律义务、法院命令或法律程序。</li>
              <li>为保护我们、用户或公众的权利、财产或安全。</li>
            </ul>

            <h2>5. 支付处理</h2>
            <p>我们使用 Creem 作为第三方支付处理商。当您购买积分或订阅时：</p>
            <ul>
              <li>您会直接向 Creem 提供支付信息，我们不会存储完整的信用卡号码。</li>
              <li>Creem 对支付信息的处理受其自身隐私政策约束。</li>
              <li>所有支付会话均通过加密的安全连接完成。</li>
            </ul>

            <h2>6. 数据保留</h2>
            <p>
              我们会在合理必要的期限内保留账户信息、账单记录和生成内容，以便提供服务、履行法律义务、防止滥用、解决争议并执行相关协议。当数据不再需要时，我们可能会删除或匿名化处理。
            </p>

            <h2>7. 数据安全</h2>
            <p>
              我们采取合理的安全措施，防止您的信息遭到未经授权的访问、篡改、披露或销毁。但互联网传输或电子存储不存在绝对安全，我们无法保证 100% 的安全性。
            </p>

            <h2>8. 您的权利</h2>
            <p>
              根据适用法律，您可能有权访问、更正、删除或限制处理您的个人信息。您可以通过账户设置或联系我们来行使这些权利。
            </p>

            <h2>9. 积分与订阅</h2>
            <ul>
              <li><strong>积分购买：</strong>积分不可转让、不可退款，也不能兑换现金。</li>
              <li><strong>订阅管理：</strong>订阅用户可以通过产品内链接的 Creem 客户门户管理账单、支付方式、发票和取消订阅。</li>
              <li><strong>订阅取消：</strong>您可随时取消订阅。若选择在周期结束时取消，您仍可使用至当前计费周期结束；部分情况下也可能根据门户中的选项立即生效。</li>
              <li><strong>退款申请：</strong>退款请求请发送至 support@ai2art.net。我们会根据公开条款和适用法律进行审核。</li>
              <li><strong>积分过期：</strong>积分会在一定期限后过期，请在有效期内使用。</li>
            </ul>

            <h2>10. 儿童隐私</h2>
            <p>
              我们的服务不面向 13 岁以下儿童（或当地法律规定的其他年龄）。如果发现我们收集了儿童的个人信息，我们会尽快采取删除措施。
            </p>

            <h2>11. 政策变更</h2>
            <p>
              我们保留随时更新本隐私政策的权利。如有重大变更，我们会通过服务内通知或电子邮件告知您。
            </p>

            <h2>12. 联系我们</h2>
            <p>
              如果您对本隐私政策有任何疑问、需要账单帮助或希望行使隐私相关权利，请联系：support@ai2art.net
            </p>
          </>
        ) : (
          <>
            <h1>Privacy Policy</h1>
            <p className="lead">Effective Date: May 24, 2026</p>

            <h2>1. Introduction</h2>
            <p>
              AI2ART (&quot;we&quot; or &quot;us&quot;) values your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our services.
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
              <li>Creem&apos;s privacy policy governs their handling of your payment transactions.</li>
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

            <h2>10. Children&apos;s Privacy</h2>
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
          </>
        )}
      </div>
    </div>
  );
}
