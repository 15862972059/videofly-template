import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const sqlDB = postgres(process.env.DATABASE_URL!, { ssl: "require" });
const db = drizzle(sqlDB, { schema });

async function main() {
  const allPkgs = await db.select().from(schema.creditPackages);
  console.log("=== All Credit Packages ===");
  console.log(allPkgs);

  const allUsers = await db.select().from(schema.users);
  console.log("=== All Users ===");
  console.log(allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));

  await sqlDB.end();
  process.exit(0);
}

main();
