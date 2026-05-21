import { ApiError } from "./error";

/**
 * Standard success response
 */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

/**
 * Standard error response
 */
export function apiError(message: string, status = 400, details?: unknown) {
  return Response.json(
    {
      success: false,
      error: { message, details },
    },
    { status }
  );
}

/**
 * Handle errors and return appropriate response
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return apiError(error.message, error.status, error.details);
  }
  if (error instanceof Error) {
    console.error(`API Error: ${error.message}`, error);
    return apiError(error.message, 500);
  }
  console.error("Unexpected error:", error);
  return apiError("Internal server error", 500);
}
