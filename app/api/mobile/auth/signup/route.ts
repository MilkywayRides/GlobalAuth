import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { verification } from "@/lib/db/schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    const session = await auth.api.signUpEmail({
      body: { name, email, password },
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Signup failed" }, { status: 400 });
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: email,
      value: code,
      expiresAt,
    });

    // Send verification email
    await resend.emails.send({
      from: "BlazeNeuro <noreply@blazeneuro.com>",
      to: email,
      subject: "Verify your email - BlazeNeuro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to BlazeNeuro!</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #000;">${code}</h1>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      token: session.token,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
