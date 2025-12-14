import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user, verification } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    const verificationRecord = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, email))
      .limit(1);

    if (!verificationRecord.length) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    const record = verificationRecord[0];
    
    if (record.value !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }

    await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.email, email));

    await db.delete(verification).where(eq(verification.identifier, email));

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
