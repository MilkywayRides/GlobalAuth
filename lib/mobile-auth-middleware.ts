import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function validateMobileToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "No token provided", status: 401 };
  }

  const token = authHeader.substring(7);
  
  try {
    const session = await auth.api.getSession({
      headers: { cookie: `better-auth.session_token=${token}` },
    });

    if (!session) {
      return { error: "Invalid token", status: 401 };
    }

    return { session, user: session.user };
  } catch (error) {
    return { error: "Token validation failed", status: 500 };
  }
}

export function createMobileResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
