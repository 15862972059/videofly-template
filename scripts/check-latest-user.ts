import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  const { db } = await import("../src/db");
  const { users, imageGenerationJobs } = await import("../src/db/schema");
  const { desc } = await import("drizzle-orm");

  const latestUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(5);
  console.log("Latest Users:");
  for (const u of latestUsers) {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`);
  }

  const latestJobs = await db.select().from(imageGenerationJobs).orderBy(desc(imageGenerationJobs.createdAt)).limit(5);
  console.log("\nLatest Image Jobs:");
  for (const j of latestJobs) {
    console.log(`- ID: ${j.id}, UserID: ${j.userId}, Status: ${j.status}, CreatedAt: ${j.createdAt}`);
  }
}

run().catch(console.error);
