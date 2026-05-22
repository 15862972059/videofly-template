export const metadata = {
  title: "Acceptable Use Policy - AI2ART",
  description: "Acceptable Use Policy for AI2ART image generation and remix tools",
};

export default function AcceptableUsePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-24">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Acceptable Use Policy</h1>
        <p className="lead">Effective Date: May 22, 2026</p>

        <p>
          AI2ART is designed for lawful, respectful, and consent-based AI image
          creation. This policy applies to all prompts, uploaded images, generated
          images, and other content submitted to or created with AI2ART.
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
          Only upload photos that you own, have licensed, or have permission to
          use. If a photo includes another person, you are responsible for having
          their consent before using AI2ART to remix or generate images from it.
        </p>

        <h2>3. AI Safety Screening</h2>
        <p>
          AI2ART screens prompts before generation and may block prompts that
          violate this policy or our payment processor's content rules. We may
          remove content, limit access, suspend accounts, or report unlawful use
          when necessary.
        </p>

        <h2>4. Commercial Use</h2>
        <p>
          Paid plans may include commercial usage rights for generated assets,
          but those rights do not override laws, third-party licenses, model
          provider policies, or this Acceptable Use Policy.
        </p>

        <h2>5. Contact</h2>
        <p>
          If you have questions about whether a use case is allowed, contact us
          at: support@ai2art.net
        </p>
      </div>
    </div>
  );
}
