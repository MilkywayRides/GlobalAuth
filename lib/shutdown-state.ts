import { db } from "@/lib/db";
import { systemMetrics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SHUTDOWN_METRIC_NAME = "emergency_shutdown";

export async function setShutdownState(active: boolean) {
  await db.insert(systemMetrics).values({
    id: SHUTDOWN_METRIC_NAME,
    metricName: SHUTDOWN_METRIC_NAME,
    metricValue: active ? 1 : 0,
    timestamp: new Date(),
  }).onConflictDoUpdate({
    target: systemMetrics.id,
    set: {
      metricValue: active ? 1 : 0,
      timestamp: new Date(),
    }
  });
}

export async function getShutdownState(): Promise<boolean> {
  try {
    const result = await db.select()
      .from(systemMetrics)
      .where(eq(systemMetrics.id, SHUTDOWN_METRIC_NAME))
      .limit(1);
    
    return result.length > 0 ? result[0].metricValue === 1 : false;
  } catch {
    return false;
  }
}
