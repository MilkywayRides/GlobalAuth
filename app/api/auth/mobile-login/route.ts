import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, session, account } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Simple in-memory rate limiting (use Redis in production)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min window
    return true;
  }
  
  if (attempt.count >= 5) {
    return false;
  }
  
  attempt.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `${email}:${clientIp}`;
    
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

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

    // Check if user is banned
    if (foundUser.banned) {
      return NextResponse.json(
        { success: false, message: "Account is banned" },
        { status: 403 }
      );
    }

    // Find account with password (credential provider)
    const [userAccount] = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, foundUser.id),
          eq(account.providerId, "credential")
        )
      )
      .limit(1);

    if (!userAccount || !userAccount.password) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userAccount.password);
    
    if (!isValidPassword) {
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
        role: foundUser.role || 'user',
        emailVerified: foundUser.emailVerified || false
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
