import { SUBSCRIPTION_PRODUCTS } from "@/config/pricing-user";

export interface SubscriptionPlanTranslation {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  credits?: {
    monthly: number;
    yearly: number;
  };
}

type PlanId = "basic" | "pro" | "ultimate";

function generatePriceData() {
  const enabledProducts = SUBSCRIPTION_PRODUCTS.filter((product) => product.enabled);

  const planIdMap: Record<string, PlanId> = {
    "Starter Plan": "basic",
    "Starter Plan (Yearly)": "basic",
    "Creator Plan": "pro",
    "Creator Plan (Yearly)": "pro",
    "Studio Plan": "ultimate",
    "Studio Plan (Yearly)": "ultimate",
  };

  const pricesMap: Record<PlanId, { monthly: number; yearly: number }> = {
    basic: { monthly: 0, yearly: 0 },
    pro: { monthly: 0, yearly: 0 },
    ultimate: { monthly: 0, yearly: 0 },
  };

  const creditsMap: Record<PlanId, { monthly: number; yearly: number }> = {
    basic: { monthly: 0, yearly: 0 },
    pro: { monthly: 0, yearly: 0 },
    ultimate: { monthly: 0, yearly: 0 },
  };

  const popularMap: Record<PlanId, boolean> = {
    basic: false,
    pro: false,
    ultimate: false,
  };

  for (const product of enabledProducts) {
    const planId = planIdMap[product.name];
    if (!planId) continue;

    popularMap[planId] = popularMap[planId] || Boolean(product.popular);

    if (product.period === "month") {
      pricesMap[planId].monthly = product.priceUsd;
      creditsMap[planId].monthly = product.credits;
    } else {
      pricesMap[planId].yearly = product.priceUsd;
      creditsMap[planId].yearly = product.credits;
    }
  }

  const planMeta: Record<
    PlanId,
    {
      title: { zh: string; en: string };
      description: { zh: string; en: string };
      benefits: { zh: string[]; en: string[] };
      limitations: { zh: string[]; en: string[] };
    }
  > = {
    basic: {
      title: { zh: "Starter", en: "Starter" },
      description: {
        zh: "适合轻度创作和入门体验",
        en: "Great for getting started",
      },
      benefits: {
        zh: [
          "每月 250 积分",
          "AI image generation access",
          "AI 图片生成与重绘",
          "商业使用授权",
        ],
        en: [
          "250 credits/month",
          "AI image generation access",
          "AI image generation and remix",
          "Commercial license",
        ],
      },
      limitations: {
        zh: ["无优先支持", "无高级协作权益"],
        en: ["No priority support", "No advanced collaboration perks"],
      },
    },
    pro: {
      title: { zh: "Creator", en: "Creator" },
      description: {
        zh: "适合高频创作者",
        en: "Best for active creators",
      },
      benefits: {
        zh: [
          "每月 600 积分",
          "AI image generation access",
          "AI 图片生成与重绘",
          "商业使用授权",
          "优先支持",
        ],
        en: [
          "600 credits/month",
          "AI image generation access",
          "AI image generation and remix",
          "Commercial license",
          "Priority customer support",
        ],
      },
      limitations: {
        zh: ["无团队协作权益"],
        en: ["No team collaboration perks"],
      },
    },
    ultimate: {
      title: { zh: "Studio", en: "Studio" },
      description: {
        zh: "适合工作室与团队协作",
        en: "Built for studios and teams",
      },
      benefits: {
        zh: [
          "每月 1800 积分",
          "AI image generation access",
          "AI 图片生成与重绘",
          "商业使用授权",
          "优先支持",
          "团队协作权益",
        ],
        en: [
          "1800 credits/month",
          "AI image generation access",
          "AI image generation and remix",
          "Commercial license",
          "Priority customer support",
          "Team collaboration perks",
        ],
      },
      limitations: {
        zh: [],
        en: [],
      },
    },
  };

  const plans: PlanId[] = ["basic", "pro", "ultimate"];

  const zhData = plans.map((planId) => ({
    id: planId,
    title: planMeta[planId].title.zh,
    description: planMeta[planId].description.zh,
    benefits: planMeta[planId].benefits.zh,
    limitations: planMeta[planId].limitations.zh,
    prices: pricesMap[planId],
    credits: creditsMap[planId],
    popular: popularMap[planId],
  }));

  const enData = plans.map((planId) => ({
    id: planId,
    title: planMeta[planId].title.en,
    description: planMeta[planId].description.en,
    benefits: planMeta[planId].benefits.en,
    limitations: planMeta[planId].limitations.en,
    prices: pricesMap[planId],
    credits: creditsMap[planId],
    popular: popularMap[planId],
  }));

  return { zh: zhData, en: enData };
}

const generatedData = generatePriceData();

export const priceDataMap: Record<string, SubscriptionPlanTranslation[]> = {
  zh: generatedData.zh,
  en: generatedData.en,
};
