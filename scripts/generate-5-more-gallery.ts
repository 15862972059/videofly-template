import { generateImage } from "../src/ai/images/minimax";
import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_DIR = "public/images";

// 5 new images from remaining locations
const images = [
  { slug: "greece-santorini", title: "Santorini, Greece", prompt: "Santorini in Greece completely empty of people, bright clear sunny Greek midday with crystal blue Aegean Sea sky, the famous white-washed buildings with blue domes perched on the cliffside overlooking the caldera, a marked viewpoint or terrace position where tourists normally stand for photos but currently empty, the iconic Greek island architecture with its churches and windmills, the deep blue caldera visible below with cruise ships in the distance, the dramatic volcanic island landscape, brilliant Mediterranean sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "thailand-grand-palace", title: "Grand Palace Bangkok", prompt: "The Grand Palace in Bangkok Thailand completely empty of people, bright clear sunny Southeast Asian midday with deep blue tropical sky, the magnificent white and gold royal palace complex with intricate Thai architecture and sparkling spires, a stone courtyard or marked position where visitors normally stand for photos but currently empty, the Emerald Buddha temple with its iconic pointed prang spires, brilliant tropical sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "indonesia-borobudur", title: "Borobudur Temple Java", prompt: "Borobudur temple in Java Indonesia completely empty of people, bright clear sunny Indonesian midday with crystal blue tropical sky, the massive ancient Buddhist temple with its iconic stepped pyramid and numerous Buddha statues, a stone platform or marked position at the base where visitors normally stand for photos but currently empty, the dramatic volcano Mount Merapi visible in the background, the world's largest Buddhist temple with intricate carved stone reliefs, morning mist and tropical atmosphere, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "vietnam-ha-long", title: "Ha Long Bay Vietnam", prompt: "Ha Long Bay in Vietnam completely empty of people, bright clear sunny Southeast Asian midday with crystal blue sky, the famous thousands of limestone karst islands rising from the emerald green bay water, a wooden boat or floating platform where tourists normally stand for photos but currently empty, traditional junk boats floating peacefully on the calm water, the dramatic island formations with caves and beaches, brilliant tropical sunlight on the water, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
  { slug: "uk-london", title: "London Big Ben", prompt: "Big Ben and the Houses of Parliament in London completely empty of people, bright clear sunny British midday with crystal blue sky, the iconic Victorian Gothic architecture reflected in the Thames River, a riverside platform or marked position where visitors normally stand for photos but currently empty, the famous clock tower with the Great Bell, the Houses of Parliament stretching along the riverbank, warm British sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans" },
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
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
      const result = await generateImage({
        model: "image-01",
        prompt: image.prompt,
        aspectRatio: "16:9",
      });

      if (result.imageUrls && result.imageUrls.length > 0) {
        await downloadImage(result.imageUrls[0], filepath);
        console.log(`  SUCCESS: Saved to ${filepath}`);
        results.success.push(image.slug);
      } else if (result.base64ImageList && result.base64ImageList.length > 0) {
        const buffer = Buffer.from(result.base64ImageList[0], "base64");
        fs.writeFileSync(filepath, buffer);
        console.log(`  SUCCESS: Saved to ${filepath}`);
        results.success.push(image.slug);
      } else {
        throw new Error("No image URLs or base64 data returned");
      }
    } catch (error) {
      console.log(`  FAILED: ${error instanceof Error ? error.message : "Unknown error"}`);
      results.failed.push({ slug: image.slug, error: error instanceof Error ? error.message : "Unknown error" });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(50));
  console.log("GENERATION COMPLETE");
  console.log("=".repeat(50));
  console.log(`SUCCESS: ${results.success.length} images`);
  console.log(`FAILED: ${results.failed.length} images`);

  if (results.failed.length > 0) {
    console.log("\nFailed images:");
    results.failed.forEach(f => console.log(`  - ${f.slug}: ${f.error}`));
  }
}

generateImages().catch(console.error);