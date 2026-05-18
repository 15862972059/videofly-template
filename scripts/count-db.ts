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
  await sqlDB.end();
  process.exit(0);
}

main();