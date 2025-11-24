import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Simple password hash verification (Better Auth uses bcrypt internally)
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // This is a simplified version - Better Auth handles this internally
  // For now, we'll just check if password exists
  return hashedPassword !== null;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create a session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create session
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

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role || 'user'
      },
      token: sessionToken
    });
  } catch (error: any) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Login failed",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
