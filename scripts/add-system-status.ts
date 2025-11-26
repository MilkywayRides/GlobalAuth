import "dotenv/config";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function addSystemStatusTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "system_status" (
        "id" text PRIMARY KEY DEFAULT 'system' NOT NULL,
        "status" text DEFAULT 'on' NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "updated_by" text
      );
    `);

    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'system_status_updated_by_user_id_fk'
        ) THEN
          ALTER TABLE "system_status" 
          ADD CONSTRAINT "system_status_updated_by_user_id_fk" 
          FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") 
          ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);

    console.log("✅ system_status table created successfully");
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

addSystemStatusTable();
