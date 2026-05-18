import type { ClassicImageData } from "@/types/ai-photo";

export const classicImages: ClassicImageData[] = [
  // France
  {
    id: "img_eiffel_tower",
    slug: "eiffel-tower",
    title: "Eiffel Tower",
    description: "The iconic romantic landmark of Paris.",
    category: "France",
    subcategory: "Paris",
    prompt_template:
      "Beautiful woman standing elegantly in front of Eiffel Tower, artistic pose, golden hour lighting, fashion photography style",
    hero_image_url: "/images/gallery-france-paris-a.jpeg",
    thumbnail_url: "/images/gallery-france-paris-a.jpeg",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "img_eiffel_tower_male",
    slug: "eiffel-tower-male",
    title: "Eiffel Tower",
    description: "The iconic romantic landmark of Paris.",
    category: "France",
    subcategory: "Paris",
    prompt_template:
      "Handsome man standing elegantly in front of Eiffel Tower, relaxed pose, golden hour lighting, travel photography style",
    hero_image_url: "/images/gallery-france-paris-b.jpeg",
    thumbnail_url: "/images/gallery-france-paris-b.jpeg",
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "img_lavender_field",
    slug: "lavender-field",
    title: "Lavender Fields",
    description: "Purple lavender fields of Provence.",
    category: "France",
    subcategory: "Provence",
    prompt_template:
      "Beautiful woman walking through purple lavender fields, golden sunlight, Provence countryside, artistic pose",
    hero_image_url: "/images/gallery-france-provence-a.jpeg",
    thumbnail_url: "/images/gallery-france-provence-a.jpeg",
    is_active: true,
    created_at: "2026-01-02T00:00:00Z",
  },
  {
    id: "img_lavender_field_male",
    slug: "lavender-field-male",
    title: "Lavender Fields",
    description: "Purple lavender fields of Provence.",
    category: "France",
    subcategory: "Provence",
    prompt_template:
      "Handsome man walking through purple lavender fields, golden sunlight, Provence countryside, travel photography style",
    hero_image_url: "/images/gallery-france-provence-b.jpeg",
    thumbnail_url: "/images/gallery-france-provence-b.jpeg",
    is_active: true,
    created_at: "2026-01-02T00:00:00Z",
  },

  // Japan
  {
    id: "img_cherry_blossom",
    slug: "cherry-blossom-spring",
    title: "Cherry Blossom",
    description: "Romantic spring scene with blooming cherry blossoms.",
    category: "Japan",
    subcategory: "Tokyo",
    prompt_template:
      "Beautiful woman standing under cherry blossom trees, spring atmosphere, pink flowers, serene Japanese garden",
    hero_image_url: "/images/gallery-japan-tokyo-a.jpeg",
    thumbnail_url: "/images/gallery-japan-tokyo-a.jpeg",
    is_active: true,
    created_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "img_cherry_blossom_male",
    slug: "cherry-blossom-spring-male",
    title: "Cherry Blossom",
    description: "Romantic spring scene with blooming cherry blossoms.",
    category: "Japan",
    subcategory: "Tokyo",
    prompt_template:
      "Handsome man standing under cherry blossom trees, spring atmosphere, pink flowers, serene Japanese garden",
    hero_image_url: "/images/gallery-japan-tokyo-b.jpeg",
    thumbnail_url: "/images/gallery-japan-tokyo-b.jpeg",
    is_active: true,
    created_at: "2026-01-03T00:00:00Z",
  },
  {
    id: "img_mt_fuji",
    slug: "mt-fuji",
    title: "Mt. Fuji",
    description: "Japan iconic sacred mountain with snow cap.",
    category: "Japan",
    subcategory: "Fuji",
    prompt_template:
      "Beautiful woman standing before Mt Fuji, cherry blossoms in foreground, perfect symmetry of nature, iconic Japanese landscape",
    hero_image_url: "/images/gallery-japan-fuji-a.jpeg",
    thumbnail_url: "/images/gallery-japan-fuji-a.jpeg",
    is_active: true,
    created_at: "2026-01-04T00:00:00Z",
  },
  {
    id: "img_mt_fuji_male",
    slug: "mt-fuji-male",
    title: "Mt. Fuji",
    description: "Japan iconic sacred mountain with snow cap.",
    category: "Japan",
    subcategory: "Fuji",
    prompt_template:
      "Handsome man standing before Mt Fuji, cherry blossoms in foreground, perfect symmetry of nature, iconic Japanese landscape",
    hero_image_url: "/images/gallery-japan-fuji-b.jpeg",
    thumbnail_url: "/images/gallery-japan-fuji-b.jpeg",
    is_active: true,
    created_at: "2026-01-04T00:00:00Z",
  },
  {
    id: "img_arashiyama",
    slug: "arashiyama-bamboo",
    title: "Arashiyama Bamboo Grove",
    description: "Towering bamboo forest in Kyoto.",
    category: "Japan",
    subcategory: "Kyoto",
    prompt_template:
      "Beautiful woman walking through Arashiyama bamboo grove, towering green bamboo stalks, dappled sunlight, serene Japanese garden atmosphere",
    hero_image_url: "/images/gallery-japan-arashiyama.jpeg",
    thumbnail_url: "/images/gallery-japan-arashiyama.jpeg",
    is_active: true,
    created_at: "2026-01-04T00:00:00Z",
  },
  {
    id: "img_fushimi_inari",
    slug: "fushimi-inari",
    title: "Fushimi Inari Shrine",
    description: "Thousands of vermillion torii gates.",
    category: "Japan",
    subcategory: "Kyoto",
    prompt_template:
      "Beautiful woman walking through Fushimi Inari thousands of torii gates, vermillion gates winding up the mountain, Shinto shrine atmosphere",
    hero_image_url: "/images/gallery-japan-fushimi-inari.jpeg",
    thumbnail_url: "/images/gallery-japan-fushimi-inari.jpeg",
    is_active: true,
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "img_kiyomizu",
    slug: "kiyomizu-dera",
    title: "Kiyomizu-dera Temple",
    description: "Famous wooden stage with Kyoto views.",
    category: "Japan",
    subcategory: "Kyoto",
    prompt_template:
      "Beautiful woman standing on Kiyomizu-dera wooden stage, overlooking Kyoto city, traditional Japanese temple architecture, cherry trees",
    hero_image_url: "/images/gallery-japan-kiyomizu.jpeg",
    thumbnail_url: "/images/gallery-japan-kiyomizu.jpeg",
    is_active: true,
    created_at: "2026-01-06T00:00:00Z",
  },

  // China
  {
    id: "img_great_wall",
    slug: "great-wall-china",
    title: "Great Wall",
    description: "China's iconic world heritage landmark.",
    category: "China",
    subcategory: "Beijing",
    prompt_template:
      "Beautiful Chinese woman in traditional dress standing on Great Wall, autumn leaves, majestic ancient fortification",
    hero_image_url: "/images/gallery-china-beijing-a.jpeg",
    thumbnail_url: "/images/gallery-china-beijing-a.jpeg",
    is_active: true,
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "img_great_wall_male",
    slug: "great-wall-china-male",
    title: "Great Wall",
    description: "China's iconic world heritage landmark.",
    category: "China",
    subcategory: "Beijing",
    prompt_template:
      "Handsome Chinese man in smart casual outfit standing on Great Wall, autumn leaves, majestic ancient fortification",
    hero_image_url: "/images/gallery-china-beijing-b.jpeg",
    thumbnail_url: "/images/gallery-china-beijing-b.jpeg",
    is_active: true,
    created_at: "2026-01-05T00:00:00Z",
  },
  {
    id: "img_yellow_mountain",
    slug: "yellow-mountain",
    title: "Yellow Mountain",
    description: "Fantastic sea of clouds and peaks.",
    category: "China",
    subcategory: "Anhui",
    prompt_template:
      "Beautiful woman standing among granite peaks of Yellow Mountain, sea of clouds below, misty Chinese landscape, ethereal atmosphere",
    hero_image_url: "/images/gallery-china-yellowmountain.jpeg",
    thumbnail_url: "/images/gallery-china-yellowmountain.jpeg",
    is_active: true,
    created_at: "2026-01-06T00:00:00Z",
  },
  {
    id: "img_forbidden_city",
    slug: "forbidden-city",
    title: "Forbidden City",
    description: "The imperial palace complex of Ming and Qing dynasties.",
    category: "China",
    subcategory: "Beijing",
    prompt_template:
      "Beautiful woman standing before the Forbidden City, iconic red walls and golden roofs, traditional Chinese palace architecture, warm sunlight",
    hero_image_url: "/images/gallery-china-forbidden-city.jpeg",
    thumbnail_url: "/images/gallery-china-forbidden-city.jpeg",
    is_active: true,
    created_at: "2026-01-06T00:00:00Z",
  },
  {
    id: "img_zhangjiajie",
    slug: "zhangjiajie",
    title: "Zhangjiajie",
    description: "Avatar-like sandstone pillar forests.",
    category: "China",
    subcategory: "Hunan",
    prompt_template:
      "Beautiful woman standing before towering sandstone pillars in Zhangjiajie, lush green forest, dramatic Avatar-like mountain landscape, epic natural wonder",
    hero_image_url: "/images/gallery-china-zhangjiajie.jpeg",
    thumbnail_url: "/images/gallery-china-zhangjiajie.jpeg",
    is_active: true,
    created_at: "2026-01-07T00:00:00Z",
  },
  {
    id: "img_jiuzhaigou",
    slug: "jiuzhaigou",
    title: "Jiuzhaigou",
    description: "Colorful terraced lakes and waterfalls.",
    category: "China",
    subcategory: "Sichuan",
    prompt_template:
      "Beautiful woman standing by colorful lakes in Jiuzhaigou, turquoise water, emerald forests, spectacular terraced lakes and waterfalls, fairy tale landscape",
    hero_image_url: "/images/gallery-china-jiuzhaigou.jpeg",
    thumbnail_url: "/images/gallery-china-jiuzhaigou.jpeg",
    is_active: true,
    created_at: "2026-01-08T00:00:00Z",
  },
  {
    id: "img_wulingyuan",
    slug: "wulingyuan",
    title: "Wulingyuan",
    description: "Dramatic natural bridge and karst pillars.",
    category: "China",
    subcategory: "Hunan",
    prompt_template:
      "Beautiful woman standing at natural bridge in Wulingyuan, dramatic karst landscape, thousands of sandstone pillars, spectacular natural formation",
    hero_image_url: "/images/gallery-china-wulingyuan.jpeg",
    thumbnail_url: "/images/gallery-china-wulingyuan.jpeg",
    is_active: true,
    created_at: "2026-01-09T00:00:00Z",
  },
  {
    id: "img_westlake",
    slug: "westlake",
    title: "West Lake",
    description: "Iconic lake with pagodas and gardens in Hangzhou.",
    category: "China",
    subcategory: "Zhejiang",
    prompt_template:
      "Beautiful woman standing by West Lake in Hangzhou, Leifeng Pagoda in distance, lotus flowers, weeping willows, traditional Chinese garden scenery",
    hero_image_url: "/images/gallery-china-westlake.jpeg",
    thumbnail_url: "/images/gallery-china-westlake.jpeg",
    is_active: true,
    created_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "img_guilin",
    slug: "guilin",
    title: "Guilin Karst",
    description: "Elephant Trunk Hill and Li River scenery.",
    category: "China",
    subcategory: "Guangxi",
    prompt_template:
      "Beautiful woman standing by Elephant Trunk Hill in Guilin, iconic karst peaks, Li River, traditional Chinese landscape, limestone formations",
    hero_image_url: "/images/gallery-china-guilin.jpeg",
    thumbnail_url: "/images/gallery-china-guilin.jpeg",
    is_active: true,
    created_at: "2026-01-11T00:00:00Z",
  },
  {
    id: "img_shanghai",
    slug: "shanghai-bund",
    title: "The Bund",
    description: "Colonial architecture along Huangpu River.",
    category: "China",
    subcategory: "Shanghai",
    prompt_template:
      "Beautiful woman standing at the Bund in Shanghai, colonial buildings, Pudong skyline across the river, historic and modern Shanghai contrast",
    hero_image_url: "/images/gallery-china-shanghai.jpeg",
    thumbnail_url: "/images/gallery-china-shanghai.jpeg",
    is_active: true,
    created_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "img_panda",
    slug: "chengdu-panda",
    title: "Chengdu Panda",
    description: "Giant Panda Base in Chengdu.",
    category: "China",
    subcategory: "Sichuan",
    prompt_template:
      "Beautiful woman standing at Chengdu Panda Base, bamboo forest habitat, giant panda sculpture, traditional Chinese garden architecture",
    hero_image_url: "/images/gallery-china-panda.jpeg",
    thumbnail_url: "/images/gallery-china-panda.jpeg",
    is_active: true,
    created_at: "2026-01-13T00:00:00Z",
  },
  {
    id: "img_longmen",
    slug: "longmen-grottoes",
    title: "Longmen Grottoes",
    description: "Ancient Buddhist cave carvings in Luoyang.",
    category: "China",
    subcategory: "Henan",
    prompt_template:
      "Beautiful woman standing before ancient Buddhist carvings at Longmen Grottoes, thousands of Buddha statues, dramatic cave entrance, ancient Chinese art",
    hero_image_url: "/images/gallery-china-longmen.jpeg",
    thumbnail_url: "/images/gallery-china-longmen.jpeg",
    is_active: true,
    created_at: "2026-01-14T00:00:00Z",
  },
  {
    id: "img_shaolin",
    slug: "shaolin-temple",
    title: "Shaolin Temple",
    description: "Birthplace of Chinese martial arts.",
    category: "China",
    subcategory: "Henan",
    prompt_template:
      "Beautiful woman standing before Shaolin Temple, red walls and golden roofs, pagoda forest, martial arts training grounds, legendary Kung Fu birthplace",
    hero_image_url: "/images/gallery-china-shaolin.jpeg",
    thumbnail_url: "/images/gallery-china-shaolin.jpeg",
    is_active: true,
    created_at: "2026-01-15T00:00:00Z",
  },

  // Netherlands
  {
    id: "img_tulip_field",
    slug: "tulip-field",
    title: "Tulip Fields",
    description: "Vibrant Dutch tulip garden in full bloom.",
    category: "Netherlands",
    subcategory: "Keukenhof",
    prompt_template:
      "Beautiful Dutch woman in yellow dress standing among colorful tulip fields, windmill in background, bright spring day",
    hero_image_url: "/images/gallery-netherlands-keukenhof-a.jpeg",
    thumbnail_url: "/images/gallery-netherlands-keukenhof-a.jpeg",
    is_active: true,
    created_at: "2026-01-07T00:00:00Z",
  },
  {
    id: "img_tulip_field_male",
    slug: "tulip-field-male",
    title: "Tulip Fields",
    description: "Vibrant Dutch tulip garden in full bloom.",
    category: "Netherlands",
    subcategory: "Keukenhof",
    prompt_template:
      "Handsome Dutch man standing among colorful tulip fields, windmill in background, bright spring day",
    hero_image_url: "/images/gallery-netherlands-keukenhof-b.jpeg",
    thumbnail_url: "/images/gallery-netherlands-keukenhof-b.jpeg",
    is_active: true,
    created_at: "2026-01-07T00:00:00Z",
  },
  {
    id: "img_giethoorn",
    slug: "giethoorn",
    title: "Giethoorn",
    description: "Venice of the North with canals.",
    category: "Netherlands",
    subcategory: "Giethoorn",
    prompt_template:
      "Beautiful woman rowing a boat through peaceful canals of Giethoorn, thatched roof cottages, lush green surroundings",
    hero_image_url: "/images/gallery-netherlands-giethoorn.jpeg",
    thumbnail_url: "/images/gallery-netherlands-giethoorn.jpeg",
    is_active: true,
    created_at: "2026-01-08T00:00:00Z",
  },

  // USA
  {
    id: "img_yellowstone",
    slug: "yellowstone",
    title: "Yellowstone",
    description: "Spectacular geysers and natural beauty.",
    category: "USA",
    subcategory: "Wyoming",
    prompt_template:
      "Beautiful woman standing beside Old Faithful geyser, dramatic steam eruption, Yellowstone wilderness, American west landscape",
    hero_image_url: "/images/gallery-usa-yellowstone.jpeg",
    thumbnail_url: "/images/gallery-usa-yellowstone.jpeg",
    is_active: true,
    created_at: "2026-01-09T00:00:00Z",
  },
  {
    id: "img_grand_canyon",
    slug: "grand-canyon",
    title: "Grand Canyon",
    description: "Magnificent red rock formations.",
    category: "USA",
    subcategory: "Arizona",
    prompt_template:
      "Beautiful woman standing at Grand Canyon edge, vast red rock canyon layers, golden sunset lighting, iconic American landmark",
    hero_image_url: "/images/gallery-usa-arizona-a.jpeg",
    thumbnail_url: "/images/gallery-usa-arizona-a.jpeg",
    is_active: true,
    created_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "img_antelope_canyon",
    slug: "antelope-canyon",
    title: "Antelope Canyon",
    description: "Light beams through narrow slot canyon.",
    category: "USA",
    subcategory: "Arizona",
    prompt_template:
      "Beautiful woman walking through Antelope Canyon, dramatic light beams through narrow sandstone walls, magical golden light",
    hero_image_url: "/images/gallery-usa-arizona-b.jpeg",
    thumbnail_url: "/images/gallery-usa-arizona-b.jpeg",
    is_active: true,
    created_at: "2026-01-11T00:00:00Z",
  },

  // Norway
  {
    id: "img_norwegian_fjord",
    slug: "norwegian-fjord",
    title: "Geiranger Fjord",
    description: "Dramatic natural landscape with waterfalls.",
    category: "Norway",
    subcategory: "Fjord",
    prompt_template:
      "Beautiful Scandinavian woman standing on fjord viewpoint, majestic cliffs, waterfalls cascading, crystal clear blue water",
    hero_image_url: "/images/gallery-norway-fjord-a.jpeg",
    thumbnail_url: "/images/gallery-norway-fjord-a.jpeg",
    is_active: true,
    created_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "img_northern_lights",
    slug: "northern-lights",
    title: "Northern Lights",
    description: "Aurora borealis dancing in Arctic sky.",
    category: "Norway",
    subcategory: "Tromso",
    prompt_template:
      "Beautiful woman standing under spectacular northern lights, green and purple aurora borealis, snow-covered landscape, Arctic magic",
    hero_image_url: "/images/gallery-norway-aurora.jpeg",
    thumbnail_url: "/images/gallery-norway-aurora.jpeg",
    is_active: true,
    created_at: "2026-01-13T00:00:00Z",
  },

  // Spain
  {
    id: "img_sagrada_familia",
    slug: "sagrada-familia",
    title: "Sagrada Familia",
    description: "Gaudi's iconic masterpiece in Barcelona.",
    category: "Spain",
    subcategory: "Barcelona",
    prompt_template:
      "Beautiful Spanish woman standing before Sagrada Familia, Gothic modernist architecture, dramatic Barcelona skyline",
    hero_image_url: "/images/gallery-spain-barcelona-a.jpeg",
    thumbnail_url: "/images/gallery-spain-barcelona-a.jpeg",
    is_active: true,
    created_at: "2026-01-14T00:00:00Z",
  },
  {
    id: "img_sagrada_familia_male",
    slug: "sagrada-familia-male",
    title: "Sagrada Familia",
    description: "Gaudi's iconic masterpiece in Barcelona.",
    category: "Spain",
    subcategory: "Barcelona",
    prompt_template:
      "Handsome Spanish man standing before Sagrada Familia, Gothic modernist architecture, dramatic Barcelona skyline",
    hero_image_url: "/images/gallery-spain-barcelona-b.jpeg",
    thumbnail_url: "/images/gallery-spain-barcelona-b.jpeg",
    is_active: true,
    created_at: "2026-01-14T00:00:00Z",
  },
  {
    id: "img_seville_plaza",
    slug: "seville-plaza",
    title: "Plaza de Espana",
    description: "Stunning Moorish architecture in Seville.",
    category: "Spain",
    subcategory: "Seville",
    prompt_template:
      "Beautiful woman standing in Plaza de Espana, ornate Moorish tiles, ceramic bridge, Seville orange trees, Spanish elegance",
    hero_image_url: "/images/gallery-spain-seville.jpeg",
    thumbnail_url: "/images/gallery-spain-seville.jpeg",
    is_active: true,
    created_at: "2026-01-15T00:00:00Z",
  },

  // Italy
  {
    id: "img_colosseum",
    slug: "colosseum",
    title: "Colosseum",
    description: "Ancient Roman amphitheater in Rome.",
    category: "Italy",
    subcategory: "Rome",
    prompt_template:
      "Beautiful woman standing before the Colosseum, ancient Roman architecture, golden afternoon light, eternal city atmosphere",
    hero_image_url: "/images/gallery-italy-rome-a.jpeg",
    thumbnail_url: "/images/gallery-italy-rome-a.jpeg",
    is_active: true,
    created_at: "2026-01-16T00:00:00Z",
  },
  {
    id: "img_colosseum_male",
    slug: "colosseum-male",
    title: "Colosseum",
    description: "Ancient Roman amphitheater in Rome.",
    category: "Italy",
    subcategory: "Rome",
    prompt_template:
      "Handsome man standing before the Colosseum, ancient Roman architecture, golden afternoon light, eternal city atmosphere",
    hero_image_url: "/images/gallery-italy-rome-b.jpeg",
    thumbnail_url: "/images/gallery-italy-rome-b.jpeg",
    is_active: true,
    created_at: "2026-01-16T00:00:00Z",
  },

  // Greece
  {
    id: "img_santorini",
    slug: "santorini",
    title: "Santorini",
    description: "White domed churches and blue domes.",
    category: "Greece",
    subcategory: "Santorini",
    prompt_template:
      "Beautiful woman standing on Santorini cliff, iconic white buildings with blue domes, caldera views, Aegean sea, Greek paradise",
    hero_image_url: "/images/gallery-greece-santorini-a.jpeg",
    thumbnail_url: "/images/gallery-greece-santorini-a.jpeg",
    is_active: true,
    created_at: "2026-01-18T00:00:00Z",
  },
  {
    id: "img_santorini_male",
    slug: "santorini-male",
    title: "Santorini",
    description: "White domed churches and blue domes.",
    category: "Greece",
    subcategory: "Santorini",
    prompt_template:
      "Handsome man standing on Santorini cliff, iconic white buildings with blue domes, caldera views, Aegean sea, Greek paradise",
    hero_image_url: "/images/gallery-greece-santorini-b.jpeg",
    thumbnail_url: "/images/gallery-greece-santorini-b.jpeg",
    is_active: true,
    created_at: "2026-01-18T00:00:00Z",
  },

  // Iceland
  {
    id: "img_ice_lagoon",
    slug: "ice-lagoon",
    title: "Jokulsarlon",
    description: "Glacier lagoon with floating icebergs.",
    category: "Iceland",
    subcategory: "Glacier",
    prompt_template:
      "Beautiful woman standing by Jokulsarlon glacier lagoon, massive blue icebergs floating, black sand beach, Iceland epic landscape",
    hero_image_url: "/images/gallery-iceland-glacier-a.jpeg",
    thumbnail_url: "/images/gallery-iceland-glacier-a.jpeg",
    is_active: true,
    created_at: "2026-01-20T00:00:00Z",
  },
  {
    id: "img_ice_lagoon_male",
    slug: "ice-lagoon-male",
    title: "Jokulsarlon",
    description: "Glacier lagoon with floating icebergs.",
    category: "Iceland",
    subcategory: "Glacier",
    prompt_template:
      "Handsome man standing by Jokulsarlon glacier lagoon, massive blue icebergs floating, black sand beach, Iceland epic landscape",
    hero_image_url: "/images/gallery-iceland-glacier-b.jpeg",
    thumbnail_url: "/images/gallery-iceland-glacier-b.jpeg",
    is_active: true,
    created_at: "2026-01-20T00:00:00Z",
  },

  // Switzerland
  {
    id: "img_matterhorn",
    slug: "matterhorn",
    title: "Matterhorn",
    description: "Iconic pyramid-shaped Alpine peak.",
    category: "Switzerland",
    subcategory: "Zermatt",
    prompt_template:
      "Beautiful woman standing before Matterhorn, iconic pyramid mountain peak, Swiss Alps, green meadow foreground, perfect alpine scene",
    hero_image_url: "/images/gallery-switzerland-zermatt-a.jpeg",
    thumbnail_url: "/images/gallery-switzerland-zermatt-a.jpeg",
    is_active: true,
    created_at: "2026-01-22T00:00:00Z",
  },
  {
    id: "img_matterhorn_male",
    slug: "matterhorn-male",
    title: "Matterhorn",
    description: "Iconic pyramid-shaped Alpine peak.",
    category: "Switzerland",
    subcategory: "Zermatt",
    prompt_template:
      "Handsome man standing before Matterhorn, iconic pyramid mountain peak, Swiss Alps, green meadow foreground, perfect alpine scene",
    hero_image_url: "/images/gallery-switzerland-zermatt-b.jpeg",
    thumbnail_url: "/images/gallery-switzerland-zermatt-b.jpeg",
    is_active: true,
    created_at: "2026-01-22T00:00:00Z",
  },

  // Greece (scenic images)
  {
    id: "img_greece_santorini_scenic",
    slug: "greece-santorini-scenic",
    title: "Santorini Scenic",
    description:
      "Santorini cliffside view with whitewashed buildings, blue domes, and the deep blue Aegean Sea.",
    category: "Greece",
    subcategory: "Santorini",
    prompt_template:
      "Santorini cliffside view with whitewashed buildings, blue domes, and the deep blue Aegean Sea, glowing sunset over the caldera, iconic Greek island scenery, world-famous sightseeing destination, photorealistic travel photography, ultra-detailed architecture and sea reflections, natural light, crisp focus, realistic atmosphere, high-definition editorial landscape photo",
    hero_image_url: "/images/greece-santorini-a_001.jpg",
    thumbnail_url: "/images/greece-santorini-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },
  {
    id: "img_greece_athens_scenic",
    slug: "greece-athens-scenic",
    title: "Athens Scenic",
    description:
      "The Parthenon atop the Acropolis at golden hour, ancient marble ruins overlooking Athens.",
    category: "Greece",
    subcategory: "Athens",
    prompt_template:
      "The Parthenon atop the Acropolis at golden hour, ancient marble ruins overlooking Athens, iconic Greek historic scenery, breathtaking sightseeing destination, photorealistic travel photography, ultra-detailed stone texture, warm natural sunlight, crisp focus, realistic atmosphere, cinematic composition, high-definition editorial landscape photo",
    hero_image_url: "/images/greece-athens-a_001.jpg",
    thumbnail_url: "/images/greece-athens-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },

  // Iceland (scenic images)
  {
    id: "img_iceland_glacier_scenic",
    slug: "iceland-glacier-scenic",
    title: "Jokulsarlon Glacier Scenic",
    description:
      "Jokulsarlon glacier lagoon with floating blue icebergs and black sand shoreline.",
    category: "Iceland",
    subcategory: "Glacier",
    prompt_template:
      "Jokulsarlon glacier lagoon with floating blue icebergs and black sand shoreline, dramatic Icelandic sky, iconic Arctic scenery, world-famous sightseeing destination, photorealistic travel photography, ultra-detailed ice and water textures, natural cold light, crisp focus, realistic atmosphere, cinematic composition, high-definition editorial landscape photo",
    hero_image_url: "/images/iceland-glacier-a_001.jpg",
    thumbnail_url: "/images/iceland-glacier-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },
  {
    id: "img_iceland_waterfall_scenic",
    slug: "iceland-waterfall-scenic",
    title: "Gullfoss Waterfall Scenic",
    description:
      "Gullfoss waterfall thundering into a rugged canyon, mist catching sunlight.",
    category: "Iceland",
    subcategory: "Waterfall",
    prompt_template:
      "Gullfoss waterfall thundering into a rugged canyon, mist catching sunlight, powerful Icelandic wilderness, iconic natural landmark, breathtaking sightseeing destination, photorealistic travel photography, ultra-detailed water and rock textures, natural light, crisp focus, realistic atmosphere, high-definition editorial scenic photo",
    hero_image_url: "/images/iceland-waterfall-a_001.jpg",
    thumbnail_url: "/images/iceland-waterfall-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },

  // Switzerland (scenic images)
  {
    id: "img_switzerland_zermatt_scenic",
    slug: "switzerland-zermatt-scenic",
    title: "Matterhorn Scenic",
    description:
      "Matterhorn reflected in a crystal-clear alpine lake near Zermatt, snow-capped peak.",
    category: "Switzerland",
    subcategory: "Zermatt",
    prompt_template:
      "Matterhorn reflected in a crystal-clear alpine lake near Zermatt, snow-capped peak, green meadow foreground, iconic Swiss mountain scenery, world-famous sightseeing destination, photorealistic travel photography, ultra-detailed landscape, natural morning light, crisp focus, realistic atmosphere, cinematic composition, high-definition editorial landscape photo",
    hero_image_url: "/images/switzerland-zermatt-a_001.jpg",
    thumbnail_url: "/images/switzerland-zermatt-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },
  {
    id: "img_switzerland_jungfrau_scenic",
    slug: "switzerland-jungfrau-scenic",
    title: "Lauterbrunnen Valley Scenic",
    description:
      "Lauterbrunnen Valley in the Jungfrau region, towering cliffs, cascading waterfalls.",
    category: "Switzerland",
    subcategory: "Jungfrau",
    prompt_template:
      "Lauterbrunnen Valley in the Jungfrau region, towering cliffs, cascading waterfalls, storybook Swiss village, lush green meadows, iconic alpine scenery, famous sightseeing destination, photorealistic travel photography, ultra-detailed textures, soft natural daylight, crisp focus, realistic atmosphere, high-definition editorial landscape photo",
    hero_image_url: "/images/switzerland-jungfrau-a_001.jpg",
    thumbnail_url: "/images/switzerland-jungfrau-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },

  // New Zealand (scenic images)
  {
    id: "img_newzealand_fiordland_scenic",
    slug: "newzealand-fiordland-scenic",
    title: "Milford Sound Scenic",
    description:
      "Milford Sound in Fiordland, towering dark cliffs, dramatic waterfalls, mirror-like water.",
    category: "New Zealand",
    subcategory: "Fiordland",
    prompt_template:
      "Milford Sound in Fiordland, towering dark cliffs, dramatic waterfalls, mirror-like water, low clouds drifting through the fjord, iconic New Zealand wilderness, world-famous sightseeing destination, photorealistic travel photography, ultra-detailed landscape, natural overcast light, crisp focus, realistic atmosphere, cinematic composition, high-definition editorial landscape photo",
    hero_image_url: "/images/newzealand-fiordland-a_001.jpg",
    thumbnail_url: "/images/newzealand-fiordland-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },
  {
    id: "img_newzealand_matamata_scenic",
    slug: "newzealand-matamata-scenic",
    title: "Hobbiton Scenic",
    description:
      "Hobbiton in Matamata with rolling green hills, charming hobbit-hole doors, stone paths.",
    category: "New Zealand",
    subcategory: "Matamata",
    prompt_template:
      "Hobbiton in Matamata with rolling green hills, charming hobbit-hole doors, stone paths, lush gardens, magical countryside scenery, iconic New Zealand sightseeing destination, photorealistic travel photography, ultra-detailed grass and cottage textures, warm natural daylight, crisp focus, realistic atmosphere, high-definition editorial scenic photo",
    hero_image_url: "/images/newzealand-matamata-a_001.jpg",
    thumbnail_url: "/images/newzealand-matamata-a_001.jpg",
    is_active: true,
    created_at: "2026-05-04T00:00:00Z",
  },
];

export const countries: string[] = [
  "China",
  "Japan",
  "France",
  "Netherlands",
  "USA",
  "Norway",
  "Spain",
  "Italy",
  "Greece",
  "Iceland",
  "Switzerland",
  "New Zealand",
];
export const categories: string[] = countries;

export const countrySubcategories: Record<string, string[]> = {
  France: ["Paris", "Provence"],
  Japan: ["Tokyo", "Fuji", "Kyoto"],
  China: ["Beijing", "Anhui", "Hunan", "Sichuan", "Zhejiang", "Guangxi", "Shanghai", "Henan"],
  Netherlands: ["Keukenhof", "Giethoorn"],
  USA: ["Wyoming", "Arizona", "Hawaii", "New York"],
  Norway: ["Fjord", "Tromso"],
  Spain: ["Barcelona", "Seville"],
  Italy: ["Rome", "Amalfi", "Venice"],
  Greece: ["Santorini", "Athens"],
  Iceland: ["Glacier", "Waterfall"],
  Switzerland: ["Zermatt", "Jungfrau"],
  "New Zealand": ["Fiordland", "Matamata"],
  // New countries from ai2art repo
  Australia: ["Sydney", "Queensland", "Northern Territory"],
  Austria: ["Salzburg"],
  Belgium: ["Bruges"],
  Brazil: ["Rio de Janeiro"],
  "Czech Republic": ["Prague"],
  Egypt: ["Giza", "Luxor"],
  Finland: ["Lapland"],
  Germany: ["Bavaria"],
  India: ["Agra", "Rajasthan"],
  Indonesia: ["Java"],
  Ireland: ["Clare"],
  Jordan: ["Petra"],
  Mexico: ["Yucatan"],
  Morocco: ["Marrakech"],
  Peru: ["Cusco"],
  Poland: ["Warsaw"],
  Portugal: ["Porto"],
  Russia: ["Moscow"],
  "South Africa": ["Cape Town"],
  "Sri Lanka": ["Sigiriya"],
  Tanzania: ["Serengeti"],
  Thailand: ["Bangkok"],
  Turkey: ["Cappadocia", "Ephesus", "Pamukkale"],
  UAE: ["Dubai"],
  UK: ["London", "Edinburgh"],
  Vietnam: ["Ha Long"],
  // AI Generated images
  Sweden: ["Stockholm"],
  Denmark: ["Copenhagen"],
  Croatia: ["Dubrovnik"],
  Hungary: ["Budapest"],
  Slovenia: ["Lake Bled"],
  Romania: ["Bran"],
  Bulgaria: ["Rila"],
  Latvia: ["Riga"],
  Estonia: ["Tallinn"],
  Malta: ["Valletta"],
  Serbia: ["Belgrade"],
  Bosnia: ["Sarajevo"],
  Cambodia: ["Siem Reap"],
  Myanmar: ["Yangon"],
  Malaysia: ["Kuala Lumpur"],
  Singapore: ["Marina Bay"],
  Philippines: ["Banaue"],
  "South Korea": ["Seoul"],
  "Hong Kong": ["Hong Kong"],
  Macau: ["Macau"],
  Israel: ["Jerusalem"],
  "Saudi Arabia": ["Riyadh"],
  Qatar: ["Doha"],
  Lebanon: ["Bcharre"],
  Oman: ["Muscat"],
  Bahrain: ["Manama"],
  Georgia: ["Tbilisi"],
  Armenia: ["Sevan"],
  Azerbaijan: ["Baku"],
  Kazakhstan: ["Almaty"],
  Uzbekistan: ["Samarkand"],
  Kyrgyzstan: ["Issyk Kul"],
  Tajikistan: ["Pamir"],
  Turkmenistan: ["Mary"],
  Kenya: ["Masai Mara"],
  Luxembourg: ["Luxembourg"],
  Andorra: ["Engolasters"],
  Liechtenstein: ["Vaduz"],
  "San Marino": ["San Marino"],
};

export function getImageBySlug(slug: string) {
  return classicImages.find((img) => img.slug === slug);
}

export function getImageById(id: string) {
  return classicImages.find((img) => img.id === id);
}

export function getImagesByCategory(category: string) {
  return classicImages.filter((img) => img.category === category);
}

export function getImagesBySubcategory(subcategory: string) {
  return classicImages.filter((img) => img.subcategory === subcategory);
}

export function getSubcategoriesByCountry(country: string): string[] {
  return countrySubcategories[country] || [];
}

export function getImagesByCountryAndSubcategory(
  country: string,
  subcategory: string
) {
  return classicImages.filter(
    (img) => img.category === country && img.subcategory === subcategory
  );
}
