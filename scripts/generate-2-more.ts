import { generateImage } from "../src/ai/images/minimax";
import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";

const OUTPUT_DIR = "public/images";

// 2 additional images to replace failed one and reach 35 total
const images = [
  { slug: "china-forbidden", title: "Forbidden City Beijing", prompt: "The Forbidden City in Beijing China completely empty of people, bright clear sunny Chinese midday with crystal blue sky, the famous imperial palace with its iconic red walls and golden roof tiles, a stone courtyard or marked position where visitors normally stand for photos but currently empty, the grand imperial architecture with its rows of ornate buildings, the massive bronze urns and stone carvings in the outer court, warm Chinese sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "brazil-rio", title: "Christ Redeemer Rio", prompt: "Christ the Redeemer statue in Rio de Janeiro Brazil completely empty of people, bright clear sunny Brazilian midday with crystal blue sky, the famous Art Deco statue of Jesus Christ with open arms standing atop the Corcovado mountain, a marked mountain viewpoint or marked platform where visitors normally stand for photos but currently empty, the dramatic statue with its 30 meter span overlooking the city and Guanabara Bay, the iconic Rio skyline andSugarloaf Mountain visible in the distance, warm Brazilian sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function generateImages() {
  for (const image of images) {
    const filename = `gallery-${image.slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    console.log(`Generating: ${image.title}...`);

    try {
      const result = await generateImage({ model: "image-01", prompt: image.prompt, aspectRatio: "16:9" });

      if (result.imageUrls?.[0]) {
        await downloadImage(result.imageUrls[0], filepath);
        console.log(`  SUCCESS: ${filepath}`);
      } else if (result.base64ImageList?.[0]) {
        fs.writeFileSync(filepath, Buffer.from(result.base64ImageList[0], "base64"));
        console.log(`  SUCCESS: ${filepath}`);
      } else {
        console.log(`  FAILED: No image returned`);
      }
    } catch (error) {
      console.log(`  FAILED: ${error instanceof Error ? error.message : "Unknown"}`);
    }

    await new Promise(r => setTimeout(r, 1000));
  }
}

generateImages().catch(console.error);