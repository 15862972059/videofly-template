import { eq } from "drizzle-orm";
import { db, classicImages } from "../src/db";
import { classicImages as seedData } from "../src/data/classic-images";

async function seed() {
  console.log("Seeding classic images...");

  for (const image of seedData) {
    const existing = await db
      .select()
      .from(classicImages)
      .where(eq(classicImages.slug, image.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  Skip (exists): ${image.slug}`);
      continue;
    }

    await db.insert(classicImages).values({
      id: image.id,
      slug: image.slug,
      title: image.title,
      description: image.description ?? null,
      category: image.category,
      subcategory: image.subcategory ?? null,
      promptTemplate: image.prompt_template,
      heroImageUrl: image.hero_image_url,
      thumbnailUrl: image.thumbnail_url,
      isActive: true,
    });

    console.log(`  Inserted: ${image.slug}`);
  }

  const count = await db.select().from(classicImages);
  console.log(`Done. Total classic images: ${count.length}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
