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

// All new images to insert or update
const newImages = [
  // From batch2.ts (33 succeeded + brazil-rio)
  { slug: "france-eiffel", title: "Eiffel Tower Paris", category: "France", subcategory: "Paris" },
  { slug: "france-lavender", title: "Lavender Field Provence", category: "France", subcategory: "Provence" },
  { slug: "japan-fuji", title: "Mt Fuji Japan", category: "Japan", subcategory: "Fuji" },
  { slug: "japan-cherry", title: "Cherry Blossom Tokyo", category: "Japan", subcategory: "Tokyo" },
  { slug: "china-great-wall", title: "Great Wall Beijing", category: "China", subcategory: "Beijing" },
  { slug: "china-yellow-mountain", title: "Yellow Mountain Anhui", category: "China", subcategory: "Anhui" },
  { slug: "china-zhangjiajie", title: "Zhangjiajie Avatar Mountains", category: "China", subcategory: "Hunan" },
  { slug: "china-guilin", title: "Guilin Karst Mountains", category: "China", subcategory: "Guangxi" },
  { slug: "china-westlake", title: "West Lake Hangzhou", category: "China", subcategory: "Zhejiang" },
  { slug: "netherlands-tulip", title: "Tulip Fields Keukenhof", category: "Netherlands", subcategory: "Keukenhof" },
  { slug: "netherlands-giethoorn", title: "Giethoorn Canal Village", category: "Netherlands", subcategory: "Giethoorn" },
  { slug: "usa-grand-canyon", title: "Grand Canyon Arizona", category: "USA", subcategory: "Arizona" },
  { slug: "usa-yellowstone", title: "Yellowstone Wyoming", category: "USA", subcategory: "Wyoming" },
  { slug: "usa-niagara", title: "Niagara Falls New York", category: "USA", subcategory: "New York" },
  { slug: "italy-colosseum", title: "Colosseum Rome", category: "Italy", subcategory: "Rome" },
  { slug: "spain-sagrada", title: "Sagrada Familia Barcelona", category: "Spain", subcategory: "Barcelona" },
  { slug: "spain-seville", title: "Plaza de España Seville", category: "Spain", subcategory: "Seville" },
  { slug: "norway-fjord", title: "Norwegian Fjord", category: "Norway", subcategory: "Fjord" },
  { slug: "norway-aurora", title: "Northern Lights Norway", category: "Norway", subcategory: "Tromso" },
  { slug: "australia-sydney", title: "Sydney Opera House", category: "Australia", subcategory: "Sydney" },
  { slug: "australia-uluru", title: "Uluru Ayers Rock", category: "Australia", subcategory: "Northern Territory" },
  { slug: "egypt-pyramids", title: "Giza Pyramids Egypt", category: "Egypt", subcategory: "Giza" },
  { slug: "egypt-karnak", title: "Karnak Temple Luxor", category: "Egypt", subcategory: "Luxor" },
  { slug: "india-taj-mahal", title: "Taj Mahal Agra", category: "India", subcategory: "Agra" },
  { slug: "india-jaipur", title: "Hawa Mahal Jaipur", category: "India", subcategory: "Rajasthan" },
  { slug: "jordan-petra", title: "Petra Jordan", category: "Jordan", subcategory: "Petra" },
  { slug: "mexico-chichen", title: "Chichen Itza Mexico", category: "Mexico", subcategory: "Yucatan" },
  { slug: "morocco-marrakech", title: "Jemaa el-Fna Marrakech", category: "Morocco", subcategory: "Marrakech" },
  { slug: "peru-machu", title: "Machu Picchu Peru", category: "Peru", subcategory: "Cusco" },
  { slug: "uae-burj", title: "Burj Khalifa Dubai", category: "UAE", subcategory: "Dubai" },
  { slug: "uae-dubai-mall", title: "Dubai Mall Aquarium", category: "UAE", subcategory: "Dubai" },
  { slug: "sri-lanka-sigiriya", title: "Sigiriya Rock Fortress", category: "Sri Lanka", subcategory: "Sigiriya" },
  { slug: "south-africa-table", title: "Table Mountain Cape Town", category: "South Africa", subcategory: "Cape Town" },
  { slug: "brazil-rio", title: "Christ Redeemer Rio", category: "Brazil", subcategory: "Rio de Janeiro" },
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