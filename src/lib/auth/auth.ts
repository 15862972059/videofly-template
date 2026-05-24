import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { creem } from "@creem_io/better-auth";
import { magicLink } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import {
  CreditTransType,
  creditService,
} from "@/services/credit";
import { syncCreemSubscription } from "@/services/creem-subscription";
import {
  getProductById,
  getProductExpiryDays,
} from "@/config/credits";
import {
  buildCreemOneTimeOrderNo,
  buildCreemSubscriptionCreditOrderNo,
  extractCreemId,
} from "./creem-webhook";

import { creditPackages, db, users } from "@/db";
import * as schema from "@/db/schema";
import { env } from "./env.mjs";
import { eq } from "drizzle-orm";

const toLogString = (value: unknown) => {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "string") return value;
  const normalized =
    value instanceof Error
      ? {
        name: value.name,
        message: value.message,
        stack: value.stack,
        status: (value as unknown as Record<string, unknown>).status,
        statusText: (value as unknown as Record<string, unknown>).statusText,
        error: (value as unknown as Record<string, unknown>).error,
      }
      : value;
  const seen = new WeakSet();
  try {
    return JSON.stringify(normalized, (_key, val) => {
      if (typeof val === "bigint") return val.toString();
      if (typeof val === "function") return "[Function]";
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    });
  } catch {
    return String(normalized);
  }
};

const debugLogger =
  process.env.NODE_ENV === "development"
    ? {
      level: "debug" as const,
      log: (level: "debug" | "info" | "warn" | "error", message: string, ...args: unknown[]) => {
        const suffix = args.length ? ` ${args.map(toLogString).join(" ")}` : "";
        const line = `[Better Auth] ${message}${suffix}`.trimEnd();
        if (level === "error") console.error(line);
        else if (level === "warn") console.warn(line);
        else console.log(line);
      },
    }
    : undefined;

type AuthPlugin =
  | ReturnType<typeof nextCookies>
  | ReturnType<typeof magicLink>
  | ReturnType<typeof creem>;

const plugins: AuthPlugin[] = [
  // Avoid Next.js dev DataCloneError from cookies() in some environments.
  ...(process.env.NODE_ENV === "development" ? [] : [nextCookies()]),
  magicLink({
    sendMagicLink: async ({ email, url }) => {
      // Dynamic import to avoid Edge Runtime issues in middleware
      const { MagicLinkEmail } = await import(
        "@/lib/emails/magic-link-email"
      );
      const { resend } = await import("@/lib/email");
      const { siteConfig } = await import("@/config/site");

      // Check if user exists to determine email type
      const [existingUser] = await db
        .select({ name: users.name, emailVerified: users.emailVerified })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const userVerified = !!existingUser?.emailVerified;
      const authSubject = userVerified
        ? `Sign-in link for ${(siteConfig as { name: string }).name}`
        : "Activate your account";

      try {
        await resend.emails.send({
          from: env.RESEND_FROM,
          to: email,
          subject: authSubject,
          react: MagicLinkEmail({
            firstName: existingUser?.name ?? "",
            actionUrl: url,
            mailType: userVerified ? "login" : "register",
            siteName: (siteConfig as { name: string }).name,
          }),
          headers: {
            "X-Entity-Ref-ID": new Date().getTime() + "",
          },
        });
      } catch (error) {
        console.error("Failed to send magic link email:", error);
        throw error;
      }
    },
    expiresIn: 300, // 5 minutes
  }),
];

if (env.CREEM_API_KEY) {
  if (!env.CREEM_WEBHOOK_SECRET) {
    throw new Error("CREEM_WEBHOOK_SECRET is required when CREEM_API_KEY is configured");
  }

  plugins.push(
    creem({
      apiKey: env.CREEM_API_KEY,
      webhookSecret: env.CREEM_WEBHOOK_SECRET,
      testMode: env.CREEM_API_KEY.startsWith("creem_test_"),
      persistSubscriptions: true,
      defaultSuccessUrl: "/dashboard",

      onGrantAccess: async ({
        reason,
        id,
        status,
        product,
        metadata,
        current_period_end_date,
      }) => {
        const userId = metadata?.referenceId as string | undefined;
        console.log(`[Creem] onGrantAccess called`, {
          reason,
          subscriptionId: id,
          status,
          productId: product?.id,
          productName: product?.name,
          referenceId: userId,
        });

        await syncCreemSubscription({
          userId,
          productId: product?.id,
          subscriptionId: id,
          status: status ?? reason.replace("subscription_", ""),
          currentPeriodEnd: current_period_end_date,
        });
      },

      onSubscriptionPaid: async (subscriptionData) => {
        const { product, metadata } = subscriptionData;
        const productConfig = getProductById(product.id);
        if (!productConfig) {
          console.error(`[Creem] Unknown product: ${product.id}`);
          return;
        }

        const credits = productConfig.credits;
        if (credits <= 0) return;

        // 从 metadata 获取用户 ID（Creem 插件在 checkout 时自动设置 referenceId）
        const meta = (metadata ?? {}) as Record<string, unknown>;
        const userId = meta.referenceId as string | undefined;

        if (!userId) {
          console.error(`[Creem] No referenceId in metadata, cannot process subscription`);
          return;
        }

        // Use paid-event identifiers so monthly renewals grant once per billing event.
        const orderNo = buildCreemSubscriptionCreditOrderNo({
          reason: "subscription_paid",
          subscriptionId: subscriptionData.id,
          lastTransactionId:
            subscriptionData.last_transaction_id ??
            extractCreemId(subscriptionData.last_transaction),
          webhookId: subscriptionData.webhookId,
          currentPeriodStart: subscriptionData.current_period_start_date?.toISOString(),
          currentPeriodEnd: subscriptionData.current_period_end_date?.toISOString(),
          userId,
        });

        if (!orderNo) {
          console.error("[Creem] Missing stable subscription payment id; skipping credit grant", {
            subscriptionId: subscriptionData.id,
            userId,
          });
          return;
        }

        const [existing] = await db
          .select({ id: creditPackages.id })
          .from(creditPackages)
          .where(eq(creditPackages.orderNo, orderNo))
          .limit(1);

        if (existing) {
          console.log(`[Creem] Duplicate webhook ignored: ${orderNo}`);
          return;
        }

        const productName = product?.name ?? productConfig.id;

        console.log(`[Creem] Processing subscription: ${productName}, credits: ${credits}, userId: ${userId}`);

        await syncCreemSubscription({
          userId,
          productId: product?.id,
          subscriptionId: subscriptionData.id,
          status: subscriptionData.status,
          currentPeriodEnd: subscriptionData.current_period_end_date,
        });

        await creditService.recharge({
          userId,
          credits,
          orderNo,
          transType: CreditTransType.SUBSCRIPTION,
          expiryDays: getProductExpiryDays(productConfig),
          remark: `Creem payment: ${productName}`,
        });

        console.log(`[Creem] Subscription processed: ${orderNo}`);
      },

      onRevokeAccess: async ({
        reason,
        id,
        status,
        customer,
        product,
        metadata,
        current_period_end_date,
      }) => {
        const userId = metadata?.referenceId as string | undefined;
        console.log("Creem access revoked:", { reason, customer, product, userId });

        await syncCreemSubscription({
          userId,
          productId: product?.id,
          subscriptionId: id,
          status: status ?? reason.replace("subscription_", ""),
          currentPeriodEnd: current_period_end_date,
        });
      },

      // 处理一次性购买（checkout.completed 事件不触发 onGrantAccess）
      onSubscriptionCanceled: async (subscriptionData) => {
        await syncCreemSubscription({
          userId: subscriptionData.metadata?.referenceId as string | undefined,
          productId: subscriptionData.product?.id,
          subscriptionId: subscriptionData.id,
          status: subscriptionData.status,
          currentPeriodEnd: subscriptionData.current_period_end_date,
        });
      },

      onSubscriptionUnpaid: async (subscriptionData) => {
        await syncCreemSubscription({
          userId: subscriptionData.metadata?.referenceId as string | undefined,
          productId: subscriptionData.product?.id,
          subscriptionId: subscriptionData.id,
          status: subscriptionData.status,
          currentPeriodEnd: subscriptionData.current_period_end_date,
        });
      },

      onSubscriptionUpdate: async (subscriptionData) => {
        await syncCreemSubscription({
          userId: subscriptionData.metadata?.referenceId as string | undefined,
          productId: subscriptionData.product?.id,
          subscriptionId: subscriptionData.id,
          status: subscriptionData.status,
          currentPeriodEnd: subscriptionData.current_period_end_date,
        });
      },

      onSubscriptionPastDue: async (subscriptionData) => {
        await syncCreemSubscription({
          userId: subscriptionData.metadata?.referenceId as string | undefined,
          productId: subscriptionData.product?.id,
          subscriptionId: subscriptionData.id,
          status: subscriptionData.status,
          currentPeriodEnd: subscriptionData.current_period_end_date,
        });
      },

      onCheckoutCompleted: async (checkoutData) => {
        // 只处理一次性购买（onetime）
        // billing_type 可能是 "onetime" 或 "one-time" 取决于 API 版本
        const productType = checkoutData.product?.billing_type as string;
        const referenceId = checkoutData.metadata?.referenceId as string | undefined;

        if (checkoutData.subscription?.id) {
          await syncCreemSubscription({
            userId: referenceId,
            productId: checkoutData.product?.id,
            subscriptionId: checkoutData.subscription.id,
            status: checkoutData.subscription.status,
            currentPeriodEnd: checkoutData.subscription.current_period_end_date,
          });
        }
        if (productType !== "onetime" && productType !== "one-time") {
          console.log(`[Creem] Skipping checkout.completed for subscription product`);
          return;
        }

        const product = checkoutData.product;
        const productConfig = getProductById(product.id);
        if (!productConfig) {
          console.error(`[Creem] Unknown product in checkout: ${product.id}`);
          return;
        }

        const credits = productConfig.credits;
        if (credits <= 0) return;

        // 从 metadata 获取用户 ID
        if (!referenceId) {
          console.error(`[Creem] No referenceId in checkout metadata`);
          return;
        }

        // 使用 order ID 作为唯一标识
        const orderId = typeof checkoutData.order === "object"
          ? checkoutData.order?.id
          : checkoutData.order;
        const transactionId = typeof checkoutData.order === "object"
          ? extractCreemId(checkoutData.order?.transaction)
          : undefined;
        const orderNo = buildCreemOneTimeOrderNo({
          orderId,
          checkoutId: checkoutData.id,
          transactionId,
          webhookId: checkoutData.webhookId,
        });

        if (!orderNo) {
          console.error("[Creem] Missing stable checkout payment id; skipping credit grant", {
            checkoutId: checkoutData.id,
            userId: referenceId,
          });
          return;
        }

        // 防止重复处理
        const [existing] = await db
          .select({ id: creditPackages.id })
          .from(creditPackages)
          .where(eq(creditPackages.orderNo, orderNo))
          .limit(1);

        if (existing) {
          console.log(`[Creem] Duplicate checkout ignored: ${orderNo}`);
          return;
        }

        const productName = product?.name ?? productConfig.id;

        console.log(`[Creem] Processing one-time purchase: ${productName}, credits: ${credits}, userId: ${referenceId}`);

        await creditService.recharge({
          userId: referenceId,
          credits,
          orderNo,
          transType: CreditTransType.ORDER_PAY,
          expiryDays: getProductExpiryDays(productConfig),
          remark: `Creem payment: ${productName}`,
        });

        console.log(`[Creem] One-time purchase completed: ${orderNo}`);
      },
    })
  );
}

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  logger: debugLogger,

  // Drizzle adapter with schema for Better Auth
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Plugins
  plugins,

  // Hooks - 自动赠送新用户积分（仅在注册时触发）
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // 只要有新 session 创建（注册或登录），都尝试检查并发放新用户积分
      // grantNewUserCredits 内部有幂等性检查，只会发放一次
      // 这样可以覆盖 Email 注册、OAuth 注册等所有场景
      const newSession = ctx.context?.newSession;
      if (newSession?.user?.id) {
        try {
          // 不等待这个操作，避免阻塞登录/注册响应（虽然它是异步的，但 await 会阻塞中间件链）
          // 但作为 after hook，最好还是 await 确保执行完成，反正数据库查询很快
          await creditService.grantNewUserCredits(newSession.user.id);
        } catch (error) {
          console.error("[Auth] Failed to grant new user credits:", error);
          // 不抛出错误，避免影响用户登录
        }
      }
    }),
  },

  // Google OAuth
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account", // Always show account picker
    },
  },

  // Custom user fields
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false, // Prevent users from setting this
      },
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

// Extend user type with additional fields
export type User = typeof auth.$Infer.Session.user & {
  isAdmin?: boolean | null;
};

// Session type with extended user
type BaseSession = typeof auth.$Infer.Session;
export type Session = {
  session: BaseSession["session"];
  user: User;
};
