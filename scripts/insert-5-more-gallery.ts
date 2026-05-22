import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(sql, { schema });

// Check if these slugs exist and update, otherwise insert
const newImages = [
  { slug: "greece-santorini", title: "Santorini", category: "Greece", subcategory: "Santorini" },
  { slug: "thailand-grand-palace", title: "Grand Palace", category: "Thailand", subcategory: "Bangkok" },
  { slug: "indonesia-borobudur", title: "Borobudur", category: "Indonesia", subcategory: "Java" },
  { slug: "vietnam-ha-long", title: "Ha Long Bay", category: "Vietnam", subcategory: "Ha Long" },
  { slug: "uk-london", title: "London", category: "UK", subcategory: "London" },
];

function generatePrompt(title: string, category: string): string {
  return `The subject standing at ${title} in ${category}, iconic landmark, dramatic landscape, empty tourist spot, bright sunny day, standing photographer perspective, hyperrealistic travel photography`;
}

async function insertOrUpdateImages() {
  let successCount = 0;
  let failCount = 0;

  for (const img of newImages) {
    const id = `img_${img.slug.replace(/-/g, "_")}`;
    const heroImageUrl = `/images/gallery-${img.slug}.png`;

    try {
      // Check if exists
      const existing = await db.select().from(schema.classicImages).where(eq(schema.classicImages.slug, img.slug)).limit(1);

      if (existing[0]) {
        // Update existing record
        await db.update(schema.classicImages)
          .set({
            heroImageUrl,
            thumbnailUrl: heroImageUrl,
            title: img.title,
            category: img.category,
            subcategory: img.subcategory,
            promptTemplate: generatePrompt(img.title, img.category),
          })
          .where(eq(schema.classicImages.slug, img.slug));
        console.log(`Updated: ${img.title} (${img.category}) - ${heroImageUrl}`);
      } else {
        // Insert new record
        await db.insert(schema.classicImages).values({
          id,
          slug: img.slug,
          title: img.title,
          description: `Famous landmark in ${img.category}`,
          category: img.category,
          subcategory: img.subcategory,
          promptTemplate: generatePrompt(img.title, img.category),
          heroImageUrl,
          thumbnailUrl: heroImageUrl,
          isActive: true,
        });
        console.log(`Inserted: ${img.title} (${img.category})`);
      }
      successCount++;
    } catch (e) {
      console.error(`Failed to process ${img.title}:`, e);
      failCount++;
    }
  }

  console.log(`\nDone! Success: ${successCount}, Failed: ${failCount}`);
  await sql.end();
  process.exit(failCount > 0 ? 1 : 0);
}

insertOrUpdateImages();