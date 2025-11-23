import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { oauthTokens, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    const [accessToken] = await db
        .select()
        .from(oauthTokens)
        .where(eq(oauthTokens.accessToken, token));

    if (!accessToken) {
        return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    if (accessToken.expiresAt < new Date()) {
        return NextResponse.json({ error: "invalid_token", error_description: "Token expired" }, { status: 401 });
    }

    const [userData] = await db
        .select()
        .from(user)
        .where(eq(user.id, accessToken.userId));

    if (!userData) {
        return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    return NextResponse.json({
        sub: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.image,
        role: userData.role,
    });
}
