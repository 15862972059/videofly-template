import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  const { db } = await import("../src/db");
  const { imageGenerationJobs } = await import("../src/db/schema");
  const { eq } = await import("drizzle-orm");

  const job = await db.select().from(imageGenerationJobs).where(eq(imageGenerationJobs.id, "job_NODxLvEUCMFQ")).limit(1);
  console.log("Job Details:", JSON.stringify(job[0], null, 2));
}

run().catch(console.error);
