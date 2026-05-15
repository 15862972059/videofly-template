import { listClassicImages, countClassicImages, getGalleryCategories } from "@/services/image/gallery";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? undefined;
    const subcategory = searchParams.get("subcategory") ?? undefined;
    const query = searchParams.get("q") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    const images = await listClassicImages({ category, subcategory, query, limit, offset });
    const categories = await getGalleryCategories();
    const total = await countClassicImages({ category, subcategory, query });

    return apiSuccess({ images, categories, total });
  } catch (error) {
    return handleApiError(error);
  }
}
