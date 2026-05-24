import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { getUserSubscriptionSnapshot } from "@/services/creem-subscription";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const subscription = await getUserSubscriptionSnapshot({
      userId: user.id,
      email: user.email,
    });

    return apiSuccess({
      hasAccess: subscription.hasAccess,
      status: subscription.status,
      productId: subscription.productId,
      periodEnd: subscription.periodEnd,
      source: subscription.source,
      canManage: subscription.canManage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
