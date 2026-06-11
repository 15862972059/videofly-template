import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const alternates = buildAlternates("/acceptable-use", locale);

  return {
    title: locale === "zh" ? "可接受使用政策 - AI2ART" : "Acceptable Use Policy - AI2ART",
    description:
      locale === "zh"
        ? "AI2ART 图像生成与重绘工具的可接受使用政策"
        : "Acceptable Use Policy for AI2ART image generation and remix tools",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function AcceptableUsePage({
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
            <h1>可接受使用政策</h1>
            <p className="lead">生效日期：2026 年 5 月 22 日</p>

            <p>
              AI2ART 用于合法、尊重他人并基于同意的 AI 图像创作。本政策适用于提交给 AI2ART 或通过 AI2ART 创建的所有提示词、上传图片、生成图片及其他内容。
            </p>

            <h2>1. 禁止内容</h2>
            <p>您不得使用 AI2ART 创建、上传、请求或传播以下内容：</p>
            <ul>
              <li>NSFW、色情、露骨、性暗示或成人内容。</li>
              <li>涉及未成年人的性、剥削或不安全情境内容。</li>
              <li>非自愿的私密图像、骚扰、跟踪或羞辱性内容。</li>
              <li>未经明确许可的换脸、深度伪造、冒充或他人人脸操控内容。</li>
              <li>利用公众人物、私人个体或名人制造误导、诽谤、冒充或暗示其背书的图像。</li>
              <li>血腥暴力、自残、极端主义、仇恨符号或鼓励非法活动的内容。</li>
              <li>侵犯版权、商标、隐私权、肖像权或其他第三方权利的内容。</li>
            </ul>

            <h2>2. 同意与图像权利</h2>
            <p>
              仅上传您拥有、已获授权或有使用许可的照片。如果照片中包含他人，您有责任在使用 AI2ART 进行重绘或生成之前获得其同意。
            </p>

            <h2>3. AI 安全审核</h2>
            <p>
              AI2ART 会在生成前审核提示词，并可能拦截违反本政策或支付处理商内容规则的请求。必要时，我们可能删除内容、限制访问、暂停账户或报告违法使用。
            </p>

            <h2>4. 商业使用</h2>
            <p>
              付费方案可能包含生成内容的商业使用权，但这些权利并不凌驾于法律、第三方许可、模型提供方政策或本可接受使用政策之上。
            </p>

            <h2>5. 联系方式</h2>
            <p>
              如果您不确定某种使用场景是否被允许，请联系：support@ai2art.net
            </p>
          </>
        ) : (
          <>
            <h1>Acceptable Use Policy</h1>
            <p className="lead">Effective Date: May 22, 2026</p>

            <p>
              AI2ART is designed for lawful, respectful, and consent-based AI image creation. This policy applies to all prompts, uploaded images, generated images, and other content submitted to or created with AI2ART.
            </p>

            <h2>1. Prohibited Content</h2>
            <p>You may not use AI2ART to create, upload, request, or distribute:</p>
            <ul>
              <li>NSFW, pornographic, sexually explicit, sexually suggestive, or adult content.</li>
              <li>Content involving minors in sexual, exploitative, or unsafe contexts.</li>
              <li>Non-consensual intimate imagery, harassment, stalking, or humiliation.</li>
              <li>Deepfakes, face swaps, impersonation, or face manipulation of another person without clear permission.</li>
              <li>Images of public figures, private individuals, or celebrities used to mislead, defame, impersonate, or imply endorsement.</li>
              <li>Graphic violence, gore, self-harm, extremist content, hate symbols, or content promoting illegal activity.</li>
              <li>Content that infringes copyright, trademarks, privacy rights, publicity rights, or other third-party rights.</li>
            </ul>

            <h2>2. Consent and Image Rights</h2>
            <p>
              Only upload photos that you own, have licensed, or have permission to use. If a photo includes another person, you are responsible for having their consent before using AI2ART to remix or generate images from it.
            </p>

            <h2>3. AI Safety Screening</h2>
            <p>
              AI2ART screens prompts before generation and may block prompts that violate this policy or our payment processor&apos;s content rules. We may remove content, limit access, suspend accounts, or report unlawful use when necessary.
            </p>

            <h2>4. Commercial Use</h2>
            <p>
              Paid plans may include commercial usage rights for generated assets, but those rights do not override laws, third-party licenses, model provider policies, or this Acceptable Use Policy.
            </p>

            <h2>5. Contact</h2>
            <p>
              If you have questions about whether a use case is allowed, contact us at: support@ai2art.net
            </p>
          </>
        )}
      </div>
    </div>
  );
}
