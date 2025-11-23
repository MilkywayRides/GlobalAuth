import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeys, apiUsage } from "@/lib/db/schema";
import { eq, and, desc, sql, gte, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get all API keys belonging to the current user
        const userApiKeys = await db
            .select({ 
                id: apiKeys.id, 
                name: apiKeys.name 
            })
            .from(apiKeys)
            .where(and(
                eq(apiKeys.userId, session.user.id),
                eq(apiKeys.isActive, true)
            ));

        if (userApiKeys.length === 0) {
            return NextResponse.json({ 
                users: [], 
                stats: { totalUsers: 0, activeToday: 0, totalRequests: 0 }
            });
        }

        const keyIds = userApiKeys.map(key => key.id);

        // Get unique IP addresses and their usage patterns
        const authenticatedSessions = await db
            .select({
                ipAddress: apiUsage.ipAddress,
                userAgent: apiUsage.userAgent,
                keyId: apiUsage.keyId,
                firstSeen: sql<string>`MIN(${apiUsage.timestamp})`,
                lastSeen: sql<string>`MAX(${apiUsage.timestamp})`,
                totalRequests: sql<number>`COUNT(*)`,
                successfulRequests: sql<number>`COUNT(CASE WHEN ${apiUsage.statusCode} < 400 THEN 1 END)`,
            })
            .from(apiUsage)
            .where(inArray(apiUsage.keyId, keyIds))
            .groupBy(apiUsage.ipAddress, apiUsage.userAgent, apiUsage.keyId)
            .orderBy(desc(sql`MAX(${apiUsage.timestamp})`));

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalRequestsResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(apiUsage)
            .where(inArray(apiUsage.keyId, keyIds));

        const [activeTodayResult] = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${apiUsage.ipAddress})` })
            .from(apiUsage)
            .where(and(
                inArray(apiUsage.keyId, keyIds),
                gte(apiUsage.timestamp, today)
            ));

        // Format users with meaningful data
        const formattedUsers = authenticatedSessions.map((session, index) => {
            const apiKey = userApiKeys.find(key => key.id === session.keyId);
            const ipHash = session.ipAddress?.slice(-8) || 'unknown';
            const browserInfo = session.userAgent?.includes('Chrome') ? 'Chrome' : 
                              session.userAgent?.includes('Firefox') ? 'Firefox' : 
                              session.userAgent?.includes('Safari') ? 'Safari' : 'Unknown';

            return {
                id: `session_${index}`,
                name: `User ${ipHash}`,
                email: `user.${ipHash}@client.app`,
                image: undefined,
                lastUsed: session.lastSeen,
                firstUsed: session.firstSeen,
                apiKeyName: apiKey?.name || 'Unknown Key',
                totalRequests: session.totalRequests,
                successfulRequests: session.successfulRequests,
                browser: browserInfo,
                ipAddress: session.ipAddress,
            };
        });

        const stats = {
            totalUsers: authenticatedSessions.length,
            activeToday: activeTodayResult?.count || 0,
            totalRequests: totalRequestsResult?.count || 0,
        };

        return NextResponse.json({ users: formattedUsers, stats });
    } catch (error) {
        console.error("Failed to fetch authenticated users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
