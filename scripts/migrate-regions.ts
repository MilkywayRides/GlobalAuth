import * as dotenv from "dotenv";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

async function migrate() {
  try {
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" text`);
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "region" text`);
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "city" text`);
    await db.execute(sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "timezone" text`);
    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

migrate();
