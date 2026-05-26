interface SafetyRule {
  category: string;
  terms: string[];
}

const BLOCKED_RULES: SafetyRule[] = [
  {
    category: "sexual or explicit content",
    terms: [
      "adult content",
      "bdsm",
      "explicit",
      "erotic",
      "fetish",
      "genital",
      "hardcore",
      "naked",
      "nsfw",
      "nude",
      "nudity",
      "onlyfans",
      "orgasm",
      "porn",
      "pornographic",
      "seductive",
      "sex act",
      "sexual content",
      "strip",
      "topless",
      "xxx",
      "不雅",
      "成人内容",
      "色情",
      "裸",
      "裸体",
      "露点",
      "性行为",
      "黄色",
    ],
  },
  {
    category: "sexual content involving minors",
    terms: [
      "child sexual",
      "child nude",
      "minor nude",
      "sexual minor",
      "underage",
      "teen nude",
      "lolita",
      "pedo",
      "jailbait",
      "preteen",
      "toddlercon",
      "未成年裸",
      "儿童色情",
      "萝莉色情",
    ],
  },
  {
    category: "graphic violence or self-harm",
    terms: [
      "bloodbath",
      "dismemberment",
      "execution",
      "gore",
      "graphic violence",
      "hanging",
      "massacre",
      "mutilation",
      "self-harm",
      "suicide",
      "torture",
      "血腥",
      "肢解",
      "酷刑",
      "自残",
      "自杀",
      "处决",
      "屠杀",
    ],
  },
  {
    category: "non-consensual or deceptive imagery",
    terms: [
      "celebrity deepfake",
      "deepfake",
      "face swap celebrity",
      "non-consensual",
      "revenge porn",
      "upskirt",
      "voyeur",
      "偷拍",
      "换脸明星",
      "未同意",
      "复仇色情",
    ],
  },
  {
    category: "hate, extremism, or harassment",
    terms: [
      "extremist",
      "genocide",
      "hate symbol",
      "racial slur",
      "terrorist",
      "white power",
      "nazi",
      "纳粹",
      "恐怖主义",
      "极端主义",
      "种族灭绝",
      "仇恨符号",
    ],
  },
  {
    category: "illegal or regulated activity",
    terms: [
      "bomb making",
      "build a bomb",
      "counterfeit money",
      "credit card fraud",
      "drug trafficking",
      "fake passport",
      "fake id",
      "hack bank",
      "malware",
      "phishing",
      "weapon manufacturing",
      "洗钱",
      "制毒",
      "贩毒",
      "诈骗",
      "钓鱼网站",
      "伪造证件",
      "假护照",
      "制造炸弹",
      "制作炸弹",
      "恶意软件",
      "非法武器",
    ],
  },
];

export class LocalPromptSafetyRejectedError extends Error {
  constructor(category: string) {
    super(`Your prompt violates our content policy (${category}). Please revise it and try again.`);
    this.name = "LocalPromptSafetyRejectedError";
  }
}

export function assertPromptAllowed(prompt: string): void {
  const lowerPrompt = prompt.toLowerCase();

  for (const rule of BLOCKED_RULES) {
    for (const term of rule.terms) {
      if (lowerPrompt.includes(term.toLowerCase())) {
        throw new LocalPromptSafetyRejectedError(rule.category);
      }
    }
  }
}

export function isPromptAllowed(prompt: string): boolean {
  try {
    assertPromptAllowed(prompt);
    return true;
  } catch {
    return false;
  }
}

export function getBlockedTerms(): string[] {
  return BLOCKED_RULES.flatMap((rule) => rule.terms);
}
