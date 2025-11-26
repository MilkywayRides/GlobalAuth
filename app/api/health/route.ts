import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSystemOn } from "@/lib/shutdown-state";

export async function GET() {
  try {
    // Check database connection
    await db.execute("SELECT 1");
    
    // Check emergency shutdown status
    const systemOn = await isSystemOn();
    
    const health = {
      status: systemOn ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      emergencyShutdown: !systemOn,
    };

    return NextResponse.json(health, { 
      status: systemOn ? 200 : 503 
    });
  } catch (error) {
    const health = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(health, { status: 503 });
  }
}
