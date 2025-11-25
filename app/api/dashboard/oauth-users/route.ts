import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { oauthTokens, applications, user } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get OAuth tokens with user and application data
        const oauthUsers = await db
            .select({
                userId: oauthTokens.userId,
                userName: user.name,
                userEmail: user.email,
                userImage: user.image,
                appName: applications.name,
                clientId: applications.clientId,
                lastLogin: oauthTokens.createdAt,
                accessLevel: oauthTokens.scope, // We'll determine this from client ID
            })
            .from(oauthTokens)
            .innerJoin(applications, eq(oauthTokens.clientId, applications.clientId))
            .innerJoin(user, eq(oauthTokens.userId, user.id))
            .orderBy(desc(oauthTokens.createdAt));

        // Transform data and determine access level
        const transformedUsers = oauthUsers.map(oauthUser => ({
            id: oauthUser.userId,
            name: oauthUser.userName,
            email: oauthUser.userEmail,
            image: oauthUser.userImage,
            appName: oauthUser.appName,
            clientId: oauthUser.clientId,
            lastLogin: oauthUser.lastLogin,
            accessLevel: oauthUser.clientId.startsWith('bn_') ? 'full' : 'basic'
        }));

        return NextResponse.json(transformedUsers, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error('Get OAuth users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
