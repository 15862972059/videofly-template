const postgres = require("postgres");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL);
  const userId = "NJDMQbku17zTPSIWHiaHgkY7M50NnkPf";

  // These two jobs were settled immediately but then failed - need to refund
  const jobsToRefund = ["job_fHsjFp4ntvVK", "job_8sz7fiO77G0W"];

  for (const jobId of jobsToRefund) {
    // Find the settled hold
    const [hold] = await sql`
      SELECT id, credits, status, package_allocation
      FROM credit_holds
      WHERE video_uuid = ${jobId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (!hold) {
      console.log(`No hold found for ${jobId}, skipping`);
      continue;
    }

    if (hold.status !== "SETTLED") {
      console.log(`Hold for ${jobId} is ${hold.status}, not SETTLED, skipping`);
      continue;
    }

    console.log(`Refunding ${hold.credits} credits for ${jobId} (hold ID: ${hold.id})`);

    // Return credits to packages
    const allocation = hold.package_allocation;
    for (const alloc of allocation) {
      await sql`
        UPDATE credit_packages
        SET remaining_credits = remaining_credits + ${alloc.credits},
            status = 'ACTIVE',
            updated_at = NOW()
        WHERE id = ${alloc.packageId}
      `;
      console.log(`  Returned ${alloc.credits} credits to package ${alloc.packageId}`);
    }

    // Mark hold as RELEASED
    await sql`
      UPDATE credit_holds
      SET status = 'RELEASED', settled_at = NOW()
      WHERE id = ${hold.id}
    `;

    // Get new balance
    const activePackages = await sql`
      SELECT remaining_credits FROM credit_packages
      WHERE user_id = ${userId} AND status = 'ACTIVE' AND (expired_at IS NULL OR expired_at > NOW())
    `;
    const newBalance = activePackages.reduce((sum, p) => sum + p.remaining_credits, 0);

    // Insert refund transaction
    const transNo = `TXN${Date.now()}REFUND${jobId.slice(-4)}`;
    await sql`
      INSERT INTO credit_transactions (trans_no, user_id, trans_type, credits, balance_after, video_uuid, hold_id, remark, created_at)
      VALUES (${transNo}, ${userId}, 'REFUND', ${hold.credits}, ${newBalance}, ${jobId}, ${hold.id}, ${`Refund for failed job: ${jobId}`}, NOW())
    `;

    console.log(`  Refund complete. New balance: ${newBalance}`);
  }

  await sql.end();
  console.log("\nDone!");
}

main().catch(console.error);
