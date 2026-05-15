import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(sql, { schema });

const newImages = [
  // China
  {
    id: "img_forbidden_city",
    slug: "forbidden-city",
    title: "Forbidden City",
    description: "The imperial palace complex of Ming and Qing dynasties.",
    category: "China",
    subcategory: "Beijing",
    promptTemplate: "Beautiful woman standing before the Forbidden City, iconic red walls and golden roofs, traditional Chinese palace architecture, warm sunlight",
    heroImageUrl: "/images/gallery-china-forbidden-city.jpeg",
    thumbnailUrl: "/images/gallery-china-forbidden-city.jpeg",
    isActive: true,
  },
  {
    id: "img_zhangjiajie",
    slug: "zhangjiajie",
    title: "Zhangjiajie",
    description: "Avatar-like sandstone pillar forests.",
    category: "China",
    subcategory: "Hunan",
    promptTemplate: "Beautiful woman standing before towering sandstone pillars in Zhangjiajie, lush green forest, dramatic Avatar-like mountain landscape, epic natural wonder",
    heroImageUrl: "/images/gallery-china-zhangjiajie.jpeg",
    thumbnailUrl: "/images/gallery-china-zhangjiajie.jpeg",
    isActive: true,
  },
  {
    id: "img_jiuzhaigou",
    slug: "jiuzhaigou",
    title: "Jiuzhaigou",
    description: "Colorful terraced lakes and waterfalls.",
    category: "China",
    subcategory: "Sichuan",
    promptTemplate: "Beautiful woman standing by colorful lakes in Jiuzhaigou, turquoise water, emerald forests, spectacular terraced lakes and waterfalls, fairy tale landscape",
    heroImageUrl: "/images/gallery-china-jiuzhaigou.jpeg",
    thumbnailUrl: "/images/gallery-china-jiuzhaigou.jpeg",
    isActive: true,
  },
  {
    id: "img_wulingyuan",
    slug: "wulingyuan",
    title: "Wulingyuan",
    description: "Dramatic natural bridge and karst pillars.",
    category: "China",
    subcategory: "Hunan",
    promptTemplate: "Beautiful woman standing at natural bridge in Wulingyuan, dramatic karst landscape, thousands of sandstone pillars, spectacular natural formation",
    heroImageUrl: "/images/gallery-china-wulingyuan.jpeg",
    thumbnailUrl: "/images/gallery-china-wulingyuan.jpeg",
    isActive: true,
  },
  {
    id: "img_westlake",
    slug: "westlake",
    title: "West Lake",
    description: "Iconic lake with pagodas and gardens in Hangzhou.",
    category: "China",
    subcategory: "Zhejiang",
    promptTemplate: "Beautiful woman standing by West Lake in Hangzhou, Leifeng Pagoda in distance, lotus flowers, weeping willows, traditional Chinese garden scenery",
    heroImageUrl: "/images/gallery-china-westlake.jpeg",
    thumbnailUrl: "/images/gallery-china-westlake.jpeg",
    isActive: true,
  },
  {
    id: "img_guilin",
    slug: "guilin",
    title: "Guilin Karst",
    description: "Elephant Trunk Hill and Li River scenery.",
    category: "China",
    subcategory: "Guangxi",
    promptTemplate: "Beautiful woman standing by Elephant Trunk Hill in Guilin, iconic karst peaks, Li River, traditional Chinese landscape, limestone formations",
    heroImageUrl: "/images/gallery-china-guilin.jpeg",
    thumbnailUrl: "/images/gallery-china-guilin.jpeg",
    isActive: true,
  },
  {
    id: "img_shanghai",
    slug: "shanghai-bund",
    title: "The Bund",
    description: "Colonial architecture along Huangpu River.",
    category: "China",
    subcategory: "Shanghai",
    promptTemplate: "Beautiful woman standing at the Bund in Shanghai, colonial buildings, Pudong skyline across the river, historic and modern Shanghai contrast",
    heroImageUrl: "/images/gallery-china-shanghai.jpeg",
    thumbnailUrl: "/images/gallery-china-shanghai.jpeg",
    isActive: true,
  },
  {
    id: "img_panda",
    slug: "chengdu-panda",
    title: "Chengdu Panda",
    description: "Giant Panda Base in Chengdu.",
    category: "China",
    subcategory: "Sichuan",
    promptTemplate: "Beautiful woman standing at Chengdu Panda Base, bamboo forest habitat, giant panda sculpture, traditional Chinese garden architecture",
    heroImageUrl: "/images/gallery-china-panda.jpeg",
    thumbnailUrl: "/images/gallery-china-panda.jpeg",
    isActive: true,
  },
  {
    id: "img_longmen",
    slug: "longmen-grottoes",
    title: "Longmen Grottoes",
    description: "Ancient Buddhist cave carvings in Luoyang.",
    category: "China",
    subcategory: "Henan",
    promptTemplate: "Beautiful woman standing before ancient Buddhist carvings at Longmen Grottoes, thousands of Buddha statues, dramatic cave entrance, ancient Chinese art",
    heroImageUrl: "/images/gallery-china-longmen.jpeg",
    thumbnailUrl: "/images/gallery-china-longmen.jpeg",
    isActive: true,
  },
  {
    id: "img_shaolin",
    slug: "shaolin-temple",
    title: "Shaolin Temple",
    description: "Birthplace of Chinese martial arts.",
    category: "China",
    subcategory: "Henan",
    promptTemplate: "Beautiful woman standing before Shaolin Temple, red walls and golden roofs, pagoda forest, martial arts training grounds, legendary Kung Fu birthplace",
    heroImageUrl: "/images/gallery-china-shaolin.jpeg",
    thumbnailUrl: "/images/gallery-china-shaolin.jpeg",
    isActive: true,
  },
  // Japan
  {
    id: "img_arashiyama",
    slug: "arashiyama-bamboo",
    title: "Arashiyama Bamboo Grove",
    description: "Towering bamboo forest in Kyoto.",
    category: "Japan",
    subcategory: "Kyoto",
    promptTemplate: "Beautiful woman walking through Arashiyama bamboo grove, towering green bamboo stalks, dappled sunlight, serene Japanese garden atmosphere",
    heroImageUrl: "/images/gallery-japan-arashiyama.jpeg",
    thumbnailUrl: "/images/gallery-japan-arashiyama.jpeg",
    isActive: true,
  },
  {
    id: "img_fushimi_inari",
    slug: "fushimi-inari",
    title: "Fushimi Inari Shrine",
    description: "Thousands of vermillion torii gates.",
    category: "Japan",
    subcategory: "Kyoto",
    promptTemplate: "Beautiful woman walking through Fushimi Inari thousands of torii gates, vermillion gates winding up the mountain, Shinto shrine atmosphere",
    heroImageUrl: "/images/gallery-japan-fushimi-inari.jpeg",
    thumbnailUrl: "/images/gallery-japan-fushimi-inari.jpeg",
    isActive: true,
  },
  {
    id: "img_kiyomizu",
    slug: "kiyomizu-dera",
    title: "Kiyomizu-dera Temple",
    description: "Famous wooden stage with Kyoto views.",
    category: "Japan",
    subcategory: "Kyoto",
    promptTemplate: "Beautiful woman standing on Kiyomizu-dera wooden stage, overlooking Kyoto city, traditional Japanese temple architecture, cherry trees",
    heroImageUrl: "/images/gallery-japan-kiyomizu.jpeg",
    thumbnailUrl: "/images/gallery-japan-kiyomizu.jpeg",
    isActive: true,
  },
];

async function main() {
  console.log("Inserting new gallery images to database...");
  for (const img of newImages) {
    try {
      await db.insert(schema.classicImages).values(img).onConflictDoNothing();
      console.log(`Inserted: ${img.title}`);
    } catch (e) {
      console.error(`Failed to insert ${img.title}:`, e);
    }
  }
  console.log("Done!");
  await sql.end();
  process.exit(0);
}

main();