import { and, eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { db, classicImages } from "@/db";

export interface GalleryFilters {
  category?: string;
  subcategory?: string;
  query?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export async function listClassicImages(filters: GalleryFilters = {}) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(classicImages.category, filters.category));
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

  const query = db
    .select()
    .from(classicImages)
    .where(and(...conditions))
    .orderBy(classicImages.createdAt);

  if (filters.limit !== undefined) {
    query.limit(filters.limit);
    if (filters.offset !== undefined) {
      query.offset(filters.offset);
    }
  }

  return query;
}

export async function getClassicImageById(id: string) {
  const results = await db
    .select()
    .from(classicImages)
    .where(eq(classicImages.id, id))
    .limit(1);
  return results[0] ?? null;
}

export async function getClassicImageBySlug(slug: string) {
  const results = await db
    .select()
    .from(classicImages)
    .where(eq(classicImages.slug, slug))
    .limit(1);
  return results[0] ?? null;
}

export async function countClassicImages(filters: GalleryFilters = {}) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(classicImages.category, filters.category));
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
