import { generateImage } from "../src/ai/images/minimax";
import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_DIR = "public/images";

// First batch: 15 images
const images = [
  // Europe (remaining: uk-buckingham, italy-venice, portugal-porto, czech-prague, austria-hohensalzburg, poland-warsaw, russia-st-basil, finland-lapland, germany-neuschwanstein, uk-edinburgh, ireland-cliffs, belgium-bruges)
  { slug: "uk-buckingham", title: "Buckingham Palace", prompt: "Buckingham Palace in London completely empty of people, bright clear sunny British midday with crystal blue sky, the famous royal palace with its iconic facade and Victoria Memorial statue in front, a palace gates position or marked spot where visitors normally stand for photos but currently empty, the grand British royal architecture with the Royal Standard flying, warm British sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "italy-venice", title: "Rialto Bridge Venice", prompt: "Rialto Bridge in Venice completely empty of people, bright clear sunny Italian midday with crystal blue sky, the iconic white stone bridge arching over the Grand Canal with historic Venetian buildings lining the water, a stone bridge position or waterside platform where tourists normally stand for photos but currently empty, the historic merchant city architecture reflecting in the calm canal water, a gondola tied to moorings, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "portugal-porto", title: "Dom Luis I Bridge Porto", prompt: "Dom Luis I Bridge in Porto completely empty of people, bright clear sunny Portuguese midday with crystal blue sky, the famous double-deck iron bridge spanning the Douro River with port wine cellars visible on the banks, a riverbank platform or marked position where visitors normally stand for photos but currently empty, the colorful tiled buildings and historic Ribeira district in the background, the river dotted with traditional rabelo boats, warm Iberian sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "czech-prague", title: "Charles Bridge Prague", prompt: "Charles Bridge in Prague completely empty of people, bright clear sunny Czech midday with crystal blue sky, the famous historic bridge with its row of Baroque statues lining the parapets, a stone bridge position or marked spot where pedestrians normally stand for photos but currently empty, the Gothic stone bridge arching over the Vltava River with Prague Castle visible on the hill, the baroque statues and towers on either end, warm Central European sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "austria-hohensalzburg", title: "Hohensalzburg Fortress", prompt: "Hohensalzburg Fortress in Salzburg completely empty of people, bright clear sunny Austrian midday with crystal blue sky, the massive medieval castle perched on top of the hill overlooking the city, a city square or marked position where visitors normally stand for photos but currently empty, the famous fortress with its white fortress walls and towers, the baroque old town with church spires visible below, the Alps in the background, warm Alpine sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "poland-warsaw", title: "Warsaw Old Town", prompt: "Old Town Market Square in Warsaw completely empty of people, bright clear sunny Polish midday with crystal blue sky, the famous colorful reconstructed Market Square with the Mermaid Statue at its center, a cobblestone square position or marked spot where visitors normally stand for photos but currently empty, the charming pastel-colored historical townhouses, the Warsaw Barbican and city walls visible, warm European sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "russia-st-basil", title: "St Basil's Cathedral Moscow", prompt: "St. Basil's Cathedral in Moscow completely empty of people, bright clear sunny Russian midday with crystal blue sky, the famous colorful onion domes of the cathedral on Red Square, a marked position on the square or near the Lobnoye Mesto platform where visitors normally stand for photos but currently empty, the iconic cathedral with its rainbow-colored domes and spiraling towers, the Kremlin walls visible in the background, brilliant Russian sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "finland-lapland", title: "Northern Lights Lapland", prompt: "A northern lights viewing spot in Finnish Lapland completely empty of people, bright clear sunny Arctic midday with crystal blue sky, a frozen lake or snow-covered forest clearing where photographers normally stand but currently empty, traditional wooden Santa Claus village and log cabin visible in the distance, a wooden Finnish sauna building by the frozen lake, the dramatic snow-covered pine forest with perfect Arctic conditions, crisp white snow and blue sky, no clouds no aurora just brilliant winter daylight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty winter landscape no humans" },
  { slug: "germany-neuschwanstein", title: "Neuschwanstein Castle", prompt: "Neuschwanstein Castle in Bavaria completely empty of people, bright clear sunny German midday with crystal blue Alpine sky, the famous fairy tale castle perched on a hill with its white walls and blue spires, a marked viewpoint or platform where visitors normally stand for photos but currently empty, the dramatic Alpine landscape with forests and mountains surrounding the castle, the Hohenschwangau valley visible below, the iconic castle from Disney inspiration, warm Bavarian sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "uk-edinburgh", title: "Edinburgh Castle Scotland", prompt: "Edinburgh Castle in Scotland completely empty of people, bright clear sunny Scottish midday with crystal blue sky, the famous castle perched on an extinct volcano overlooking the city, a marked position or platform where visitors normally stand for photos but currently empty, the dramatic castle fortress with its stone walls and cannons, the Royal Mile stretching down the hill to Holyrood Palace, the city of Edinburgh visible below, warm Scottish sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "ireland-cliffs", title: "Cliffs of Moher", prompt: "The Cliffs of Moher in Ireland completely empty of people, bright clear sunny Irish midday with crystal blue sky, the dramatic sea cliffs rising 200 meters above the Atlantic Ocean, a marked viewpoint or stone wall position where visitors normally stand for photos but currently empty, the famous ancient stone walls and guard towers along the cliff edge, the vast ocean stretching to the horizon, the Aran Islands visible in the distance, warm Atlantic sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "belgium-bruges", title: "Belfry of Bruges", prompt: "Belfry of Bruges in Belgium completely empty of people, bright clear sunny Belgian midday with crystal blue sky, the famous medieval bell tower rising from the historic Market Square, a cobblestone square position or marked spot where visitors normally stand for photos but currently empty, the charming Gothic architecture of the bell tower with its ornate spire, the historic city of Bruges with its canals and medieval buildings visible, warm Belgian sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },

  // Turkey (3)
  { slug: "turkey-cappadocia", title: "Cappadocia Fairy Chimneys", prompt: "Cappadocia in Turkey completely empty of people, bright clear sunny Mediterranean midday with crystal blue sky, the famous fairy chimney rock formations rising from the desert valley, hot air balloons floating in the distance but no people below, a stone terrace or marked viewpoint where tourists normally stand for photos but currently empty, the surreal landscape with its iconic mushroom-shaped tuff towers, ancient cave dwellings carved into the soft volcanic rock, brilliant morning light casting dramatic shadows, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "turkey-pamukkale", title: "Pamukkale Thermal Pools", prompt: "Pamukkale thermal pools in Turkey completely empty of people, bright clear sunny Turkish midday with crystal blue sky, the stunning white travertine terraces filled with turquoise thermal water cascading down the hillside, a wooden walkway or marked pool edge where tourists normally stand for photos but currently empty, the ancient Greek ruins of Hierapolis visible above, the brilliant white calcium terraces contrasting with the blue water, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "turkey-ephesus", title: "Ephesus Ancient City", prompt: "Ephesus ancient city in Turkey completely empty of people, bright clear sunny Mediterranean midday with crystal blue sky, the famous ancient Roman city with the iconic Library of Celsus facade and marble-paved street, a stone platform or marked position where visitors normally walk for photos but currently empty, the remarkably preserved Greco-Roman architecture with columns and temples, the grand theater seating thousands, ancient streets with mosaic sidewalks, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function generateImages() {
  const results = { success: [] as string[], failed: [] as { slug: string; error: string }[] };

  for (const image of images) {
    const filename = `gallery-${image.slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`\n[${images.indexOf(image) + 1}/${images.length}] Generating: ${image.title}...`);

    try {
      const result = await generateImage({ model: "image-01", prompt: image.prompt, aspectRatio: "16:9" });

      if (result.imageUrls?.[0]) {
        await downloadImage(result.imageUrls[0], filepath);
        console.log(`  SUCCESS: ${filepath}`);
        results.success.push(image.slug);
      } else if (result.base64ImageList?.[0]) {
        fs.writeFileSync(filepath, Buffer.from(result.base64ImageList[0], "base64"));
        console.log(`  SUCCESS: ${filepath}`);
        results.success.push(image.slug);
      } else {
        throw new Error("No image returned");
      }
    } catch (error) {
      console.log(`  FAILED: ${error instanceof Error ? error.message : "Unknown"}`);
      results.failed.push({ slug: image.slug, error: error instanceof Error ? error.message : "Unknown" });
    }

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`DONE: ${results.success.length} success, ${results.failed.length} failed`);
  results.failed.forEach(f => console.log(`  - ${f.slug}: ${f.error}`));
}

generateImages().catch(console.error);