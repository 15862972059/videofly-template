#!/usr/bin/env tsx
/**
 * Generate gallery images using MiniMax Image Generation API.
 * Reads prompts from public/images/prompts_new_40.md
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const PROMPTS_FILE = path.join(process.cwd(), "public/images/prompts_new_40.md");
const OUTPUT_DIR = path.join(process.cwd(), "public/images/generated");

const ENTRY_IDS = [
  "gallery-sweden-stockholm",
  "gallery-denmark-nyhavn",
  "gallery-croatia-dubrovnik",
  "gallery-hungary-budapest",
  "gallery-slovenia-lake-bled",
  "gallery-romania-bran-castle",
  "gallery-bulgaria-rila-monastery",
  "gallery-latvia-riga",
  "gallery-estonia-tallinn",
  "gallery-malta-valletta",
  "gallery-serbia-belgrade",
  "gallery-bosnia-sarajevo",
  "gallery-cambodia-angkor-wat",
  "gallery-myanmar-shwedagon",
  "gallery-malaysia-petronas",
  "gallery-singapore-marina-bay",
  "gallery-philippines-banaue",
  "gallery-southkorea-gyeongbokgung",
  "gallery-taiwan-taipei-101",
  "gallery-hongkong-victoria-peak",
  "gallery-macau-ruins-st-paul",
  "gallery-israel-jerusalem",
  "gallery-saudi-riyadh",
  "gallery-qatar-doha",
  "gallery-lebanon-bcharre",
  "gallery-oman-muscat",
  "gallery-uae-dubai-frame",
  "gallery-bahrain-manama",
  "gallery-georgia-tbilisi",
  "gallery-armenia-dilijan",
  "gallery-azerbaijan-baku",
  "gallery-kazakhstan-almaty",
  "gallery-uzbekistan-samarkand",
  "gallery-kyrgyzstan-issyk-kul",
  "gallery-tajikistan-pamir",
  "gallery-turkmenistan-mary",
  "gallery-kenya-masai-mara",
  "gallery-luxembourg-bertrange",
  "gallery-andorra-caldea",
  "gallery-liechtenstein-vaduz",
  "gallery-san-marino-guaita",
];

function extractPrompts(): Record<string, string> {
  const content = fs.readFileSync(PROMPTS_FILE, "utf-8");
  const prompts: Record<string, string> = {};

  // Split on ### gallery- entries
  const parts = content.split(/\n### (gallery-\S+)/);
  let i = 1;
  while (i < parts.length) {
    const entryId = parts[i];
    let text = parts[i + 1] || "";

    // Trim at next ### entry
    const idx = text.indexOf("\n### ");
    if (idx !== -1) {
      text = text.substring(0, idx);
    }

    // Extract the location description (after "**Location:**")
    const locationMatch = text.match(/\*\*Location:\*\*\s*(.+?)(?:\n|$)/s);
    if (locationMatch) {
      prompts[entryId] = locationMatch[1].trim();
    }
    i += 2;
  }

  return prompts;
}

async function generateWithMiniMax(prompt: string): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not configured");
  }

  const apiBase =
    process.env.MINIMAX_API_URL?.trim().replace("https://api.minimax.chat", "https://api.minimaxi.com") ||
    "https://api.minimaxi.com/v1";

  const response = await fetch(`${apiBase}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "image-01",
      prompt,
      aspect_ratio: "16:9",
      response_format: "url",
      n: 1,
      prompt_optimizer: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${error}`);
  }

  const payload = (await response.json()) as {
    data?: { image_urls?: string[] };
    base_resp?: { status_code: number; status_msg?: string };
  };

  if (payload.base_resp && payload.base_resp.status_code !== 0) {
    throw new Error(
      `MiniMax API error: ${payload.base_resp.status_code} ${payload.base_resp.status_msg}`
    );
  }

  const imageUrls = payload.data?.image_urls;
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error("No image URLs returned from MiniMax API");
  }

  return imageUrls[0];
}

async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  // Load dotenv
  try {
    require("dotenv/config");
  } catch {
    // dotenv might not be available
  }

  console.log("Reading prompts from:", PROMPTS_FILE);
  const prompts = extractPrompts();
  console.log(`Extracted ${Object.keys(prompts).length} prompts\n`);

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey || apiKey === "your-minimax-api-key") {
    console.error("ERROR: MINIMAX_API_KEY is not configured in .env");
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const failures: string[] = [];
  let successes = 0;

  for (let idx = 0; idx < ENTRY_IDS.length; idx++) {
    const entryId = ENTRY_IDS[idx];
    const prompt = prompts[entryId];
    const outputFile = path.join(OUTPUT_DIR, `${entryId}_01.png`);

    console.log(`[${idx + 1}/40] ${entryId}`);

    if (!prompt) {
      console.log(`  ! No prompt found for ${entryId}`);
      failures.push(entryId);
      continue;
    }

    try {
      const imageUrl = await generateWithMiniMax(prompt);
      console.log(`  URL: ${imageUrl.substring(0, 80)}...`);

      await downloadImage(imageUrl, outputFile);
      const stat = fs.statSync(outputFile);
      console.log(`  Saved: ${outputFile} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
      successes++;
    } catch (error) {
      console.log(`  ! Error: ${error}`);
      failures.push(entryId);
    }

    // Rate limiting - wait a bit between requests
    if (idx < ENTRY_IDS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Write RESULT.md
  const resultMd = `# Image Generation Results

## Summary
- **Success:** ${successes}
- **Failed:** ${failures.length}
- **Output directory:** ${OUTPUT_DIR}

## Entry IDs
${ENTRY_IDS.map((e) => `- \`${e}\` — ${e.includes(failures.find((f) => f === e) || "___") ? "✗ failed" : "✓ success"}`).join("\n")}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "RESULT.md"), resultMd);

  console.log(`\n✓ Done. Success=${successes}, Failed=${failures.length}`);
  console.log(`  Output: ${OUTPUT_DIR}/RESULT.md`);
}

main().catch(console.error);