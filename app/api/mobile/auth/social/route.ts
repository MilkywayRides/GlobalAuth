import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");
  
  if (!provider || !["google", "github"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const authUrl = `${process.env.BETTER_AUTH_URL}/api/auth/signin/${provider}`;
  
  return NextResponse.json({ authUrl });
}
