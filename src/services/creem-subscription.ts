import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { creemSubscriptions } from "@/db/schema";

const ACTIVE_STATUSES = new Set(["active", "trialing", "paid"]);
const ACTIVE_UNTIL_PERIOD_END_STATUSES = new Set(["canceled", "unpaid"]);

export interface LocalCreemSubscriptionRecord {
  productId: string;
  subscriptionId: string;
  status: string;
  currentPeriodEnd: Date | null;
  updatedAt: Date;
}

export interface SubscriptionSnapshot {
  hasAccess: boolean;
  status: string | null;
  productId: string | null;
  periodEnd: Date | null;
  source: "database" | "creem_api" | "none";
  canManage: boolean;
}

interface CreemCustomer {
  id: string;
  email: string;
}

interface CreemTransaction {
  id: string;
  status: string;
  subscription: string | null;
  customer: string | null;
  period_end?: number;
  created_at: number;
}

interface CreemRetrievedSubscription {
  id: string;
  status: string;
  product: string | { id: string };
  current_period_end_date?: string;
  customer?: string | { id: string };
}

interface UserSubscriptionLookup {
  userId: string;
  email?: string | null;
}

interface SyncCreemSubscriptionInput {
  userId?: string | null;
  productId?: string | null;
  subscriptionId?: string | null;
  status?: string | null;
  currentPeriodEnd?: Date | string | null;
}

export function hasLocalCreemAccess(
  subscription: Pick<LocalCreemSubscriptionRecord, "status" | "currentPeriodEnd">,
  now = new Date()
) {
  const status = subscription.status.trim().toLowerCase();

  if (ACTIVE_STATUSES.has(status)) {
    return true;
  }

  if (ACTIVE_UNTIL_PERIOD_END_STATUSES.has(status) && subscription.currentPeriodEnd) {
    return subscription.currentPeriodEnd.getTime() > now.getTime();
  }

  return false;
}

export function selectBestLocalCreemSubscription(
  subscriptions: LocalCreemSubscriptionRecord[],
  now = new Date()
) {
  if (subscriptions.length === 0) {
    return null;
  }

  const sorted = [...subscriptions].sort((left, right) => {
    const leftHasAccess = hasLocalCreemAccess(left, now) ? 1 : 0;
    const rightHasAccess = hasLocalCreemAccess(right, now) ? 1 : 0;

    if (leftHasAccess !== rightHasAccess) {
      return rightHasAccess - leftHasAccess;
    }

    const leftPeriodEnd = left.currentPeriodEnd?.getTime() ?? 0;
    const rightPeriodEnd = right.currentPeriodEnd?.getTime() ?? 0;

    if (leftPeriodEnd !== rightPeriodEnd) {
      return rightPeriodEnd - leftPeriodEnd;
    }

    return right.updatedAt.getTime() - left.updatedAt.getTime();
  });

  const best = sorted[0];

  return {
    ...best,
    hasAccess: hasLocalCreemAccess(best, now),
  };
}

export async function getUserSubscriptionSnapshot({
  userId,
  email,
}: UserSubscriptionLookup): Promise<SubscriptionSnapshot> {
  const localSubscriptions = await db
    .select({
      productId: creemSubscriptions.productId,
      subscriptionId: creemSubscriptions.subscriptionId,
      status: creemSubscriptions.status,
      currentPeriodEnd: creemSubscriptions.currentPeriodEnd,
      updatedAt: creemSubscriptions.updatedAt,
    })
    .from(creemSubscriptions)
    .where(eq(creemSubscriptions.userId, userId))
    .orderBy(
      desc(creemSubscriptions.currentPeriodEnd),
      desc(creemSubscriptions.updatedAt)
    );

  const localMatch = selectBestLocalCreemSubscription(localSubscriptions);
  if (localMatch?.hasAccess) {
    return {
      hasAccess: localMatch.hasAccess,
      status: localMatch.status,
      productId: localMatch.productId,
      periodEnd: localMatch.currentPeriodEnd,
      source: "database",
      canManage: true,
    };
  }

  if (!email) {
    return emptySnapshot();
  }

  const remoteMatch = await getRemoteSubscriptionSnapshotByEmail(email);
  if (!remoteMatch) {
    if (localMatch) {
      return {
        hasAccess: localMatch.hasAccess,
        status: localMatch.status,
        productId: localMatch.productId,
        periodEnd: localMatch.currentPeriodEnd,
        source: "database",
        canManage: true,
      };
    }

    return emptySnapshot();
  }

  await syncCreemSubscription({
    userId,
    productId: remoteMatch.productId,
    subscriptionId: remoteMatch.subscriptionId,
    status: remoteMatch.status,
    currentPeriodEnd: remoteMatch.periodEnd,
  });

  return {
    hasAccess: remoteMatch.hasAccess,
    status: remoteMatch.status,
    productId: remoteMatch.productId,
    periodEnd: remoteMatch.periodEnd,
    source: "creem_api",
    canManage: true,
  };
}

export async function createUserCreemPortalUrl(email: string) {
  const customer = await findCreemCustomerByEmail(email);
  if (!customer) {
    return null;
  }

  const response = await creemFetch<{ customer_portal_link?: string }>(
    `/v1/customers/billing`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customer.id,
      }),
    }
  );

  return response.customer_portal_link ?? null;
}

export async function syncCreemSubscription(input: SyncCreemSubscriptionInput) {
  const userId = cleanValue(input.userId);
  const productId = cleanValue(input.productId);
  const subscriptionId = cleanValue(input.subscriptionId);
  const status = cleanValue(input.status);

  if (!userId || !productId || !subscriptionId || !status) {
    return;
  }

  const periodEnd = toDateOrNull(input.currentPeriodEnd);

  const [existing] = await db
    .select({ id: creemSubscriptions.id })
    .from(creemSubscriptions)
    .where(eq(creemSubscriptions.subscriptionId, subscriptionId))
    .limit(1);

  if (existing) {
    await db
      .update(creemSubscriptions)
      .set({
        userId,
        productId,
        status,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      })
      .where(eq(creemSubscriptions.id, existing.id));
    return;
  }

  await db.insert(creemSubscriptions).values({
    userId,
    productId,
    subscriptionId,
    status,
    currentPeriodEnd: periodEnd,
  });
}

async function getRemoteSubscriptionSnapshotByEmail(email: string) {
  const customer = await findCreemCustomerByEmail(email);
  if (!customer) {
    return null;
  }

  const transactions = await creemFetch<{ items: CreemTransaction[] }>(
    `/v1/transactions/search?${new URLSearchParams({
      customer_id: customer.id,
      page_number: "1",
      page_size: "100",
    }).toString()}`
  );

  const subscriptionIds = Array.from(
    new Set(
      (transactions.items ?? [])
        .filter((transaction) => transaction.subscription)
        .sort((left, right) => {
          const leftPeriodEnd = left.period_end ?? 0;
          const rightPeriodEnd = right.period_end ?? 0;

          if (leftPeriodEnd !== rightPeriodEnd) {
            return rightPeriodEnd - leftPeriodEnd;
          }

          return right.created_at - left.created_at;
        })
        .map((transaction) => transaction.subscription)
        .filter((value): value is string => !!value)
    )
  );

  if (subscriptionIds.length === 0) {
    return null;
  }

  let latestInactive: {
    subscriptionId: string;
    status: string;
    productId: string | null;
    periodEnd: Date | null;
    hasAccess: boolean;
  } | null = null;

  for (const subscriptionId of subscriptionIds) {
    const subscription = await creemFetch<CreemRetrievedSubscription>(
      `/v1/subscriptions?${new URLSearchParams({
        subscription_id: subscriptionId,
      }).toString()}`
    );

    const productId = extractProductId(subscription.product);
    const periodEnd = toDateOrNull(subscription.current_period_end_date);
    const candidate = {
      subscriptionId: subscription.id,
      status: subscription.status,
      productId,
      periodEnd: toDateOrNull(subscription.current_period_end_date),
      hasAccess: hasLocalCreemAccess(
        {
          status: subscription.status,
          currentPeriodEnd: toDateOrNull(subscription.current_period_end_date),
        },
        new Date()
      ),
    };

    if (candidate.hasAccess) {
      return candidate;
    }

    if (
      !latestInactive ||
      (candidate.periodEnd?.getTime() ?? 0) >
        (latestInactive.periodEnd?.getTime() ?? 0)
    ) {
      latestInactive = candidate;
    }
  }

  return latestInactive;
}

async function findCreemCustomerByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let pageNumber = 1;

  while (pageNumber <= 10) {
    const response = await creemFetch<{
      items: CreemCustomer[];
      pagination?: { hasMore?: boolean };
    }>(
      `/v1/customers/list?${new URLSearchParams({
        page_number: String(pageNumber),
        page_size: "100",
      }).toString()}`
    );

    const customer = (response.items ?? []).find(
      (item) => item.email.trim().toLowerCase() === normalizedEmail
    );

    if (customer) {
      return customer;
    }

    if ((response.items ?? []).length < 100) {
      return null;
    }

    pageNumber += 1;
  }

  return null;
}

async function creemFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = cleanValue(process.env.CREEM_API_KEY);
  if (!apiKey) {
    throw new Error("CREEM_API_KEY is not configured");
  }

  const isTestMode = apiKey.startsWith("creem_test_");
  const origin = isTestMode ? "https://test-api.creem.io" : "https://api.creem.io";

  const response = await fetch(`${origin}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Creem API request failed (${response.status}): ${body}`);
  }

  return (await response.json()) as T;
}

function extractProductId(product: CreemRetrievedSubscription["product"]) {
  if (!product) return null;
  return typeof product === "string" ? product : product.id;
}

function toDateOrNull(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function cleanValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function emptySnapshot(): SubscriptionSnapshot {
  return {
    hasAccess: false,
    status: null,
    productId: null,
    periodEnd: null,
    source: "none",
    canManage: false,
  };
}
