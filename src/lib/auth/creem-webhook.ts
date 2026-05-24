type MaybeStableId = string | null | undefined;

function cleanId(value: MaybeStableId): string | undefined {
  const id = value?.trim();
  return id ? id : undefined;
}

export function extractCreemId(value: unknown): string | undefined {
  if (typeof value === "string") {
    return cleanId(value);
  }

  if (!value || typeof value !== "object") {
    return undefined;
  }

  const id = (value as { id?: unknown }).id;
  return typeof id === "string" ? cleanId(id) : undefined;
}

export function buildCreemOneTimeOrderNo(params: {
  orderId?: MaybeStableId;
  checkoutId?: MaybeStableId;
  transactionId?: MaybeStableId;
  webhookId?: MaybeStableId;
}): string | null {
  const orderId = cleanId(params.orderId);
  if (orderId) return `creem_order_${orderId}`;

  const checkoutId = cleanId(params.checkoutId);
  if (checkoutId) return `creem_checkout_${checkoutId}`;

  const transactionId = cleanId(params.transactionId);
  if (transactionId) return `creem_txn_${transactionId}`;

  const webhookId = cleanId(params.webhookId);
  if (webhookId) return `creem_event_${webhookId}`;

  return null;
}

export function buildCreemSubscriptionCreditOrderNo(params: {
  reason?: MaybeStableId;
  subscriptionId?: MaybeStableId;
  lastTransactionId?: MaybeStableId;
  webhookId?: MaybeStableId;
  currentPeriodStart?: MaybeStableId;
  currentPeriodEnd?: MaybeStableId;
  userId: string;
}): string | null {
  if (params.reason !== "subscription_paid") {
    return null;
  }

  const transactionId = cleanId(params.lastTransactionId);
  if (transactionId) {
    return `creem_sub_txn_${transactionId}`;
  }

  const webhookId = cleanId(params.webhookId);
  if (webhookId) {
    return `creem_sub_event_${webhookId}`;
  }

  const subscriptionId = cleanId(params.subscriptionId);
  const periodStart = cleanId(params.currentPeriodStart);
  const periodEnd = cleanId(params.currentPeriodEnd);
  if (subscriptionId && periodStart && periodEnd) {
    return `creem_sub_period_${subscriptionId}_${periodStart}_${periodEnd}`;
  }

  return null;
}
