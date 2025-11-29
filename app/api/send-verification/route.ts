import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema";
import { Resend } from "resend";
import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 });
  }

  // Rate limiting
  const recentVerification = await db.query.verification.findFirst({
    where: and(
      eq(verification.identifier, session.user.id),
      gt(verification.createdAt, new Date(Date.now() - 60000))
    )
  });

  if (recentVerification) {
    return NextResponse.json({ 
      error: "Please wait before requesting another verification email" 
    }, { status: 429 });
  }

  try {
    // Delete existing tokens
    await db.delete(verification).where(eq(verification.identifier, session.user.id));

    // Generate token
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 600000); // 10 min
    const now = new Date();

    // Insert verification token
    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: session.user.id,
      value: token,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    // Send email
    await resend.emails.send({
      from: "BlazeNeuro <noreply@blazeneuro.com>",
      to: session.user.email,
      subject: "Verify your email - BlazeNeuro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Hi ${session.user.name || 'there'},</p>
          <p>Click the link below to verify your email address:</p>
          <a href="${process.env.BETTER_AUTH_URL}/api/verify?token=${token}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This link expires in 10 minutes.<br/>
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Verification email sent",
      expiresIn: 600 
    });
  } catch (error: any) {
    console.error("Failed to send verification email:", error);
    return NextResponse.json({ 
      error: "Failed to send email" 
    }, { status: 500 });
  }
}
