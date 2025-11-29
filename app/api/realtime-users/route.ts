import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user, oauthTokens, applications } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users who authenticated through current user's OAuth apps
    const recentUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .innerJoin(oauthTokens, eq(user.id, oauthTokens.userId))
      .innerJoin(applications, eq(oauthTokens.clientId, applications.clientId))
      .where(eq(applications.userId, session.user.id))
      .orderBy(desc(user.createdAt))
      .limit(50);

    return NextResponse.json({ users: recentUsers });
  } catch (error) {
    console.error("Failed to fetch realtime users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
