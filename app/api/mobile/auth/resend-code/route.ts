import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user, verification } from "@/lib/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const userData = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (!userData.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.delete(verification).where(eq(verification.identifier, email));

    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: email,
      value: code,
      expiresAt,
    });

    await resend.emails.send({
      from: "BlazeNeuro <noreply@blazeneuro.com>",
      to: email,
      subject: "Verify your email - BlazeNeuro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #000;">${code}</h1>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}
