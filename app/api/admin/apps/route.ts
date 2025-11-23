import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, user, apiUsage } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql, desc, asc, ilike, and, gte } from "drizzle-orm";

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const search = url.searchParams.get('search') || '';
        const sortBy = url.searchParams.get('sortBy') || 'createdAt';
        const sortOrder = url.searchParams.get('sortOrder') || 'desc';
        
        const offset = (page - 1) * limit;

        // Build where conditions
        const whereConditions = [];
        if (search) {
            whereConditions.push(
                sql`(${applications.name} ILIKE ${`%${search}%`} OR ${user.name} ILIKE ${`%${search}%`} OR ${user.email} ILIKE ${`%${search}%`})`
            );
        }

        // Get apps with user info and usage stats
        const appsQuery = db
            .select({
                id: applications.id,
                name: applications.name,
                clientId: applications.clientId,
                appType: applications.appType,
                homepageUrl: applications.homepageUrl,
                createdAt: applications.createdAt,
                isActive: applications.isActive,
                userId: applications.userId,
                ownerName: user.name,
                ownerEmail: user.email,
                ownerImage: user.image,
            })
            .from(applications)
            .innerJoin(user, eq(applications.userId, user.id));

        // Apply search filter
        if (whereConditions.length > 0) {
            appsQuery.where(and(...whereConditions));
        }

        // Apply sorting
        const orderColumn = sortBy === 'name' ? applications.name :
                           sortBy === 'createdAt' ? applications.createdAt :
                           applications.createdAt;
        
        if (sortOrder === 'desc') {
            appsQuery.orderBy(desc(orderColumn));
        } else {
            appsQuery.orderBy(asc(orderColumn));
        }

        // Apply pagination
        const apps = await appsQuery.limit(limit).offset(offset);

        // Get total count for pagination
        const [totalResult] = await db
            .select({ count: sql<number>`COUNT(*)` })
            .from(applications)
            .innerJoin(user, eq(applications.userId, user.id))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        // Get usage statistics for each app
        const appIds = apps.map(app => app.id);
        const usageStats = await Promise.all(
            appIds.map(async (appId) => {
                // Get current period stats (last 7 days)
                const currentWeek = new Date();
                currentWeek.setDate(currentWeek.getDate() - 7);
                
                const [currentStats] = await db
                    .select({
                        totalRequests: sql<number>`COUNT(*)`,
                        activeUsers: sql<number>`COUNT(DISTINCT ${apiUsage.ipAddress})`,
                        lastUsed: sql<string>`MAX(${apiUsage.timestamp})`,
                    })
                    .from(apiUsage)
                    .innerJoin(applications, eq(apiUsage.keyId, applications.id))
                    .where(and(
                        eq(applications.id, appId),
                        gte(apiUsage.timestamp, currentWeek)
                    ));

                // Get previous period stats (7-14 days ago)
                const previousWeek = new Date();
                previousWeek.setDate(previousWeek.getDate() - 14);
                const weekBefore = new Date();
                weekBefore.setDate(weekBefore.getDate() - 7);

                const [previousStats] = await db
                    .select({
                        totalRequests: sql<number>`COUNT(*)`,
                    })
                    .from(apiUsage)
                    .innerJoin(applications, eq(apiUsage.keyId, applications.id))
                    .where(and(
                        eq(applications.id, appId),
                        gte(apiUsage.timestamp, previousWeek),
                        sql`${apiUsage.timestamp} < ${weekBefore}`
                    ));

                // Calculate trend
                const currentRequests = currentStats?.totalRequests || 0;
                const previousRequests = previousStats?.totalRequests || 0;
                
                let trend: 'up' | 'down' | 'stable' = 'stable';
                let trendPercentage = 0;

                if (previousRequests > 0) {
                    const change = ((currentRequests - previousRequests) / previousRequests) * 100;
                    trendPercentage = Math.abs(Math.round(change));
                    
                    if (change > 5) trend = 'up';
                    else if (change < -5) trend = 'down';
                } else if (currentRequests > 0) {
                    trend = 'up';
                    trendPercentage = 100;
                }

                return {
                    appId,
                    totalRequests: currentRequests,
                    activeUsers: currentStats?.activeUsers || 0,
                    lastUsed: currentStats?.lastUsed,
                    trend,
                    trendPercentage,
                };
            })
        );

        // Combine apps with their stats
        const appsWithStats = apps.map(app => {
            const stats = usageStats.find(s => s.appId === app.id) || {
                totalRequests: 0,
                activeUsers: 0,
                lastUsed: undefined,
                trend: 'stable' as const,
                trendPercentage: 0,
            };

            return {
                id: app.id,
                name: app.name,
                clientId: app.clientId,
                appType: app.appType,
                homepageUrl: app.homepageUrl,
                createdAt: app.createdAt,
                isActive: app.isActive,
                owner: {
                    id: app.userId,
                    name: app.ownerName,
                    email: app.ownerEmail,
                    image: app.ownerImage,
                },
                stats: {
                    totalRequests: stats.totalRequests,
                    activeUsers: stats.activeUsers,
                    lastUsed: stats.lastUsed,
                    trend: stats.trend,
                    trendPercentage: stats.trendPercentage,
                },
            };
        });

        // Sort by usage stats if requested
        if (sortBy === 'totalRequests' || sortBy === 'activeUsers') {
            appsWithStats.sort((a, b) => {
                const aValue = sortBy === 'totalRequests' ? a.stats.totalRequests : a.stats.activeUsers;
                const bValue = sortBy === 'totalRequests' ? b.stats.totalRequests : b.stats.activeUsers;
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            });
        }

        return NextResponse.json({
            apps: appsWithStats,
            total: totalResult?.count || 0,
            page,
            limit,
            totalPages: Math.ceil((totalResult?.count || 0) / limit),
        });
    } catch (error) {
        console.error("Failed to fetch admin apps:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
