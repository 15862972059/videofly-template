import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(sql, { schema });

async function main() {
  // Check Denmark entries
  const denmark = await db.select().from(schema.classicImages).where(eq(schema.classicImages.category, 'Denmark'));
  console.log('Denmark count:', denmark.length);
  denmark.forEach(d => console.log(' -', d.slug, d.title, d.id));

  // Check all unique category+subcategory combos
  const cats = await db
    .selectDistinct({
      category: schema.classicImages.category,
      subcategory: schema.classicImages.subcategory,
    })
    .from(schema.classicImages)
    .orderBy(schema.classicImages.category, schema.classicImages.subcategory);

  console.log('\nAll categories/subcategories (' + cats.length + '):');
  cats.forEach(c => console.log(`  ${c.category} / ${c.subcategory}`));

  await sql.end();
}

main();