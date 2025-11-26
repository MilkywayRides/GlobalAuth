import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setSystemStatus, getSystemStatus } from "@/lib/shutdown-state";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getSystemStatus();
    return NextResponse.json({ shutdown: status === "poweroff" });
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
    await setSystemStatus(shutdown ? "poweroff" : "on", session.user.id);

    if (shutdown) {
      console.log("🚨 SYSTEM POWERED OFF by", session.user.email);
    } else {
      console.log("✅ System powered on by", session.user.email);
    }

    return NextResponse.json({ success: true, shutdown });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
