import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const sqlDB = postgres(process.env.DATABASE_URL!, { ssl: "require" });
const db = drizzle(sqlDB, { schema });

async function main() {
  const all = await db.select().from(schema.classicImages);
  console.log("Total DB entries:", all.length);
  console.log("Unique slugs:", new Set(all.map((a) => a.slug)).size);
  
  const categoryCounts: Record<string, number> = {};
  const subcategoryCounts: Record<string, Record<string, number>> = {};
  
  for (const img of all) {
    const cat = img.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    
    if (img.subcategory) {
      if (!subcategoryCounts[cat]) {
        subcategoryCounts[cat] = {};
      }
      subcategoryCounts[cat][img.subcategory] = (subcategoryCounts[cat][img.subcategory] || 0) + 1;
    }
  }
  
  console.log("\nCategory Counts:", JSON.stringify(categoryCounts, null, 2));
  console.log("\nSubcategory Counts:", JSON.stringify(subcategoryCounts, null, 2));
  
  await sqlDB.end();
  process.exit(0);
}

main();