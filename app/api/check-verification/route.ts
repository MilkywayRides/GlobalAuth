import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check verification tokens for this user
    const tokens = await db.query.verification.findMany({
      where: eq(verification.identifier, session.user.id)
    });

    return NextResponse.json({ 
      userId: session.user.id,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      tokens: tokens.map(t => ({
        id: t.id,
        value: t.value.substring(0, 10) + "...",
        expiresAt: t.expiresAt,
        expired: new Date() > new Date(t.expiresAt)
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
