import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(sql, { schema });

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

async function insertImages() {
  let successCount = 0;
  let failCount = 0;

  for (const img of newImages) {
    const id = `img_${img.slug.replace(/-/g, "_")}`;
    const heroImageUrl = `/images/gallery-${img.slug}.png`;

    try {
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
      }).onConflictDoNothing();
      console.log(`Inserted: ${img.title} (${img.category})`);
      successCount++;
    } catch (e) {
      console.error(`Failed to insert ${img.title}:`, e);
      failCount++;
    }
  }

  console.log(`\nDone! Success: ${successCount}, Failed: ${failCount}`);
  await sql.end();
  process.exit(failCount > 0 ? 1 : 0);
}

insertImages();