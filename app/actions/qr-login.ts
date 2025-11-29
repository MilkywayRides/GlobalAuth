"use server";

import { db } from "@/lib/db";
import { qrSession, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

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

    // Use Better Auth's setSession to create a proper session
    await auth.api.setSession({
      session: {
        userId: foundUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      user: foundUser,
    });

    // Delete QR session
    await db.delete(qrSession).where(eq(qrSession.id, sessionId));

    return { success: true };
  } catch (error: any) {
    console.error('[QR Login Action] Error:', error);
    return { success: false, error: error.message };
  }
}
