import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiUsage } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sql, desc, gte, and } from "drizzle-orm";

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const timeframe = url.searchParams.get('timeframe') || '24h';
        
        // Calculate time range
        const now = new Date();
        let startTime = new Date();
        
        switch (timeframe) {
            case '1h':
                startTime.setHours(now.getHours() - 1);
                break;
            case '24h':
                startTime.setDate(now.getDate() - 1);
                break;
            case '7d':
                startTime.setDate(now.getDate() - 7);
                break;
            case '30d':
                startTime.setDate(now.getDate() - 30);
                break;
            default:
                startTime.setDate(now.getDate() - 1);
        }

        // Get request statistics
        const [totalRequests] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(apiUsage)
            .where(gte(apiUsage.timestamp, startTime));

        const [successfulRequests] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(apiUsage)
            .where(and(
                gte(apiUsage.timestamp, startTime),
                sql`${apiUsage.statusCode} < 400`
            ));

        const [avgResponseTime] = await db
            .select({ avg: sql<number>`AVG(${apiUsage.responseTime})` })
            .from(apiUsage)
            .where(gte(apiUsage.timestamp, startTime));

        // Get top endpoints
        const topEndpoints = await db
            .select({
                endpoint: apiUsage.endpoint,
                count: sql<number>`COUNT(*)`,
                avgResponseTime: sql<number>`AVG(${apiUsage.responseTime})`,
            })
            .from(apiUsage)
            .where(gte(apiUsage.timestamp, startTime))
            .groupBy(apiUsage.endpoint)
            .orderBy(desc(sql`COUNT(*)`))
            .limit(10);

        // Get error rates by status code
        const errorRates = await db
            .select({
                statusCode: apiUsage.statusCode,
                count: sql<number>`COUNT(*)`,
            })
            .from(apiUsage)
            .where(and(
                gte(apiUsage.timestamp, startTime),
                sql`${apiUsage.statusCode} >= 400`
            ))
            .groupBy(apiUsage.statusCode)
            .orderBy(desc(sql`COUNT(*)`));

        // Get requests over time (hourly buckets)
        const requestsOverTime = await db
            .select({
                hour: sql<string>`DATE_TRUNC('hour', ${apiUsage.timestamp})`,
                count: sql<number>`COUNT(*)`,
                errors: sql<number>`COUNT(CASE WHEN ${apiUsage.statusCode} >= 400 THEN 1 END)`,
            })
            .from(apiUsage)
            .where(gte(apiUsage.timestamp, startTime))
            .groupBy(sql`DATE_TRUNC('hour', ${apiUsage.timestamp})`)
            .orderBy(sql`DATE_TRUNC('hour', ${apiUsage.timestamp})`);

        // Get unique users (by IP)
        const [uniqueUsers] = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${apiUsage.ipAddress})` })
            .from(apiUsage)
            .where(gte(apiUsage.timestamp, startTime));

        const stats = {
            totalRequests: totalRequests?.count || 0,
            successfulRequests: successfulRequests?.count || 0,
            errorRate: totalRequests?.count ? 
                ((totalRequests.count - (successfulRequests?.count || 0)) / totalRequests.count * 100).toFixed(2) : 0,
            avgResponseTime: Math.round(avgResponseTime?.avg || 0),
            uniqueUsers: uniqueUsers?.count || 0,
            topEndpoints,
            errorRates,
            requestsOverTime,
            timeframe,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Failed to fetch request analytics:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
