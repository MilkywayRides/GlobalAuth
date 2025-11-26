import { db } from "@/lib/db";
import { systemStatus } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;
  
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "system_status" (
        "id" text PRIMARY KEY DEFAULT 'system' NOT NULL,
        "status" text DEFAULT 'on' NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "updated_by" text
      );
    `);
    tableInitialized = true;
  } catch (error) {
    // Table might already exist
    tableInitialized = true;
  }
}

export async function setSystemStatus(status: "on" | "poweroff", userId?: string) {
  await ensureTable();
  
  await db.insert(systemStatus).values({
    id: "system",
    status,
    updatedAt: new Date(),
    updatedBy: userId,
  }).onConflictDoUpdate({
    target: systemStatus.id,
    set: {
      status,
      updatedAt: new Date(),
      updatedBy: userId,
    }
  });
}

export async function getSystemStatus(): Promise<"on" | "poweroff"> {
  await ensureTable();
  
  try {
    const result = await db.select().from(systemStatus).limit(1);
    return result.length > 0 ? (result[0].status as "on" | "poweroff") : "on";
  } catch {
    return "on";
  }
}

export async function isSystemOn(): Promise<boolean> {
  const status = await getSystemStatus();
  return status === "on";
}
