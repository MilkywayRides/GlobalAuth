import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const provider = req.nextUrl.searchParams.get("provider");
    const code = req.nextUrl.searchParams.get("code");
    
    if (!provider || !code) {
      return NextResponse.redirect(new URL("/login?error=invalid_request", req.url));
    }

    // Exchange code for user session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
    }

    // Return token to mobile app via deep link
    const deepLink = `blazeneuro://auth?token=${session.session.token}&user=${encodeURIComponent(JSON.stringify({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image
    }))}`;

    return NextResponse.redirect(deepLink);
  } catch (error) {
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}
