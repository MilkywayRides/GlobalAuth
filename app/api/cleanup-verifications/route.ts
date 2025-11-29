import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema";
import { lt } from "drizzle-orm";

export async function POST() {
  try {
    // Delete expired verification tokens
    const result = await db
      .delete(verification)
      .where(lt(verification.expiresAt, new Date()));

    return NextResponse.json({ 
      success: true, 
      message: "Cleanup completed"
    });
  } catch (error: any) {
    console.error("Cleanup failed:", error);
    return NextResponse.json({ 
      error: "Cleanup failed" 
    }, { status: 500 });
  }
}
