import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Only return limited, safe data for regular users
        const apps = await db
            .select({
                id: applications.id,
                name: applications.name,
                clientId: applications.clientId,
                redirectUris: applications.redirectUris,
                homepageUrl: applications.homepageUrl,
                appType: applications.appType,
                createdAt: applications.createdAt,
            })
            .from(applications)
            .where(eq(applications.userId, session.user.id));

        return NextResponse.json({ apps });
    } catch (error) {
        console.error("Failed to fetch user OAuth apps:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, homepageUrl, redirectUris, appType } = body;

        // Validate required fields
        if (!name?.trim() || !redirectUris || !appType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate app name length
        if (name.length > 100) {
            return NextResponse.json({ error: "App name too long" }, { status: 400 });
        }

        // Validate redirect URIs
        if (!Array.isArray(redirectUris) || redirectUris.length === 0) {
            return NextResponse.json({ error: "At least one redirect URI is required" }, { status: 400 });
        }

        // Validate each redirect URI
        for (const uri of redirectUris) {
            try {
                const url = new URL(uri);
                // Only allow HTTPS in production (except localhost)
                if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
                    return NextResponse.json({ error: "Only HTTPS URLs are allowed in production" }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: "Invalid redirect URI format" }, { status: 400 });
            }
        }

        // Validate app type
        if (!['web', 'spa', 'native'].includes(appType)) {
            return NextResponse.json({ error: "Invalid app type" }, { status: 400 });
        }

        // Check user's app limit (max 10 apps per user)
        const existingApps = await db
            .select({ id: applications.id })
            .from(applications)
            .where(eq(applications.userId, session.user.id));

        if (existingApps.length >= 10) {
            return NextResponse.json({ error: "Maximum number of applications reached (10)" }, { status: 400 });
        }

        // Generate secure credentials with user prefix
        const clientId = `usr_${crypto.randomBytes(16).toString("hex")}`;
        const clientSecret = `usr_${crypto.randomBytes(32).toString("hex")}`;
        const id = crypto.randomUUID();

        // Create the application
        await db.insert(applications).values({
            id,
            name: name.trim(),
            clientId,
            clientSecret,
            redirectUris,
            homepageUrl: homepageUrl?.trim() || null,
            appType,
            userId: session.user.id,
        });

        // Return credentials (only shown once)
        return NextResponse.json({ 
            clientId, 
            clientSecret,
            message: "Application created successfully. Store the client secret securely - it won't be shown again."
        });
    } catch (error) {
        console.error("Failed to create OAuth app:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

