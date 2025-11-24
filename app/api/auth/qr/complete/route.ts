import { NextResponse } from "next/server";
import { qrSessions } from "@/lib/qr-sessions";
import { db } from "@/lib/db";
import { user, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const qrSession = qrSessions.get(sessionId);
    
    if (!qrSession || qrSession.status !== 'confirmed') {
      return NextResponse.json({ error: 'Invalid or unconfirmed session' }, { status: 400 });
    }

    if (!qrSession.userId) {
      return NextResponse.json({ error: 'No user associated with session' }, { status: 400 });
    }

    // Get user from database
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, qrSession.userId))
      .limit(1);

    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create session in database
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

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Clean up QR session
    qrSessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      }
    });
  } catch (error) {
    console.error('Failed to complete QR login:', error);
    return NextResponse.json({ error: 'Failed to complete login' }, { status: 500 });
  }
}
