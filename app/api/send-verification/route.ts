import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Resend } from "resend";
import { nanoid } from "nanoid";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate OTP token
    const token = nanoid(32);
    const otp = token.slice(0, 6).toUpperCase();
    
    // Store token in database (you'll need to implement this)
    // For now, we'll just send the email
    
    const verifyUrl = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;

    await resend.emails.send({
      from: "BlazeNeuro <noreply@blazeneuro.com>",
      to: session.user.email,
      subject: "Verify your email - BlazeNeuro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Hi ${session.user.name || 'there'},</p>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>Or click the link below to verify:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error: any) {
    console.error("Failed to send verification email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
