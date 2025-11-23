import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getShutdownState } from "@/lib/shutdown-state";

export async function GET() {
  try {
    // Check database connection
    await db.execute("SELECT 1");
    
    // Check emergency shutdown status
    const isShutdown = getShutdownState();
    
    const health = {
      status: isShutdown ? "unhealthy" : "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      emergencyShutdown: isShutdown,
    };

    return NextResponse.json(health, { 
      status: isShutdown ? 503 : 200 
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
