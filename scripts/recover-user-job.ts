import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  const { db } = await import("../src/db");
  const { imageGenerationJobs, creditHolds, creditTransactions } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");
  const { getStorage } = await import("../src/lib/storage");
  const { creditService } = await import("../src/services/credit");

  const taskId = "task-unified-1779263360-fl0w2aff";
  const jobId = "job_NODxLvEUCMFQ";
  const userId = "NJDMQbku17zTPSIWHiaHgkY7M50NnkPf";
  const credits = 12;

  console.log(`Step 1: Fetching task ${taskId} from Evolink...`);
  const apiKey = process.env.EVOLINK_API_KEY;
  if (!apiKey) {
    throw new Error("EVOLINK_API_KEY is not set in env");
  }

  const response = await fetch(`https://api.evolink.ai/v1/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch task from Evolink: ${response.status} ${errText}`);
  }

  const taskData = await response.json();
  console.log("Evolink task payload:", JSON.stringify(taskData, null, 2));

  const imageUrl = taskData.results?.[0];
  if (!imageUrl) {
    throw new Error("Task results is empty or has no image URL");
  }
  console.log(`Found completed image URL: ${imageUrl}`);

  console.log(`Step 2: Uploading image to storage...`);
  const storage = getStorage();
  const key = `images/${userId}/result/${jobId}.png`;

  const uploaded = await storage.downloadAndUpload({
    sourceUrl: imageUrl,
    key,
    contentType: "image/png",
  });
  console.log("Uploaded successfully to storage:", uploaded);

  console.log(`Step 3: Correcting credit holds in database...`);
  // Delete existing hold for this job so we can freeze and settle cleanly
  await db.delete(creditHolds).where(eq(creditHolds.videoUuid, jobId));
  console.log("Deleted old credit hold.");

  console.log(`Step 4: Running freeze and settle for ${credits} credits...`);
  const freezeResult = await creditService.freeze({
    userId,
    credits,
    videoUuid: jobId,
  });
  console.log("Credits frozen successfully:", freezeResult);

  await creditService.settle(jobId);
  console.log("Credits settled successfully.");

  console.log(`Step 5: Updating job status to SUCCEEDED in database...`);
  const [updatedJob] = await db
    .update(imageGenerationJobs)
    .set({
      status: "SUCCEEDED",
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
      errorMessage: null,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(imageGenerationJobs.id, jobId))
    .returning();

  console.log("Updated Job details:", JSON.stringify(updatedJob, null, 2));
  console.log("SUCCESS: Image recovery completed successfully!");
}

run().catch(console.error);
