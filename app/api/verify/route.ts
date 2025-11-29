import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verification, user as userTable } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/verify-email?error=missing_token", req.url));
    }

    // Find verification record
    const verificationRecord = await db.query.verification.findFirst({
      where: and(
        eq(verification.value, token),
        gt(verification.expiresAt, new Date())
      )
    });

    if (!verificationRecord) {
      return NextResponse.redirect(new URL("/verify-email?error=invalid_token", req.url));
    }

    // Update user's emailVerified status
    await db.update(userTable)
      .set({ 
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(userTable.id, verificationRecord.identifier));

    // Delete the used token
    await db.delete(verification)
      .where(eq(verification.id, verificationRecord.id));

    // Redirect to success page
    return NextResponse.redirect(new URL("/verify-success", req.url));
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/verify-email?error=server_error", req.url));
  }
}
