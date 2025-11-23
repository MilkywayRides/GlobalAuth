import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setShutdownState, getShutdownState } from "@/lib/shutdown-state";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ shutdown: getShutdownState() });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shutdown } = await request.json();
    setShutdownState(shutdown);

    if (shutdown) {
      console.log("🚨 EMERGENCY SHUTDOWN ACTIVATED by", session.user.email);
    } else {
      console.log("✅ Emergency shutdown deactivated by", session.user.email);
    }

    return NextResponse.json({ success: true, shutdown: getShutdownState() });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
