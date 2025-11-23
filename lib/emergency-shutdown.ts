import { NextRequest, NextResponse } from "next/server";
import { getShutdownState } from "@/lib/shutdown-state";

export async function checkEmergencyShutdown(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Skip shutdown check for admin and shutdown endpoints
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/emergency-shutdown") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return null;
  }

  // Check if auth-related endpoint
  const isAuthEndpoint = 
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/oauth") ||
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/v1") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/oauth");

  if (isAuthEndpoint && await getShutdownState()) {
    return NextResponse.json(
      { 
        error: "Service temporarily unavailable", 
        message: "Authentication services are currently under maintenance. Please try again later.",
        code: "EMERGENCY_SHUTDOWN"
      },
      { status: 503 }
    );
  }

  return null;
}
