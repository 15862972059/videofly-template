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
    title: locale === "zh" ? "服务条款" : "Terms of Service",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="prose max-w-none dark:prose-invert">
        {isZh ? (
          <>
            <h1>服务条款</h1>
            <p className="lead">生效日期：2026 年 5 月 24 日</p>

            <h2>1. 条款接受</h2>
            <p>
              欢迎使用 AI2ART（“我们”）。访问或使用我们的网站和服务即表示您同意受本服务条款约束。如果您不同意其中任何内容，则无权使用本服务。
            </p>

            <h2>2. 服务说明</h2>
            <p>
              AI2ART 是一个 AI 图像生成与重绘平台，允许用户通过文本提示词、上传图片及其他输入创建或重混内容。我们在第三方 AI 模型和相关基础设施之上提供自有产品界面。AI2ART 是独立服务，与底层模型提供方不存在隶属、背书或赞助关系。
            </p>

            <h2>3. 用户账户</h2>
            <p>
              使用某些功能时，您可能需要注册账户。您有责任妥善保管账户信息，并对账户下发生的所有行为负责。您必须提供准确、完整的信息。
            </p>

            <h2>4. 使用规范</h2>
            <p>您不得使用本服务从事以下行为：</p>
            <ul>
              <li>生成违法、有害、威胁、辱骂、骚扰、诽谤、淫秽或其他令人反感的内容。任何 NSFW、成人、露骨、性暗示或色情内容均被严格禁止。</li>
              <li>在未经明确许可的情况下创建换脸、深度伪造、冒充或他人人脸操控内容。</li>
              <li>上传或重绘您不拥有、未获授权，或未取得图片中人物许可的照片。</li>
              <li>侵犯任何个人或实体的知识产权或其他权利。</li>
              <li>干扰或破坏服务的完整性或性能。</li>
              <li>尝试未经授权访问服务或其相关系统与网络。</li>
            </ul>

            <h2>5. 知识产权</h2>
            <p>
              在遵守本条款的前提下，您保留对上传内容的所有权。对于通过平台生成的内容，我们授予您在遵守本条款的情况下使用、复制和分发该内容的权利。
            </p>

            <h2>6. 积分与付款</h2>
            <p>服务中的部分功能需要消耗积分。积分可以通过购买或订阅获得。</p>
            <ul>
              <li><strong>积分购买：</strong>积分不可转让、不可退款，也不能兑换现金。</li>
              <li><strong>订阅：</strong>订阅按月或按年计费。除法律另有要求外，所有费用均不予退款。</li>
              <li><strong>订阅管理：</strong>订阅用户可通过产品内的 Creem 客户门户管理账单、发票、支付方式和取消操作。</li>
              <li><strong>订阅取消：</strong>您可以随时取消订阅。如果选择在周期末取消，您仍可使用到当前计费周期结束；若门户支持立即取消，访问权限可能会更早结束。</li>
              <li><strong>退款请求：</strong>退款申请请发送至 support@ai2art.net。我们会根据本条款、公开政策和适用法律审核退款资格。</li>
              <li><strong>积分过期：</strong>积分会在一定期限后过期，请在到期前使用。</li>
            </ul>

            <h2>7. 支付处理</h2>
            <p>
              我们使用 Creem 作为第三方支付处理商。所有付款均由 Creem 处理，您的购买还将受到 Creem 条款约束。我们不会存储您的完整信用卡信息。
            </p>

            <h2>8. 客户支持</h2>
            <p>
              支持邮箱为 support@ai2art.net。与账单、取消和退款有关的请求也请通过该邮箱联系我们。我们会尽量在 3 个工作日内回复。
            </p>

            <h2>9. 免责声明</h2>
            <p>
              本服务按“现状”和“可用”基础提供，不附带任何明示或暗示担保。我们不保证服务不会中断、不会延迟、绝对安全或完全无错误。
            </p>

            <h2>10. 责任限制</h2>
            <p>
              在法律允许的最大范围内，AI2ART 不对任何间接、附带、特殊、后果性或惩罚性损害承担责任，包括但不限于利润、数据或商誉损失。
            </p>

            <h2>11. 条款变更</h2>
            <p>
              我们保留随时修改本条款的权利。修改后的条款将在网站发布时生效。您在变更后继续使用服务即视为接受修改后的条款。
            </p>

            <h2>12. 联系我们</h2>
            <p>
              如果您对本条款有任何疑问，请联系：support@ai2art.net
            </p>
          </>
        ) : (
          <>
            <h1>Terms of Service</h1>
            <p className="lead">Effective Date: May 24, 2026</p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to AI2ART (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our website and services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to any part of these Terms, you do not have permission to access the Service.
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
              We use Creem as our third-party payment processor. All payments are processed by Creem, and Creem&apos;s terms and conditions apply to your purchases. We do not store your full credit card information.
            </p>

            <h2>8. Customer Support</h2>
            <p>
              Support is available at support@ai2art.net. For billing, cancellation, and refund-related requests, contact us using that email address. We aim to respond to customer support requests within 3 business days.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without any warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.
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
          </>
        )}
      </div>
    </div>
  );
}
