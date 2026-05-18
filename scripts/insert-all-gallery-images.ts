import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import * as fs from "fs";
import * as path from "path";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(sql, { schema });

// Images from /images/*.jpg (39 new location photos from ai2art repo)
const newLocationImages = [
  // Australia
  { slug: "australia-great-barrier", title: "Great Barrier Reef", category: "Australia", subcategory: "Queensland" },
  { slug: "australia-sydney-opera-house", title: "Sydney Opera House", category: "Australia", subcategory: "Sydney" },
  { slug: "australia-uluru", title: "Uluru", category: "Australia", subcategory: "Northern Territory" },
  // Austria
  { slug: "austria-hohensalzburg", title: "Hohensalzburg Castle", category: "Austria", subcategory: "Salzburg" },
  // Belgium
  { slug: "belgium-bruges", title: "Bruges", category: "Belgium", subcategory: "Bruges" },
  // Brazil
  { slug: "brazil-rio", title: "Rio de Janeiro", category: "Brazil", subcategory: "Rio de Janeiro" },
  // Czech Republic
  { slug: "czech-prague", title: "Prague", category: "Czech Republic", subcategory: "Prague" },
  // Egypt
  { slug: "egypt-karnak", title: "Karnak Temple", category: "Egypt", subcategory: "Luxor" },
  { slug: "egypt-pyramids", title: "Giza Pyramids", category: "Egypt", subcategory: "Giza" },
  // Finland
  { slug: "finland-lapland", title: "Lapland", category: "Finland", subcategory: "Lapland" },
  // Germany
  { slug: "germany-neuschwanstein", title: "Neuschwanstein Castle", category: "Germany", subcategory: "Bavaria" },
  // India
  { slug: "india-jaipur", title: "Jaipur", category: "India", subcategory: "Rajasthan" },
  { slug: "india-taj-mahal", title: "Taj Mahal", category: "India", subcategory: "Agra" },
  // Indonesia
  { slug: "indonesia-borobudur", title: "Borobudur", category: "Indonesia", subcategory: "Java" },
  // Ireland
  { slug: "ireland-cliffs", title: "Cliffs of Moher", category: "Ireland", subcategory: "Clare" },
  // Italy
  { slug: "italy-venice", title: "Venice", category: "Italy", subcategory: "Venice" },
  // Jordan
  { slug: "jordan-petra", title: "Petra", category: "Jordan", subcategory: "Petra" },
  // Mexico
  { slug: "mexico-chichen-itza", title: "Chichen Itza", category: "Mexico", subcategory: "Yucatan" },
  // Morocco
  { slug: "morocco-marrakech", title: "Marrakech", category: "Morocco", subcategory: "Marrakech" },
  // Peru
  { slug: "peru-machu-picchu", title: "Machu Picchu", category: "Peru", subcategory: "Cusco" },
  // Poland
  { slug: "poland-warsaw", title: "Warsaw", category: "Poland", subcategory: "Warsaw" },
  // Portugal
  { slug: "portugal-porto", title: "Porto", category: "Portugal", subcategory: "Porto" },
  // Russia
  { slug: "russia-st-basil", title: "St. Basil's Cathedral", category: "Russia", subcategory: "Moscow" },
  // South Africa
  { slug: "south-africa-table-mountain", title: "Table Mountain", category: "South Africa", subcategory: "Cape Town" },
  // Sri Lanka
  { slug: "sri-lanka-sigiriya", title: "Sigiriya", category: "Sri Lanka", subcategory: "Sigiriya" },
  // Tanzania
  { slug: "tanzania-serengeti", title: "Serengeti", category: "Tanzania", subcategory: "Serengeti" },
  // Thailand
  { slug: "thailand-grand-palace", title: "Grand Palace", category: "Thailand", subcategory: "Bangkok" },
  { slug: "thailand-wat-arun", title: "Wat Arun", category: "Thailand", subcategory: "Bangkok" },
  // Turkey
  { slug: "turkey-cappadocia", title: "Cappadocia", category: "Turkey", subcategory: "Cappadocia" },
  { slug: "turkey-ephesus", title: "Ephesus", category: "Turkey", subcategory: "Ephesus" },
  { slug: "turkey-pamukkale", title: "Pamukkale", category: "Turkey", subcategory: "Pamukkale" },
  // UAE
  { slug: "uae-burjkhalifa", title: "Burj Khalifa", category: "UAE", subcategory: "Dubai" },
  { slug: "uae-dubai-mall", title: "Dubai Mall", category: "UAE", subcategory: "Dubai" },
  // UK
  { slug: "uk-buckingham", title: "Buckingham Palace", category: "UK", subcategory: "London" },
  { slug: "uk-edinburgh", title: "Edinburgh", category: "UK", subcategory: "Edinburgh" },
  { slug: "uk-london", title: "London", category: "UK", subcategory: "London" },
  // USA
  { slug: "usa-hawaii-kilauea", title: "Kilauea Volcano", category: "USA", subcategory: "Hawaii" },
  { slug: "usa-niagara", title: "Niagara Falls", category: "USA", subcategory: "New York" },
  // Vietnam
  { slug: "vietnam-ha-long", title: "Ha Long Bay", category: "Vietnam", subcategory: "Ha Long" },
];

// AI-generated images from /images/generated/*.png (40 images from RESULT.md)
const generatedImages = [
  { slug: "sweden-stockholm", title: "Stockholm", category: "Sweden", subcategory: "Stockholm" },
  { slug: "denmark-nyhavn", title: "Nyhavn Copenhagen", category: "Denmark", subcategory: "Copenhagen" },
  { slug: "croatia-dubrovnik", title: "Dubrovnik", category: "Croatia", subcategory: "Dubrovnik" },
  { slug: "hungary-budapest", title: "Budapest Parliament", category: "Hungary", subcategory: "Budapest" },
  { slug: "slovenia-lake-bled", title: "Lake Bled", category: "Slovenia", subcategory: "Lake Bled" },
  { slug: "romania-bran-castle", title: "Bran Castle", category: "Romania", subcategory: "Bran" },
  { slug: "bulgaria-rila-monastery", title: "Rila Monastery", category: "Bulgaria", subcategory: "Rila" },
  { slug: "latvia-riga", title: "Riga Old Town", category: "Latvia", subcategory: "Riga" },
  { slug: "estonia-tallinn", title: "Tallinn Old Town", category: "Estonia", subcategory: "Tallinn" },
  { slug: "malta-valletta", title: "Valletta", category: "Malta", subcategory: "Valletta" },
  { slug: "serbia-belgrade", title: "Belgrade Saint Sava", category: "Serbia", subcategory: "Belgrade" },
  { slug: "bosnia-sarajevo", title: "Sarajevo Baščaršija", category: "Bosnia", subcategory: "Sarajevo" },
  { slug: "cambodia-angkor-wat", title: "Angkor Wat", category: "Cambodia", subcategory: "Siem Reap" },
  { slug: "myanmar-shwedagon", title: "Shwedagon Pagoda", category: "Myanmar", subcategory: "Yangon" },
  { slug: "malaysia-petronas", title: "Petronas Towers", category: "Malaysia", subcategory: "Kuala Lumpur" },
  { slug: "singapore-marina-bay", title: "Marina Bay Sands", category: "Singapore", subcategory: "Marina Bay" },
  { slug: "philippines-banaue", title: "Banaue Rice Terraces", category: "Philippines", subcategory: "Banaue" },
  { slug: "southkorea-gyeongbokgung", title: "Gyeongbokgung Palace", category: "South Korea", subcategory: "Seoul" },
  { slug: "taiwan-taipei-101", title: "Taipei 101", category: "Taiwan", subcategory: "Taipei" },
  { slug: "hongkong-victoria-peak", title: "Victoria Peak", category: "Hong Kong", subcategory: "Hong Kong" },
  { slug: "macau-ruins-st-paul", title: "Ruins of St. Paul's", category: "Macau", subcategory: "Macau" },
  { slug: "israel-jerusalem", title: "Dome of the Rock", category: "Israel", subcategory: "Jerusalem" },
  { slug: "saudi-riyadh", title: "Kingdom Centre Tower", category: "Saudi Arabia", subcategory: "Riyadh" },
  { slug: "qatar-doha", title: "Museum of Islamic Art", category: "Qatar", subcategory: "Doha" },
  { slug: "lebanon-bcharre", title: "Cedars of God", category: "Lebanon", subcategory: "Bcharre" },
  { slug: "oman-muscat", title: "Sultan Qaboos Grand Mosque", category: "Oman", subcategory: "Muscat" },
  { slug: "uae-dubai-frame", title: "Dubai Frame", category: "UAE", subcategory: "Dubai" },
  { slug: "bahrain-manama", title: "Bahrain World Trade Center", category: "Bahrain", subcategory: "Manama" },
  { slug: "georgia-tbilisi", title: "Narikala Fortress", category: "Georgia", subcategory: "Tbilisi" },
  { slug: "armenia-dilijan", title: "Lake Sevan", category: "Armenia", subcategory: "Sevan" },
  { slug: "azerbaijan-baku", title: "Heydar Aliyev Center", category: "Azerbaijan", subcategory: "Baku" },
  { slug: "kazakhstan-almaty", title: "Kok Tobe TV Tower", category: "Kazakhstan", subcategory: "Almaty" },
  { slug: "uzbekistan-samarkand", title: "Registan Square", category: "Uzbekistan", subcategory: "Samarkand" },
  { slug: "kyrgyzstan-issyk-kul", title: "Lake Issyk Kul", category: "Kyrgyzstan", subcategory: "Issyk Kul" },
  { slug: "tajikistan-pamir", title: "Karakul Lake", category: "Tajikistan", subcategory: "Pamir" },
  { slug: "turkmenistan-mary", title: "Merv Ruins", category: "Turkmenistan", subcategory: "Mary" },
  { slug: "kenya-masai-mara", title: "Masai Mara", category: "Kenya", subcategory: "Masai Mara" },
  { slug: "luxembourg-bertrange", title: "Luxembourg Old Town", category: "Luxembourg", subcategory: "Luxembourg" },
  { slug: "andorra-caldea", title: "Lake Engolasters", category: "Andorra", subcategory: "Engolasters" },
  { slug: "liechtenstein-vaduz", title: "Vaduz Old Town", category: "Liechtenstein", subcategory: "Vaduz" },
  { slug: "san-marino-guaita", title: "Guaita Tower", category: "San Marino", subcategory: "San Marino" },
];

function generatePrompt(title: string, category: string): string {
  return `Beautiful woman standing at ${title} in ${category}, iconic landmark, dramatic landscape, empty tourist spot, bright sunny day, standing photographer perspective, hyperrealistic travel photography`;
}

async function insertImages(images: Array<{ slug: string; title: string; category: string; subcategory: string; isGenerated?: boolean }>) {
  for (const img of images) {
    const id = `img_${img.slug.replace(/-/g, "_")}`;
    const heroImageUrl = img.isGenerated
      ? `/images/generated/gallery-${img.slug}_01.png`
      : `/images/gallery-${img.slug}.jpg`;

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
    } catch (e) {
      console.error(`Failed to insert ${img.title}:`, e);
    }
  }
}

async function main() {
  console.log("Inserting new gallery images to database...");
  console.log(`\n=== Location Photos (${newLocationImages.length} images) ===`);
  await insertImages(newLocationImages.map(img => ({ ...img, isGenerated: false })));

  console.log(`\n=== AI Generated Images (${generatedImages.length} images) ===`);
  await insertImages(generatedImages.map(img => ({ ...img, isGenerated: true })));

  console.log("\nDone!");
  await sql.end();
  process.exit(0);
}

main();