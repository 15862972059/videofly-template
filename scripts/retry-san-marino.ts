import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_DIR = path.join(process.cwd(), "public/images/generated");

async function generate() {
  const promptsFile = path.join(process.cwd(), "public/images/prompts_new_40.md");
  const content = fs.readFileSync(promptsFile, "utf-8");

  // Find san-marino-guaita - it may not have a proper header
  const lines = content.split("\n");

  // Look for the last **Location:** block which is san-marino-guaita without header
  let prompt = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].startsWith("**Location:**")) {
      prompt = lines[i].replace("**Location:**", "").trim();
      // Include following lines until we hit a line starting with # or nothing
      let j = i + 1;
      while (j < lines.length) {
        const line = lines[j];
        if (line.startsWith("#") || line.trim() === "") break;
        prompt += " " + line.trim();
        j++;
      }
      break;
    }
  }

  if (!prompt) {
    console.error("Could not find san-marino-guaita prompt");
    return;
  }

  console.log("Prompt:", prompt.substring(0, 120) + "...");

  const apiBase =
    process.env.MINIMAX_API_URL?.replace("https://api.minimax.chat", "https://api.minimaxi.com") ||
    "https://api.minimaxi.com/v1";

  const res = await fetch(`${apiBase}/image_generation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
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

  const data = (await res.json()) as {
    data?: { image_urls?: string[] };
    base_resp?: { status_code: number; status_msg?: string };
  };

  if (data.data?.image_urls?.[0]) {
    const url = data.data.image_urls[0];
    console.log("Image URL:", url.substring(0, 80) + "...");
    const imgRes = await fetch(url);
    if (imgRes.ok) {
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(
        path.join(OUTPUT_DIR, "gallery-san-marino-guaita_01.png"),
        buffer
      );
      console.log("Saved! Size:", (buffer.length / 1024 / 1024).toFixed(2), "MB");
    }
  } else if (data.base_resp) {
    console.error("API Error:", data.base_resp.status_code, data.base_resp.status_msg);
  } else {
    console.log("Response:", JSON.stringify(data).substring(0, 300));
  }
}

generate().catch(console.error);