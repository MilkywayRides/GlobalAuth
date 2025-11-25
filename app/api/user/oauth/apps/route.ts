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

    console.log('User OAuth GET - Session:', session?.user?.id, session?.user?.email);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's own applications only
    console.log('Fetching apps for user ID:', session.user.id);
    const apps = await db.select().from(applications).where(eq(applications.userId, session.user.id));
    console.log('Found apps:', apps.length);
    
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

    console.log('User OAuth POST - Session:', session?.user?.id, session?.user?.email);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, homepageUrl, redirectUris, appType } = body;

    console.log('Creating app:', { name, appType, userId: session.user.id });

    if (!name || !redirectUris || !appType) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clientId = `usr_${crypto.randomBytes(16).toString("hex")}`;
    const clientSecret = `usr_${crypto.randomBytes(32).toString("hex")}`;
    const id = crypto.randomUUID();

    const insertData = {
        id,
        name,
        clientId,
        clientSecret,
        redirectUris,
        homepageUrl,
        appType,
        userId: session.user.id,
        // isAdmin: false, // Temporarily removed until column exists
    };

    console.log('Inserting app data:', insertData);

    await db.insert(applications).values(insertData);

    console.log('App created successfully');

    return NextResponse.json({ clientId, clientSecret });
}
