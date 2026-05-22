export function buildCreemSubscriptionOrderNo(params: {
  subscriptionId?: string;
  metadataSubscriptionId?: string;
  customerId?: string;
  userId: string;
  productType: string;
}): string {
  const canonicalSubscriptionId =
    params.subscriptionId ?? params.metadataSubscriptionId ?? params.customerId;

  if (canonicalSubscriptionId) {
    return `creem_sub_${canonicalSubscriptionId}`;
  }

  return `creem_${params.productType}_${params.userId}_${Date.now()}`;
}
