import { requireAdmin } from "@/lib/api/auth";
import { apiSuccess, handleApiError, apiError } from "@/lib/api/response";
import {
  listClassicImages,
  countClassicImages,
  getGalleryCategories,
  updateClassicImage,
  deleteClassicImage,
} from "@/services/image/gallery";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined;

    const images = await listClassicImages({ category, isActive: undefined, limit, offset });
    const total = await countClassicImages({ category, isActive: undefined });

    return apiSuccess({ images, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return apiError("id is required", 400);
    }

    const success = await updateClassicImage(id, updates);
    if (!success) {
      return apiError("Classic image not found", 404);
    }

    return apiSuccess({ updated: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("id is required", 400);
    }

    const success = await deleteClassicImage(id);
    if (!success) {
      return apiError("Classic image not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
