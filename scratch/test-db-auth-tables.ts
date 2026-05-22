import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const sqlDB = postgres(process.env.DATABASE_URL!, { ssl: "require" });
const db = drizzle(sqlDB, { schema });

async function main() {
  try {
    console.log("Checking 'user' table...");
    const userRes = await db.select().from(schema.users).limit(1);
    console.log("-> Success! Found users count:", userRes.length);

    console.log("Checking 'account' table...");
    const accountRes = await db.select().from(schema.accounts).limit(1);
    console.log("-> Success! Found accounts count:", accountRes.length);

    console.log("Checking 'session' table...");
    const sessionRes = await db.select().from(schema.sessions).limit(1);
    console.log("-> Success! Found sessions count:", sessionRes.length);

    console.log("Checking 'verification' table...");
    const verificationRes = await db.select().from(schema.verifications).limit(1);
    console.log("-> Success! Found verifications count:", verificationRes.length);

    console.log("\nAll Better Auth tables exist and are queryable!");
  } catch (error) {
    console.error("Schema check failed with error:", error);
  } finally {
    await sqlDB.end();
  }
}

main();
