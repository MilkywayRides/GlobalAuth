import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKey, apiKeyUsage } from "@/lib/db/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await db
        .select({
            id: apiKey.id,
            name: apiKey.name,
            key: apiKey.key,
            createdAt: apiKey.createdAt,
            lastUsedAt: apiKey.lastUsedAt,
            expiresAt: apiKey.expiresAt,
        })
        .from(apiKey)
        .where(eq(apiKey.userId, session.user.id));

    return NextResponse.json({ keys });
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate API key
    const keyValue = `ak_${crypto.randomBytes(32).toString("hex")}`;
    const keyId = crypto.randomUUID();

    try {
        await db.insert(apiKey).values({
            id: keyId,
            userId: session.user.id,
            name,
            key: keyValue,
            createdAt: new Date(),
            lastUsedAt: null,
            expiresAt: null,
        });

        return NextResponse.json({
            id: keyId,
            key: keyValue,
            name,
        });
    } catch (error) {
        console.error("Error creating API key:", error);
        return NextResponse.json(
            { error: "Failed to create API key" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
        return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
    }

    try {
        // Verify ownership and delete
        await db
            .delete(apiKey)
            .where(
                and(
                    eq(apiKey.id, keyId),
                    eq(apiKey.userId, session.user.id)
                )
            );

        // Also delete usage data
        await db
            .delete(apiKeyUsage)
            .where(eq(apiKeyUsage.apiKeyId, keyId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting API key:", error);
        return NextResponse.json(
            { error: "Failed to delete API key" },
            { status: 500 }
        );
    }
}
