import { listClassicImages, countClassicImages, getGalleryCategories, getClassicImageBySlug } from "@/services/image/gallery";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const image = await getClassicImageBySlug(slug);
      if (!image) {
        return apiSuccess({ images: [], categories: [], total: 0 });
      }
      const images = image.is_active ? [image] : [];
      const categories = await getGalleryCategories();
      return apiSuccess({ images, categories, total: images.length });
    }

    const category = searchParams.get("category") ?? undefined;
    const subcategory = searchParams.get("subcategory") ?? undefined;
    const query = searchParams.get("q") ?? undefined;
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined;
    const includeCategories = searchParams.get("includeCategories") !== "false";

    const [images, categories, total] = await Promise.all([
      listClassicImages({ category, subcategory, query, limit, offset }),
      includeCategories ? getGalleryCategories() : Promise.resolve(undefined),
      countClassicImages({ category, subcategory, query }),
    ]);

    return apiSuccess({ images, categories, total });
  } catch (error) {
    return handleApiError(error);
  }
}
