"use server";

import { db } from "@/lib/db";
import { qrSession, user, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function completeQRLogin(sessionId: string) {
  try {
    const [qrSessionData] = await db
      .select()
      .from(qrSession)
      .where(eq(qrSession.id, sessionId))
      .limit(1);

    if (!qrSessionData || qrSessionData.status !== 'confirmed' || !qrSessionData.userId) {
      return { success: false, error: 'Invalid session' };
    }

    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, qrSessionData.userId))
      .limit(1);

    if (!foundUser) {
      return { success: false, error: 'User not found' };
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    // Insert session
    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId: foundUser.id,
      token: sessionToken,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      ipAddress: null,
      userAgent: null,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('better-auth.session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    // Delete QR session
    await db.delete(qrSession).where(eq(qrSession.id, sessionId));

    return { success: true };
  } catch (error: any) {
    console.error('[QR Login Action] Error:', error);
    return { success: false, error: error.message };
  }
}
