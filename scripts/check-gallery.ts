import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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
  const images = await db.select().from(schema.classicImages);
  console.log("Total images:", images.length);

  const missingPng: string[] = [];
  const hasPng: string[] = [];

  for (const img of images) {
    if (img.heroImageUrl?.endsWith(".png")) {
      hasPng.push(img.slug);
    } else {
      missingPng.push(`${img.slug} -> ${img.heroImageUrl}`);
    }
  }

  console.log("\nHas PNG:", hasPng.length);
  console.log("Missing PNG:", missingPng.length);
  if (missingPng.length > 0) {
    console.log("\nMissing PNG images:");
    missingPng.forEach(m => console.log(" ", m));
  }

  await sql.end();
}

main();