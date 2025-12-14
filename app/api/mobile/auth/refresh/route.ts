import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided" }, { status: 401 });
    }

    const session = await auth.api.getSession({
      headers: { cookie: `better-auth.session_token=${refreshToken}` },
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    return NextResponse.json({
      token: session.session.token,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
