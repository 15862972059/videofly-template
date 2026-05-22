/**
 * ============================================
 * 用户配置文件 - 价格和积分
 * ============================================
 *
 * 📖 使用指南
 * -----------
 * 这个文件包含了所有与价格、积分相关的配置。
 *
 * 🎯 主要配置项：
 * 1. 基础设置 - 新用户赠送、过期规则
 * 2. 订阅产品 - 月付/年付订阅价格和积分
 * 3. 积分包 - 一次性购买积分包
 * 4. 模型计费 - 各 AI 模型的积分消耗规则
 *
 * 📝 修改方法：
 * - 直接修改下面的数值即可（价格用美元，不是美分）
 * - 保存后自动生效，无需重启服务器
 * - 要禁用某个产品，将 enabled 改为 false
 *
 * ⚠️ 注意事项：
 * - id 字段：必须填入 Creem 后台的 Product ID（格式：prod_xxx）
 * - 价格使用美元单位（如 9.9 表示 $9.90）
 * - 积分数量是整数
 * - allowFreeUser: 是否允许免费用户购买（可选，默认 true）
 *
 * 🔄 Creem 配置流程：
 * 1. 在 Creem 后台创建产品（订阅和积分包）
 * 2. 将 Product ID 填入 .env 环境变量
 * 3. 产品 ID 从环境变量读取（见下方配置）
 * 4. 价格和积分数量在此文件中修改
 *
 * ============================================
 */

// ============================================
// 类型定义（内部使用）
// ============================================

/** 视频模型积分配置 */
export interface VideoModelPricing {
  baseCredits: number;
  perSecond: number;
  qualityMultiplier?: number;
  enabled: boolean;
}

/** 订阅产品配置 */
export interface SubscriptionProductConfig {
  id: string;
  name: string;
  priceUsd: number;
  credits: number;
  period: "month" | "year";
  popular?: boolean;
  enabled: boolean;
  features?: string[];
}

/** 积分包配置 */
export interface CreditPackageConfig {
  id: string;
  name: string;
  priceUsd: number;
  credits: number;
  popular?: boolean;
  enabled: boolean;
  /** 是否允许免费用户购买（可选，默认 true） */
  allowFreeUser?: boolean;
  features?: string[];
}

// ============================================
// 一、基础设置
// ============================================

/**
 * 新用户注册赠送积分
 */
export const NEW_USER_GIFT = {
  /** 是否启用赠送 */
  enabled: true,
  /** 赠送积分数量 */
  credits: 1,  // 1 gpt-image-2 generation
  /** 积分有效期（天）*/
  validDays: 30,
};

/**
 * 积分过期设置
 */
export const CREDIT_EXPIRATION = {
  /** 订阅积分有效期（天）- 月付用户 */
  subscriptionDays: 30,
  /** 一次性购买积分有效期（天）- 单独购买积分包 */
  purchaseDays: 365,
  /** 提前多少天提醒积分即将过期 */
  warnBeforeDays: 7,
};

// ============================================
// 二、订阅产品配置
// ============================================

/**
 * 订阅产品列表
 *
 * 每个产品包含：
 * - id: Creem Product ID（从 Creem 后台复制，如 prod_xxx）
 * - name: 显示名称
 * - priceUsd: 价格（美元）
 * - credits: 每周期赠送积分
 * - period: 付费周期 ("month" 或 "year")
 * - popular: 是否标记为推荐（最多选1-2个）
 * - enabled: 是否启用该产品
 *
 * ⚠️ 重要：id 字段必须是 Creem 后台的 Product ID（格式：prod_xxx）
 * 在 Creem 后台创建产品后，复制 Product ID 到下方对应的 id 字段
 */
export const SUBSCRIPTION_PRODUCTS = [
  // ===== 月付订阅 =====
  {
    id: process.env.NEXT_PUBLIC_CREEM_PROD_STARTER ?? "prod_6A9SRQbWJXV0Q5eCHFPI1v",
    name: "Starter Plan",
    priceUsd: 9.0,
    credits: 80,
    period: "month" as const,
    popular: false,
    enabled: true,
    features: ["gpt_image_2_access", "commercial_use"],
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_PROD_CREATOR ?? "prod_6DEwZIYGuoKkjV0qRUiBgX",
    name: "Creator Plan",
    priceUsd: 19.0,
    credits: 220,
    period: "month" as const,
    popular: true,
    enabled: true,
    features: ["gpt_image_2_access", "commercial_use", "priority_support"],
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_PROD_STUDIO ?? "prod_JBIsy11enTfthGi3Dh0tO",
    name: "Studio Plan",
    priceUsd: 49.0,
    credits: 700,
    period: "month" as const,
    popular: false,
    enabled: true,
    features: ["gpt_image_2_access", "commercial_use", "priority_support", "api_access"],
  },

  // ===== 年付订阅（月付 × 10，省 2 个月） =====
  {
    id: "prod_3tlZPSRNHZSaNq22zX2Z10",
    name: "Starter Plan (Yearly)",
    priceUsd: 90,
    credits: 960,
    period: "year" as const,
    popular: false,
    enabled: false,
    features: ["gpt_image_2_access", "commercial_use"],
  },
  {
    id: "prod_3tlZPSRNHZSaNq22zX2Z55",
    name: "Creator Plan (Yearly)",
    priceUsd: 190,
    credits: 2640,
    period: "year" as const,
    popular: true,
    enabled: false,
    features: ["gpt_image_2_access", "commercial_use", "priority_support"],
  },
  {
    id: "prod_3tlZPSRNHZSaNq22zX2Z21",
    name: "Studio Plan (Yearly)",
    priceUsd: 490,
    credits: 8400,
    period: "year" as const,
    popular: false,
    enabled: false,
    features: ["gpt_image_2_access", "commercial_use", "priority_support", "api_access"],
  },
];

// ============================================
// 三、一次性购买积分包
// ============================================

/**
 * 积分包产品列表
 *
 * 用户可以单独购买积分包（不订阅）
 *
 * allowFreeUser 说明：
 * - true:  所有用户都可以购买此积分包
 * - false: 只有订阅用户才能购买此积分包
 * - 不填: 默认为 true（所有用户可购买）
 *
 * ⚠️ 重要：id 字段必须是 Creem 后台的 Product ID（格式：prod_xxx）
 */
export const CREDIT_PACKAGES: CreditPackageConfig[] = [
  {
    id: process.env.NEXT_PUBLIC_CREEM_CREDITS_30 ?? "prod_z6adXPBO5ooKnA7aQkBFA",
    name: "30 Credits",
    priceUsd: 5.0,
    credits: 30,
    popular: false,
    enabled: true,
    allowFreeUser: true,
    features: ["gpt_image_2_access", "commercial_use"],
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_CREDITS_120 ?? "prod_70sgwHtOjQpnf7GrWD32M9",
    name: "120 Credits",
    priceUsd: 15.0,
    credits: 120,
    popular: false,
    enabled: true,
    allowFreeUser: true,
    features: ["gpt_image_2_access", "commercial_use"],
  },
  {
    id: process.env.NEXT_PUBLIC_CREEM_CREDITS_360 ?? "prod_6LZ9FdJCp91McBuoYUlXoJ",
    name: "360 Credits",
    priceUsd: 39.0,
    credits: 360,
    popular: false,
    enabled: true,
    allowFreeUser: true,
    features: ["gpt_image_2_access", "commercial_use", "priority_support"],
  },
];

// ============================================
// 四、AI 模型积分计费
// ============================================

/**
 * 图片生成积分配置
 */
export const IMAGE_MODEL_PRICING = {
  /** Lowest-cost image generation starts at 1 site credits. */
  minCreditCost: 1,
  /** Primary low-cost model for new user trial. */
  trialModel: "gpt-image-2",
  /** Primary low-cost quality for new user trial. */
  trialQuality: "auto",
} as const;

/**
 * 视频生成模型积分配置
 *
 * 💡 定价说明（基于 Evolink 1:1 成本，向上取整）:
 *
 * 1. **Veo 3.1 Fast Lite**: 固定 10 积分（基准价格）
 * 2. **Sora 2 Lite**: 10s=2积分, 15s=3积分 (无水印)
 * 3. **Wan 2.6**: 720p: 5s=25积分, 10s=50积分, 15s=75积分
 *              1080p × 1.67 倍
 * 4. **Seedance 1.5 Pro**: 按秒计费, 默认有音频
 *                          480p: 1.636 Credits/秒 → 2 积分/秒
 *                          720p: 3.557 Credits/秒 → 4 积分/秒
 *                          1080p: 7.932 Credits/秒 → 8 积分/秒
 *
 * 计费规则说明：
 * - baseCredits: 基础积分（最短时长、最低画质）
 * - perSecond: 每秒积分（用于按秒计费的模型）
 * - qualityMultiplier: 画质乘数（1080p vs 720p）
 */
export const VIDEO_MODEL_PRICING: Record<string, VideoModelPricing> = {
  /** Seedance 1.5 Pro - 按秒计费（默认有音频） */
  "seedance-1.5-pro": {
    baseCredits: 0,
    perSecond: 4, // 720p 有音频: 3.557 Credits/秒 → 4 积分/秒
    qualityMultiplier: 2, // 1080p = 720p × 2
    enabled: true,
  },

  /** Seedance 1.0 Pro Fast - 快速生成（APImart） */
  "seedance-1.0-pro-fast": {
    baseCredits: 0,
    perSecond: 3, // 按秒计费
    qualityMultiplier: 2,
    enabled: true,
  },

  /** Seedance 1.0 Pro Quality - 高质量生成（APImart） */
  "seedance-1.0-pro-quality": {
    baseCredits: 0,
    perSecond: 5, // 高质量，每秒积分更高
    qualityMultiplier: 2,
    enabled: true,
  },

  /** Veo 3.1 Fast Lite - Google (暂时隐藏) */
  "veo-3.1": {
    baseCredits: 10,
    perSecond: 0,
    enabled: false,
  },

  /** Sora 2 Lite - OpenAI (暂时隐藏) */
  "sora-2": {
    baseCredits: 2,
    perSecond: 0,
    enabled: false,
  },

  /** Wan 2.6 (暂时隐藏) */
  "wan2.6": {
    baseCredits: 25,
    perSecond: 5,
    qualityMultiplier: 1.67,
    enabled: false,
  },
};

// ============================================
// 五、支付配置（环境变量）
// ============================================

/**
 * 支付提供商配置
 *
 * 这些配置通常在 .env.local 文件中设置
 * 这里只是说明，不需要修改
 */
export const PAYMENT_CONFIG = {
  /** 使用 Creem 支付 */
  provider: "creem",
  /** Creem Webhook URL（用于接收支付状态通知）*/
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/creem/webhook`
    : "",
};
