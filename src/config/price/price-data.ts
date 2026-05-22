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

/**
 * 定价数据配置
 *
 * 基于 PRICING_REFERENCE.md 文档：
 * - Basic: $9.90/月, $99/年, 160积分/月 (1920积分/年)
 * - Pro: $29.90/月, $299/年, 540积分/月 (6480积分/年)
 * - Ultimate: $79.90/月, $799/年, 1600积分/月 (19200积分/年)
 *
 * 年付 = 月付 × 10（买 10 送 2，省 2 个月）
 *
 * 数据来源：从 SUBSCRIPTION_PRODUCTS (pricing-user.ts) 自动生成
 */

/**
 * 根据 SUBSCRIPTION_PRODUCTS 生成前端展示数据
 */
function generatePriceData() {
  // 按 period 和 name 分组产品
  const enabledProducts = SUBSCRIPTION_PRODUCTS.filter((product) => product.enabled);
  const monthlyProducts = enabledProducts.filter((product) => product.period === "month");
  const yearlyProducts = enabledProducts.filter((product) => product.period === "year");

  // 映射计划名称到展示 ID
  const planIdMap: Record<string, string> = {
    "Basic Plan": "basic",
    "Basic Plan (Yearly)": "basic",
    "Pro Plan": "pro",
    "Pro Plan (Yearly)": "pro",
    "Ultimate Plan": "ultimate",
    "Ultimate Plan (Yearly)": "ultimate",
  };

  // 生成价格映射
  const pricesMap: Record<string, { monthly: number; yearly: number }> = {};
  const creditsMap: Record<string, { monthly: number; yearly: number }> = {};
  const popularMap: Record<string, boolean> = {};

  for (const product of enabledProducts) {
    const planId = planIdMap[product.name];
    if (!planId) continue;

    if (!pricesMap[planId]) {
      pricesMap[planId] = { monthly: 0, yearly: 0 };
      creditsMap[planId] = { monthly: 0, yearly: 0 };
      popularMap[planId] = product.popular || false;
    }

    if (product.period === "month") {
      pricesMap[planId].monthly = product.priceUsd;
      creditsMap[planId].monthly = product.credits;
    } else {
      pricesMap[planId].yearly = product.priceUsd;
      creditsMap[planId].yearly = product.credits;
    }
  }

  // 定义计划特性
  const planFeatures: Record<string, { benefits: Record<string, string[]>; limitations: Record<string, string[]>; description: Record<string, string> }> = {
    basic: {
      description: {
        zh: "适合初学者和个人用户",
        en: "For beginners and individuals",
      },
      benefits: {
        zh: [
          "每月 70 积分（约 70 次生图）",
          "GPT-Image-2 核心大模型接入",
          "AI 图片生成与合成",
          "商业使用权",
        ],
        en: [
          "70 credits/month (~70 images)",
          "GPT-Image-2 Core Model Access",
          "AI image generation and remix",
          "Commercial license",
        ],
      },
      limitations: {
        zh: [
          "无优先客服支持",
          "无 API 访问权限",
        ],
        en: [
          "No priority support",
          "No API access",
        ],
      },
    },
    pro: {
      description: {
        zh: "推荐给专业用户和创作者",
        en: "Recommended for professionals and creators",
      },
      benefits: {
        zh: [
          "每月 220 积分（约 220 次生图）",
          "GPT-Image-2 核心大模型接入",
          "AI 图片生成与合成",
          "商业使用权",
          "优先客服支持",
        ],
        en: [
          "220 credits/month (~220 images)",
          "GPT-Image-2 Core Model Access",
          "AI image generation and remix",
          "Commercial license",
          "Priority customer support",
        ],
      },
      limitations: {
        zh: ["无 API 访问权限"],
        en: ["No API access"],
      },
    },
    ultimate: {
      description: {
        zh: "适合团队和企业用户",
        en: "For teams and enterprises",
      },
      benefits: {
        zh: [
          "每月 600 积分（约 600 次生图）",
          "GPT-Image-2 核心大模型接入",
          "AI 图片生成与合成",
          "商业使用权",
          "优先客服支持",
          "API 访问权限",
        ],
        en: [
          "600 credits/month (~600 images)",
          "GPT-Image-2 Core Model Access",
          "AI image generation and remix",
          "Commercial license",
          "Priority customer support",
          "API access",
        ],
      },
      limitations: {
        zh: [],
        en: [],
      },
    },
  };

  const plans: ("basic" | "pro" | "ultimate")[] = ["basic", "pro", "ultimate"];

  // 生成中文数据
  const zhData = plans.map((planId) => ({
    id: planId,
    title: planId.charAt(0).toUpperCase() + planId.slice(1),
    description: planFeatures[planId].description.zh,
    benefits: planFeatures[planId].benefits.zh,
    limitations: planFeatures[planId].limitations.zh,
    prices: pricesMap[planId],
    credits: creditsMap[planId],
    popular: popularMap[planId],
  }));

  // 生成英文数据
  const enData = plans.map((planId) => ({
    id: planId,
    title: planId.charAt(0).toUpperCase() + planId.slice(1),
    description: planFeatures[planId].description.en,
    benefits: planFeatures[planId].benefits.en,
    limitations: planFeatures[planId].limitations.en,
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
