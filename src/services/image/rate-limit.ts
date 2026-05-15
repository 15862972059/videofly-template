import { and, eq, gte, sql } from "drizzle-orm";
import { db, rateLimitEvents } from "@/db";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  "image:text": { maxRequests: 20, windowMs: 3600000 },
  "image:remix": { maxRequests: 10, windowMs: 3600000 },
  "image:upload": { maxRequests: 30, windowMs: 3600000 },
};

function getWindowStart(windowMs: number): Date {
  const now = Date.now();
  return new Date(now - (now % windowMs));
}

export async function checkRateLimit(
  userId: string,
  scope: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const limitConfig = config ?? DEFAULT_LIMITS[scope] ?? { maxRequests: 20, windowMs: 3600000 };
  const windowStart = getWindowStart(limitConfig.windowMs);
  const resetAt = windowStart.getTime() + limitConfig.windowMs;

  const rows = await db
    .select()
    .from(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.userId, userId),
        eq(rateLimitEvents.scope, scope),
        eq(rateLimitEvents.windowStart, windowStart)
      )
    )
    .limit(1);

  const record = rows[0];
  const currentCount = record?.count ?? 0;
  const remaining = Math.max(0, limitConfig.maxRequests - currentCount);

  return {
    allowed: currentCount < limitConfig.maxRequests,
    remaining,
    resetAt,
  };
}

export async function incrementRateLimit(
  userId: string,
  scope: string,
  config?: RateLimitConfig
): Promise<void> {
  const limitConfig = config ?? DEFAULT_LIMITS[scope] ?? { maxRequests: 20, windowMs: 3600000 };
  const windowStart = getWindowStart(limitConfig.windowMs);

  await db
    .insert(rateLimitEvents)
    .values({
      userId,
      scope,
      windowStart,
      count: 1,
    })
    .onConflictDoUpdate({
      target: [
        rateLimitEvents.userId,
        rateLimitEvents.scope,
        rateLimitEvents.windowStart,
      ],
      set: {
        count: sql`${rateLimitEvents.count} + 1`,
        updatedAt: new Date(),
      },
    });
}

export async function resetRateLimit(userId: string, scope: string): Promise<void> {
  const windowStart = getWindowStart(DEFAULT_LIMITS[scope]?.windowMs ?? 3600000);

  await db
    .delete(rateLimitEvents)
    .where(
      and(
        eq(rateLimitEvents.userId, userId),
        eq(rateLimitEvents.scope, scope),
        gte(rateLimitEvents.windowStart, windowStart)
      )
    );
}

export function getDefaultLimitConfig(scope: string): RateLimitConfig {
  return DEFAULT_LIMITS[scope] ?? { maxRequests: 20, windowMs: 3600000 };
}
