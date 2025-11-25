import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    console.log('Admin OAuth GET - Session:', session?.user?.id, session?.user?.email, 'Role:', session?.user?.role);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get only applications created by the current admin user
    console.log('Fetching admin apps for user ID:', session.user.id);
    const apps = await db.select().from(applications).where(eq(applications.userId, session.user.id));
    console.log('Found admin apps:', apps.length);
    
    return NextResponse.json(apps, {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, homepageUrl, redirectUris, appType } = body;

    if (!name || !redirectUris || !appType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clientId = `bn_${crypto.randomBytes(16).toString("hex")}`;
    const clientSecret = `bn_${crypto.randomBytes(32).toString("hex")}`;
    const id = crypto.randomUUID();

    await db.insert(applications).values({
        id,
        name,
        clientId,
        clientSecret,
        redirectUris,
        homepageUrl,
        appType,
        userId: session.user.id,
        // isAdmin: true, // Temporarily removed until column exists
    });

    return NextResponse.json({ clientId, clientSecret });
}
