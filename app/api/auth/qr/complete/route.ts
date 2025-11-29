import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, session, qrSession } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    console.log('[QR Complete] Session ID:', sessionId);
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Check if already logged in
    const cookieStore = await cookies();
    const existingToken = cookieStore.get('better-auth.session_token');
    if (existingToken) {
      console.log('[QR Complete] Already has session token, skipping');
      return NextResponse.json({ success: true, message: 'Already authenticated' });
    }

    const [qrSessionData] = await db
      .select()
      .from(qrSession)
      .where(eq(qrSession.id, sessionId))
      .limit(1);
    
    console.log('[QR Complete] QR Session:', qrSessionData);
    
    if (!qrSessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    if (qrSessionData.status !== 'confirmed') {
      return NextResponse.json({ 
        error: 'Session not confirmed', 
        status: qrSessionData.status 
      }, { status: 400 });
    }

    if (!qrSessionData.userId) {
      return NextResponse.json({ 
        error: 'No user associated with session',
        debug: 'Mobile app must send userId when confirming'
      }, { status: 400 });
    }

    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, qrSessionData.userId))
      .limit(1);

    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[QR Complete] Creating session for user:', foundUser.email);

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId: foundUser.id,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
      userAgent: req.headers.get('user-agent') || null,
    });

    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    console.log('[QR Complete] Session created successfully');

    // Delete QR session after successful login
    await db.delete(qrSession).where(eq(qrSession.id, sessionId));

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      }
    });
  } catch (error: any) {
    console.error('[QR Complete] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to complete login',
      message: error.message 
    }, { status: 500 });
  }
}
