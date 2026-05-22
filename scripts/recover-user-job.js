const postgres = require("postgres");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;
const EVOLINK_API_KEY = process.env.EVOLINK_API_KEY;

// R2 Config
const STORAGE_ENDPOINT = process.env.STORAGE_ENDPOINT?.replace(/\/$/, "");
const STORAGE_REGION = process.env.STORAGE_REGION || "auto";
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;
const STORAGE_SECRET_KEY = process.env.STORAGE_SECRET_KEY;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET;
const STORAGE_DOMAIN = process.env.STORAGE_DOMAIN?.replace(/\/$/, "");

async function main() {
  const sql = postgres(DATABASE_URL);
  
  const taskId = "task-unified-1779263360-fl0w2aff";
  const jobId = "job_NODxLvEUCMFQ";
  const userId = "NJDMQbku17zTPSIWHiaHgkY7M50NnkPf";
  const creditsToDeduct = 12;

  console.log(`Checking task: ${taskId}`);
  const response = await fetch(`https://api.evolink.ai/v1/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${EVOLINK_API_KEY}` }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch task from Evolink: ${response.status}`);
  }
  const task = await response.json();
  const imageUrl = task.results?.[0];
  if (!imageUrl) {
    throw new Error("No image URL found in task results");
  }
  console.log(`Image URL from evolink: ${imageUrl}`);

  // 2. Upload to R2
  const { s3mini } = await import("s3mini");
  const endpointWithBucket = `${STORAGE_ENDPOINT}/${STORAGE_BUCKET}`;
  const client = new s3mini({
    endpoint: endpointWithBucket,
    region: STORAGE_REGION,
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET_KEY,
  });

  const key = `images/${userId}/result/${jobId}.png`;
  console.log(`Downloading and uploading image to R2: ${key}`);
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to download image");
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const uploadResponse = await client.putObject(key, buffer, "image/png");
  if (!uploadResponse.ok) throw new Error("Failed to upload image to R2");

  const finalUrl = STORAGE_DOMAIN
    ? `${STORAGE_DOMAIN}/${key}`
    : `${endpointWithBucket}/${key}`;
  console.log(`Uploaded to R2: ${finalUrl}`);

  // 3. Delete any existing credit hold for this jobId
  await sql`DELETE FROM credit_holds WHERE video_uuid = ${jobId}`;
  console.log("Deleted old credit hold.");

  // 4. FIFO credit deduction
  // Select active packages with remaining credits
  const packages = await sql`
    SELECT id, remaining_credits, frozen_credits
    FROM credit_packages
    WHERE user_id = ${userId}
      AND status = 'ACTIVE'
      AND remaining_credits > 0
    ORDER BY
      (expired_at IS NULL) ASC,
      expired_at ASC,
      created_at ASC
  `;

  let remaining = creditsToDeduct;
  const allocation = [];
  
  for (const pkg of packages) {
    if (remaining <= 0) break;
    const toDeduct = Math.min(pkg.remaining_credits, remaining);
    allocation.push({ packageId: pkg.id, credits: toDeduct });
    
    // Update package remaining_credits
    const newRemaining = pkg.remaining_credits - toDeduct;
    const newStatus = (newRemaining === 0 && pkg.frozen_credits === 0) ? 'DEPLETED' : 'ACTIVE';
    
    await sql`
      UPDATE credit_packages
      SET remaining_credits = ${newRemaining},
          status = ${newStatus},
          updated_at = NOW()
      WHERE id = ${pkg.id}
    `;
    
    remaining -= toDeduct;
  }

  if (remaining > 0) {
    throw new Error(`User does not have enough credits to deduct ${creditsToDeduct}. Remaining unpaid: ${remaining}`);
  }

  // 5. Insert new credit hold as SETTLED
  const [newHold] = await sql`
    INSERT INTO credit_holds (user_id, video_uuid, credits, status, package_allocation, settled_at, created_at)
    VALUES (${userId}, ${jobId}, ${creditsToDeduct}, 'SETTLED', ${JSON.stringify(allocation)}, NOW(), NOW())
    RETURNING id
  `;
  console.log(`Created new settled credit hold ID: ${newHold.id}`);

  // Calculate new balance for user
  const activePackages = await sql`
    SELECT remaining_credits FROM credit_packages
    WHERE user_id = ${userId} AND status = 'ACTIVE' AND (expired_at IS NULL OR expired_at > NOW())
  `;
  const availableCredits = activePackages.reduce((sum, p) => sum + p.remaining_credits, 0);

  // 6. Insert transaction record
  const transNo = `TXN${Date.now()}RECOV`;
  await sql`
    INSERT INTO credit_transactions (trans_no, user_id, trans_type, credits, balance_after, video_uuid, hold_id, remark, created_at)
    VALUES (${transNo}, ${userId}, 'IMAGE_CONSUME', ${-creditsToDeduct}, ${availableCredits}, ${jobId}, ${newHold.id}, ${`Recovered image generation: ${jobId}`}, NOW())
  `;
  console.log(`Inserted transaction record.`);

  // 7. Update image_generation_jobs table to SUCCEEDED
  await sql`
    UPDATE image_generation_jobs
    SET status = 'SUCCEEDED',
        result_image_key = ${key},
        result_image_url = ${finalUrl},
        completed_at = NOW(),
        updated_at = NOW(),
        error_message = NULL
    WHERE id = ${jobId}
  `;
  console.log(`Updated job status to SUCCEEDED.`);

  await sql.end();
  console.log("SUCCESS!");
}

main().catch(console.error);
