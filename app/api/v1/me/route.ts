import { db } from "@/lib/db";
import { apiKey, apiKeyUsage, user } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing or invalid authorization header" },
            { status: 401 }
        );
    }

    const keyValue = authHeader.substring(7); // Remove "Bearer "

    try {
        // Find the API key
        const [key] = await db
            .select()
            .from(apiKey)
            .where(eq(apiKey.key, keyValue))
            .limit(1);

        if (!key) {
            return NextResponse.json(
                { error: "Invalid API key" },
                { status: 401 }
            );
        }

        // Check if key is expired
        if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: "API key has expired" },
                { status: 401 }
            );
        }

        // Check rate limit
        const today = new Date().toISOString().split('T')[0];
        const [usage] = await db
            .select()
            .from(apiKeyUsage)
            .where(
                and(
                    eq(apiKeyUsage.apiKeyId, key.id),
                    eq(apiKeyUsage.date, today)
                )
            )
            .limit(1);

        const currentCount = usage?.requestCount || 0;

        if (currentCount >= 1000) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    limit: 1000,
                    used: currentCount,
                    reset: "Resets daily at midnight UTC"
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "1000",
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": new Date(new Date(today).getTime() + 86400000).toISOString(),
                    }
                }
            );
        }

        // Increment usage counter
        if (usage) {
            await db
                .update(apiKeyUsage)
                .set({ requestCount: currentCount + 1 })
                .where(eq(apiKeyUsage.id, usage.id));
        } else {
            await db.insert(apiKeyUsage).values({
                id: crypto.randomUUID(),
                apiKeyId: key.id,
                date: today,
                requestCount: 1,
            });
        }

        // Update last used timestamp
        await db
            .update(apiKey)
            .set({ lastUsedAt: new Date() })
            .where(eq(apiKey.id, key.id));

        // Get user data
        const [userData] = await db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            })
            .from(user)
            .where(eq(user.id, key.userId))
            .limit(1);

        if (!userData) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                sub: userData.id,
                name: userData.name,
                email: userData.email,
                picture: userData.image,
                role: userData.role,
            },
            {
                headers: {
                    "X-RateLimit-Limit": "1000",
                    "X-RateLimit-Remaining": String(1000 - currentCount - 1),
                    "X-RateLimit-Reset": new Date(new Date(today).getTime() + 86400000).toISOString(),
                }
            }
        );
    } catch (error) {
        console.error("Error processing API key request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
