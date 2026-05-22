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

// 30 new gallery images
const newImages = [
  // Europe (10)
  { slug: "sweden-stockholm", title: "Stockholm Old Town", category: "Sweden", subcategory: "Stockholm" },
  { slug: "denmark-nyhavn", title: "Nyhavn Copenhagen", category: "Denmark", subcategory: "Copenhagen" },
  { slug: "croatia-dubrovnik", title: "Dubrovnik", category: "Croatia", subcategory: "Dubrovnik" },
  { slug: "hungary-budapest", title: "Budapest Parliament", category: "Hungary", subcategory: "Budapest" },
  { slug: "slovenia-lake-bled", title: "Lake Bled", category: "Slovenia", subcategory: "Lake Bled" },
  { slug: "romania-bran-castle", title: "Bran Castle", category: "Romania", subcategory: "Bran" },
  { slug: "bulgaria-rila-monastery", title: "Rila Monastery", category: "Bulgaria", subcategory: "Rila" },
  { slug: "latvia-riga", title: "Riga Old Town", category: "Latvia", subcategory: "Riga" },
  { slug: "estonia-tallinn", title: "Tallinn Old Town", category: "Estonia", subcategory: "Tallinn" },
  { slug: "malta-valletta", title: "Valletta", category: "Malta", subcategory: "Valletta" },

  // Southeast Asia (8)
  { slug: "cambodia-angkor-wat", title: "Angkor Wat", category: "Cambodia", subcategory: "Siem Reap" },
  { slug: "myanmar-shwedagon", title: "Shwedagon Pagoda", category: "Myanmar", subcategory: "Yangon" },
  { slug: "malaysia-petronas", title: "Petronas Towers", category: "Malaysia", subcategory: "Kuala Lumpur" },
  { slug: "singapore-marina-bay", title: "Marina Bay Sands", category: "Singapore", subcategory: "Marina Bay" },
  { slug: "philippines-banaue", title: "Banaue Rice Terraces", category: "Philippines", subcategory: "Banaue" },
  { slug: "southkorea-gyeongbokgung", title: "Gyeongbokgung Palace", category: "South Korea", subcategory: "Seoul" },
  { slug: "taiwan-taipei-101", title: "Taipei 101", category: "Taiwan", subcategory: "Taipei" },
  { slug: "hongkong-victoria-peak", title: "Victoria Peak", category: "Hong Kong", subcategory: "Hong Kong" },

  // Middle East (7)
  { slug: "macau-ruins-st-paul", title: "Ruins of St. Paul's", category: "Macau", subcategory: "Macau" },
  { slug: "israel-jerusalem", title: "Dome of the Rock", category: "Israel", subcategory: "Jerusalem" },
  { slug: "saudi-riyadh", title: "Kingdom Centre Tower", category: "Saudi Arabia", subcategory: "Riyadh" },
  { slug: "qatar-doha", title: "Museum of Islamic Art", category: "Qatar", subcategory: "Doha" },
  { slug: "lebanon-bcharre", title: "Cedars of God", category: "Lebanon", subcategory: "Bcharre" },
  { slug: "oman-muscat", title: "Sultan Qaboos Grand Mosque", category: "Oman", subcategory: "Muscat" },
  { slug: "bahrain-manama", title: "Bahrain World Trade Center", category: "Bahrain", subcategory: "Manama" },

  // Central Asia & Caucasus (5)
  { slug: "georgia-tbilisi", title: "Narikala Fortress", category: "Georgia", subcategory: "Tbilisi" },
  { slug: "armenia-sevan", title: "Lake Sevan", category: "Armenia", subcategory: "Sevan" },
  { slug: "azerbaijan-baku", title: "Heydar Aliyev Center", category: "Azerbaijan", subcategory: "Baku" },
  { slug: "kazakhstan-almaty", title: "Kok Tobe TV Tower", category: "Kazakhstan", subcategory: "Almaty" },
  { slug: "uzbekistan-samarkand", title: "Registan Square", category: "Uzbekistan", subcategory: "Samarkand" },
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

insertImages();