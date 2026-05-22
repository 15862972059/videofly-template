const postgres = require("postgres");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const sql = postgres(DATABASE_URL);
  const userId = "NJDMQbku17zTPSIWHiaHgkY7M50NnkPf";

  // 1. Check active credit packages
  const packages = await sql`
    SELECT id, initial_credits, remaining_credits, frozen_credits, trans_type, status, expired_at, created_at
    FROM credit_packages
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  console.log("=== Credit Packages ===");
  for (const p of packages) {
    console.log(`  ID: ${p.id}, Initial: ${p.initial_credits}, Remaining: ${p.remaining_credits}, Frozen: ${p.frozen_credits}, Status: ${p.status}, TransType: ${p.trans_type}, ExpiredAt: ${p.expired_at}`);
  }

  // 2. Check holds
  const holds = await sql`
    SELECT id, video_uuid, credits, status, settled_at
    FROM credit_holds
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 10
  `;
  console.log("\n=== Credit Holds (latest 10) ===");
  for (const h of holds) {
    console.log(`  ID: ${h.id}, VideoUUID: ${h.video_uuid}, Credits: ${h.credits}, Status: ${h.status}, SettledAt: ${h.settled_at}`);
  }

  // 3. Check recent transactions
  const txns = await sql`
    SELECT id, trans_no, trans_type, credits, balance_after, video_uuid, remark, created_at
    FROM credit_transactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 10
  `;
  console.log("\n=== Credit Transactions (latest 10) ===");
  for (const t of txns) {
    console.log(`  ID: ${t.id}, Type: ${t.trans_type}, Credits: ${t.credits}, BalanceAfter: ${t.balance_after}, VideoUUID: ${t.video_uuid}, Remark: ${t.remark}`);
  }

  // 4. Summary
  const activePackages = packages.filter(p => p.status === 'ACTIVE' && (!p.expired_at || new Date(p.expired_at) > new Date()));
  const totalAvailable = activePackages.reduce((sum, p) => sum + p.remaining_credits, 0);
  const totalFrozen = activePackages.reduce((sum, p) => sum + p.frozen_credits, 0);
  console.log(`\n=== Summary ===`);
  console.log(`  Active Packages: ${activePackages.length}`);
  console.log(`  Total Available: ${totalAvailable}`);
  console.log(`  Total Frozen: ${totalFrozen}`);

  await sql.end();
}

main().catch(console.error);
