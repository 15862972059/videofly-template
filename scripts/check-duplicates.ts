import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sqlDB = postgres(process.env.DATABASE_URL!, { ssl: "require" });
const db = drizzle(sqlDB, { schema });

async function main() {
  // Check for duplicate slugs
  const slugs = await db
    .select({ slug: schema.classicImages.slug, id: schema.classicImages.id })
    .from(schema.classicImages);

  const slugCount: Record<string, number> = {};
  slugs.forEach((s) => {
    slugCount[s.slug] = (slugCount[s.slug] || 0) + 1;
  });

  const dups = Object.entries(slugCount).filter(([, c]) => c > 1);
  console.log("Duplicate slugs:", JSON.stringify(dups));

  // Check Nyhavn specifically
  const nyhavn = await db
    .select()
    .from(schema.classicImages)
    .where(eq(schema.classicImages.slug, "denmark-nyhavn"));
  console.log("Nyhavn entries:", nyhavn.length, JSON.stringify(nyhavn));

  await sqlDB.end();
  process.exit(0);
}

main();