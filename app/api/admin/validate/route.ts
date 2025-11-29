import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

// Generate secure hash of user session
function generateSecureHash(userId: string, role: string, timestamp: number): string {
  const secret = process.env.BETTER_AUTH_SECRET!;
  return crypto
    .createHmac("sha256", secret)
    .update(`${userId}:${role}:${timestamp}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ authorized: false, reason: "NO_SESSION" }, { status: 401 });
    }

    if (!session.user.emailVerified) {
      return NextResponse.json({ authorized: false, reason: "EMAIL_NOT_VERIFIED" }, { status: 403 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ authorized: false, reason: "NOT_ADMIN" }, { status: 403 });
    }

    const timestamp = Date.now();
    const secureToken = generateSecureHash(session.user.id, session.user.role, timestamp);

    return NextResponse.json({
      authorized: true,
      token: secureToken,
      timestamp,
      user: {
        id: session.user.id,
        role: session.user.role,
        email: session.user.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ authorized: false, reason: "SERVER_ERROR" }, { status: 500 });
  }
}
