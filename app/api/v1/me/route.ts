import { db } from "@/lib/db";
import { apiKeys, apiUsage, user } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const keyValue = authHeader.split(" ")[1];

    try {
        // Validate API key
        const [key] = await db
            .select()
            .from(apiKeys)
            .where(eq(apiKeys.key, keyValue))
            .limit(1);

        if (!key) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        // Check if key is active
        if (!key.isActive) {
            return NextResponse.json({ error: "API key is disabled" }, { status: 401 });
        }

        // Check if key is expired
        if (key.expiresAt && new Date() > key.expiresAt) {
            return NextResponse.json({ error: "API key expired" }, { status: 401 });
        }

        // Update last used timestamp
        await db
            .update(apiKeys)
            .set({ lastUsed: new Date() })
            .where(eq(apiKeys.id, key.id));

        // Get user data
        const [userData] = await db
            .select()
            .from(user)
            .where(eq(user.id, key.userId))
            .limit(1);

        if (!userData) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt,
        });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
