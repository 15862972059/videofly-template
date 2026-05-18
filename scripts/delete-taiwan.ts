import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const sqlDB = postgres(process.env.DATABASE_URL!, { ssl: "require" });
const db = drizzle(sqlDB, { schema });

async function main() {
  // Delete Taiwan entries
  const result = await db
    .delete(schema.classicImages)
    .where(eq(schema.classicImages.category, "Taiwan"))
    .returning({ id: schema.classicImages.id });

  console.log("Deleted Taiwan entries:", result.length);
  result.forEach((r) => console.log(" -", r.id));

  // Check if any Taiwan images remain
  const remaining = await db
    .select()
    .from(schema.classicImages)
    .where(eq(schema.classicImages.category, "Taiwan"));
  console.log("Remaining Taiwan entries:", remaining.length);

  await sqlDB.end();
  process.exit(0);
}

main();