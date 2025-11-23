import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, oauthCodes, oauthTokens } from "@/lib/db/schema";
import { eq, and, lt } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, code, redirect_uri, client_id, client_secret } = body;

    if (grant_type !== "authorization_code") {
      return NextResponse.json({ 
        error: "unsupported_grant_type",
        error_description: "Only authorization_code grant type is supported"
      }, { status: 400 });
    }

    if (!code || !redirect_uri || !client_id || !client_secret) {
      return NextResponse.json({ 
        error: "invalid_request",
        error_description: "Missing required parameters"
      }, { status: 400 });
    }

    // Verify client credentials
    const [application] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.clientId, client_id),
          eq(applications.clientSecret, client_secret)
        )
      );

    if (!application) {
      return NextResponse.json({ 
        error: "invalid_client",
        error_description: "Invalid client credentials"
      }, { status: 401 });
    }

    // Get and validate authorization code
    const [authCode] = await db
      .select()
      .from(oauthCodes)
      .where(
        and(
          eq(oauthCodes.code, code),
          eq(oauthCodes.clientId, client_id),
          eq(oauthCodes.redirectUri, redirect_uri)
        )
      );

    if (!authCode) {
      return NextResponse.json({ 
        error: "invalid_grant",
        error_description: "Invalid authorization code"
      }, { status: 400 });
    }

    // Check if code is expired
    if (new Date() > authCode.expiresAt) {
      // Delete expired code
      await db.delete(oauthCodes).where(eq(oauthCodes.code, code));
      
      return NextResponse.json({ 
        error: "invalid_grant",
        error_description: "Authorization code expired"
      }, { status: 400 });
    }

    // Generate access token and refresh token
    const accessToken = crypto.randomBytes(32).toString("hex");
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store tokens
    await db.insert(oauthTokens).values({
      accessToken,
      refreshToken,
      clientId: client_id,
      userId: authCode.userId,
      scope: authCode.scope,
      expiresAt,
    });

    // Delete used authorization code
    await db.delete(oauthCodes).where(eq(oauthCodes.code, code));

    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: authCode.scope,
    });

  } catch (error) {
    console.error("OAuth token error:", error);
    return NextResponse.json({ 
      error: "server_error",
      error_description: "Internal server error"
    }, { status: 500 });
  }
}
