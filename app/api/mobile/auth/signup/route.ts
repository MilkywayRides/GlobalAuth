import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
