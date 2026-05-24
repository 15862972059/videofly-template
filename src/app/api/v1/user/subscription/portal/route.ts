import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { createUserCreemPortalUrl } from "@/services/creem-subscription";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const url = await createUserCreemPortalUrl(user.email);

    if (!url) {
      return apiError("No Creem customer portal found for this account", 404);
    }

    return apiSuccess({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
