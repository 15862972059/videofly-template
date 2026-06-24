import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL or POSTGRES_URL in environment");
  process.exit(1);
}

const SOURCE_DIR = "D:\\dev\\github\\awesome-gpt-image-2";
const CASES_JSON_PATH = path.join(SOURCE_DIR, "data", "cases.json");
const SOURCE_IMAGES_DIR = path.join(SOURCE_DIR, "data", "images");
const TARGET_IMAGES_DIR = path.join(process.cwd(), "public", "images", "text2img");

async function main() {
  console.log("Starting image copy and seed process...");

  // 1. Ensure target directory exists and is clean
  if (fs.existsSync(TARGET_IMAGES_DIR)) {
    console.log(`Cleaning target directory: ${TARGET_IMAGES_DIR}`);
    const files = fs.readdirSync(TARGET_IMAGES_DIR);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(TARGET_IMAGES_DIR, file));
      } catch (err) {
        console.error(`Failed to delete file ${file}:`, err);
      }
    }
  } else {
    fs.mkdirSync(TARGET_IMAGES_DIR, { recursive: true });
    console.log(`Created target directory: ${TARGET_IMAGES_DIR}`);
  }

  // 2. Read cases.json
  if (!fs.existsSync(CASES_JSON_PATH)) {
    console.error(`Source cases.json not found at: ${CASES_JSON_PATH}`);
    process.exit(1);
  }

  const casesData = JSON.parse(fs.readFileSync(CASES_JSON_PATH, "utf-8"));
  const cases = casesData.cases || [];
  console.log(`Loaded ${cases.length} cases from cases.json`);

  const selectedCases: any[] = [];
  let copiedCount = 0;

  // 3. Find and copy 300 valid images
  for (const item of cases) {
    if (copiedCount >= 300) break;

    const caseId = item.id;
    // Check if image file exists in source (could be .jpg or .png)
    let ext = ".jpg";
    let srcImageName = `case${caseId}.jpg`;
    let srcImagePath = path.join(SOURCE_IMAGES_DIR, srcImageName);

    if (!fs.existsSync(srcImagePath)) {
      srcImageName = `case${caseId}.png`;
      srcImagePath = path.join(SOURCE_IMAGES_DIR, srcImageName);
      ext = ".png";
    }

    if (fs.existsSync(srcImagePath)) {
      const targetImageName = `case${caseId}${ext}`;
      const targetImagePath = path.join(TARGET_IMAGES_DIR, targetImageName);

      // Copy file
      fs.copyFileSync(srcImagePath, targetImagePath);

      // Collect data for database insertion
      selectedCases.push({
        id: `t2i_case_${caseId}`,
        slug: `t2i-case-${caseId}`,
        title: item.title || `Template ${caseId}`,
        description: item.imageAlt || item.title || `A template generated using Text-to-Image`,
        category: "Text-to-Image",
        subcategory: item.category || "General",
        promptTemplate: item.prompt,
        heroImageUrl: `/images/text2img/${targetImageName}`,
        thumbnailUrl: `/images/text2img/${targetImageName}`,
        isActive: true,
      });

      copiedCount++;
      console.log(`[${copiedCount}/300] Copied case ${caseId} image (${ext})`);
    }
  }

  if (selectedCases.length === 0) {
    console.error("No valid cases with images found to copy.");
    process.exit(1);
  }

  console.log(`Successfully copied ${selectedCases.length} images to ${TARGET_IMAGES_DIR}`);

  // 4. Connect to database and insert records
  console.log("Connecting to database and seeding classic_images table...");
  const sql = postgres(databaseUrl as string, { ssl: "require" });
  const db = drizzle(sql, { schema });

  // Clean up existing Text-to-Image records to avoid leftovers
  console.log("Deleting existing 'Text-to-Image' category records from database...");
  try {
    await db.delete(schema.classicImages).where(eq(schema.classicImages.category, "Text-to-Image"));
    console.log("Deleted existing records.");
  } catch (err) {
    console.error("Failed to delete existing records:", err);
  }

  let insertedCount = 0;
  for (const img of selectedCases) {
    try {
      await db.insert(schema.classicImages)
        .values(img)
        .onConflictDoUpdate({
          target: schema.classicImages.id,
          set: {
            title: img.title,
            description: img.description,
            category: img.category,
            subcategory: img.subcategory,
            promptTemplate: img.promptTemplate,
            heroImageUrl: img.heroImageUrl,
            thumbnailUrl: img.thumbnailUrl,
            updatedAt: new Date(),
          }
        });
      insertedCount++;
    } catch (e) {
      console.error(`Failed to insert/update DB record for case ${img.id}:`, e);
    }
  }

  console.log(`Database seeding completed. Successfully inserted/updated ${insertedCount} records.`);

  await sql.end();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
