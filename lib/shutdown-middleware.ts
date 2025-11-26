import { NextResponse } from "next/server";
import { isSystemOn } from "@/lib/shutdown-state";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function checkShutdownStatus(request: Request) {
  const systemOn = await isSystemOn();
  
  if (systemOn) {
    return null; // No shutdown, continue normally
  }

  // Check if user is admin
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.role === "admin") {
      return null; // Admin can access during shutdown
    }
  } catch (error) {
    // Continue with shutdown check
  }

  // Return shutdown response for non-admin users
  return NextResponse.json(
    { 
      error: "System is powered off by the BlazeNeuro Team. Please contact administrator."
    }, 
    { status: 503 }
  );
}
