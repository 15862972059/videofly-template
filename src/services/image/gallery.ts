import { and, eq, ne, ilike, or, sql } from "drizzle-orm";
import { db, classicImages, type ClassicImage } from "@/db";
import type { ClassicImageData } from "@/types/ai-photo";

function toClassicImageData(row: ClassicImage): ClassicImageData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory,
    prompt_template: row.promptTemplate,
    hero_image_url: row.heroImageUrl,
    thumbnail_url: row.thumbnailUrl,
    is_active: row.isActive,
    created_at: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  };
}

export interface GalleryFilters {
  category?: string;
  excludeCategory?: string;
  subcategory?: string;
  query?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export async function listClassicImages(filters: GalleryFilters = {}): Promise<ClassicImageData[]> {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(classicImages.category, filters.category));
  }
  if (filters.excludeCategory) {
    conditions.push(ne(classicImages.category, filters.excludeCategory));
  }
  if (filters.subcategory) {
    conditions.push(eq(classicImages.subcategory, filters.subcategory));
  }
  if (filters.query) {
    conditions.push(
      or(
        ilike(classicImages.title, `%${filters.query}%`),
        ilike(classicImages.description ?? sql`''`, `%${filters.query}%`)
      )
    );
  }
  if (filters.isActive !== undefined) {
    conditions.push(eq(classicImages.isActive, filters.isActive));
  } else {
    conditions.push(eq(classicImages.isActive, true));
  }

  const q = db
    .select()
    .from(classicImages)
    .where(and(...conditions))
    .orderBy(classicImages.createdAt)
    .limit(filters.limit ?? 100)
    .offset(filters.offset ?? 0);

  const rows = await q;
  return rows.map(toClassicImageData);
}

export async function getClassicImageById(id: string): Promise<ClassicImageData | null> {
  const results = await db
    .select()
    .from(classicImages)
    .where(eq(classicImages.id, id))
    .limit(1);
  return results[0] ? toClassicImageData(results[0]) : null;
}

export async function getClassicImageBySlug(slug: string): Promise<ClassicImageData | null> {
  const results = await db
    .select()
    .from(classicImages)
    .where(eq(classicImages.slug, slug))
    .limit(1);
  return results[0] ? toClassicImageData(results[0]) : null;
}

export async function countClassicImages(filters: GalleryFilters = {}) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(classicImages.category, filters.category));
  }
  if (filters.excludeCategory) {
    conditions.push(ne(classicImages.category, filters.excludeCategory));
  }
  if (filters.subcategory) {
    conditions.push(eq(classicImages.subcategory, filters.subcategory));
  }
  if (filters.query) {
    conditions.push(
      or(
        ilike(classicImages.title, `%${filters.query}%`),
        ilike(classicImages.description ?? sql`''`, `%${filters.query}%`)
      )
    );
  }
  if (filters.isActive !== undefined) {
    conditions.push(eq(classicImages.isActive, filters.isActive));
  } else {
    conditions.push(eq(classicImages.isActive, true));
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(classicImages)
    .where(and(...conditions));
  return result[0]?.count ?? 0;
}

export async function getGalleryCategories() {
  const results = await db
    .selectDistinct({ category: classicImages.category })
    .from(classicImages)
    .where(eq(classicImages.isActive, true))
    .orderBy(classicImages.category);
  return results.map((r) => r.category);
}

export async function getSubcategoriesByCategory(category: string) {
  const results = await db
    .selectDistinct({ subcategory: classicImages.subcategory })
    .from(classicImages)
    .where(and(eq(classicImages.isActive, true), eq(classicImages.category, category)))
    .orderBy(classicImages.subcategory);
  return results.map((r) => r.subcategory).filter((s): s is string => s !== null);
}

export async function updateClassicImage(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    heroImageUrl: string;
    thumbnailUrl: string;
    isActive: boolean;
  }>
) {
  const mapped: Record<string, unknown> = {};
  if (updates.title !== undefined) mapped.title = updates.title;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.heroImageUrl !== undefined) mapped.heroImageUrl = updates.heroImageUrl;
  if (updates.thumbnailUrl !== undefined) mapped.thumbnailUrl = updates.thumbnailUrl;
  if (updates.isActive !== undefined) mapped.isActive = updates.isActive;
  mapped.updatedAt = new Date();

  const result = await db
    .update(classicImages)
    .set(mapped)
    .where(eq(classicImages.id, id))
    .returning({ id: classicImages.id });
  return result.length > 0;
}

export async function deleteClassicImage(id: string) {
  return updateClassicImage(id, { isActive: false });
}