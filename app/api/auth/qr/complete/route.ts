import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, session, qrSession } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const [qrSessionData] = await db
      .select()
      .from(qrSession)
      .where(eq(qrSession.id, sessionId))
      .limit(1);
    
    if (!qrSessionData || qrSessionData.status !== 'confirmed' || !qrSessionData.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, qrSessionData.userId))
      .limit(1);

    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Insert into session table
    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId: foundUser.id,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: req.headers.get('x-forwarded-for') || null,
      userAgent: req.headers.get('user-agent') || null,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.blazeneuro.com' : undefined,
    });

    // Delete QR session
    await db.delete(qrSession).where(eq(qrSession.id, sessionId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[QR Complete] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
