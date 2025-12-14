import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const session = await auth.api.signInEmail({
      body: { email, password },
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userData = await db.select().from(user).where(eq(user.email, email)).limit(1);

    return NextResponse.json({
      token: session.token,
      user: {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
        image: userData[0].image,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
