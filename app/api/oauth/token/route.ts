import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, oauthCodes, oauthTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { client_id, client_secret, code, grant_type, redirect_uri } = body;

        if (grant_type !== "authorization_code") {
            return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400 });
        }

        if (!client_id || !client_secret || !code || !redirect_uri) {
            return NextResponse.json({ error: "invalid_request" }, { status: 400 });
        }

        // Verify client
        const [app] = await db
            .select()
            .from(applications)
            .where(
                and(
                    eq(applications.clientId, client_id),
                    eq(applications.clientSecret, client_secret)
                )
            );

        if (!app) {
            return NextResponse.json({ error: "invalid_client" }, { status: 401 });
        }

        // Verify code
        const [authCode] = await db
            .select()
            .from(oauthCode)
            .where(eq(oauthCode.code, code));

        if (!authCode) {
            return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
        }

        if (authCode.expiresAt < new Date()) {
            return NextResponse.json({ error: "invalid_grant", error_description: "Code expired" }, { status: 400 });
        }

        if (authCode.clientId !== client_id) {
            return NextResponse.json({ error: "invalid_grant", error_description: "Client mismatch" }, { status: 400 });
        }

        if (authCode.redirectUri !== redirect_uri) {
            return NextResponse.json({ error: "invalid_grant", error_description: "Redirect URI mismatch" }, { status: 400 });
        }

        // Delete code (single use)
        await db.delete(oauthCode).where(eq(oauthCode.code, code));

        // Generate tokens
        const accessToken = crypto.randomBytes(32).toString("hex");
        const refreshToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await db.insert(oauthAccessToken).values({
            accessToken,
            refreshToken,
            clientId: client_id,
            userId: authCode.userId,
            expiresAt,
        });

        return NextResponse.json({
            access_token: accessToken,
            token_type: "Bearer",
            expires_in: 3600,
            refresh_token: refreshToken,
        });
    } catch (error) {
        console.error("Token endpoint error:", error);
        return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
}
