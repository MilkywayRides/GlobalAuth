import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, oauthCodes, userConsents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const responseType = searchParams.get("response_type");
    const state = searchParams.get("state");

    if (!clientId || !redirectUri || responseType !== "code") {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify client
    const [app] = await db
        .select()
        .from(applications)
        .where(eq(applications.clientId, clientId));

    if (!app) {
        return NextResponse.json({ error: "Invalid client_id" }, { status: 400 });
    }

    // Verify redirect_uri
    const allowedUris = app.redirectUris.split(",").map((u) => u.trim());
    if (!allowedUris.includes(redirectUri)) {
        return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
    }

    // Check session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        // Redirect to login, then back here
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Check if consent already exists
    const [existingConsent] = await db
        .select()
        .from(oauthConsent)
        .where(
            and(
                eq(oauthConsent.userId, session.user.id),
                eq(oauthConsent.clientId, clientId)
            )
        );

    if (existingConsent) {
        // Auto-generate code and redirect
        const code = crypto.randomBytes(16).toString("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.insert(oauthCode).values({
            code,
            clientId,
            userId: session.user.id,
            redirectUri,
            expiresAt,
        });

        const callbackUrl = new URL(redirectUri);
        callbackUrl.searchParams.set("code", code);
        if (state) callbackUrl.searchParams.set("state", state);

        return NextResponse.redirect(callbackUrl);
    }

    // Redirect to consent page
    const consentUrl = new URL("/oauth/authorize", req.url);
    consentUrl.searchParams.set("client_id", clientId);
    consentUrl.searchParams.set("redirect_uri", redirectUri);
    consentUrl.searchParams.set("state", state || "");

    return NextResponse.redirect(consentUrl);
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { client_id, redirect_uri, state, decision } = body;

    if (decision !== "allow") {
        const callbackUrl = new URL(redirect_uri);
        callbackUrl.searchParams.set("error", "access_denied");
        if (state) callbackUrl.searchParams.set("state", state);
        return NextResponse.json({ redirect: callbackUrl.toString() });
    }

    // Create consent
    await db.insert(oauthConsent).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        clientId: client_id,
    });

    // Generate code
    const code = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(oauthCode).values({
        code,
        clientId: client_id,
        userId: session.user.id,
        redirectUri: redirect_uri,
        expiresAt,
    });

    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set("code", code);
    if (state) callbackUrl.searchParams.set("state", state);

    return NextResponse.json({ redirect: callbackUrl.toString() });
}
