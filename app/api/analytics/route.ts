import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/index';
import { apiUsage, apiKeys } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    // Calculate date range
    const now = new Date();
    const daysBack = period === '30d' ? 30 : period === '7d' ? 7 : 1;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get user's API keys
    const userKeys = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.user.id));

    const keyIds = userKeys.map(k => k.id);

    if (keyIds.length === 0) {
      return NextResponse.json({
        totalRequests: 0,
        successfulRequests: 0,
        errorRequests: 0,
        dailyUsage: [],
        topEndpoints: [],
      });
    }

    // Get usage statistics
    const usageStats = await db
      .select({
        date: sql<string>`DATE(${apiUsage.timestamp})`,
        requests: sql<number>`COUNT(*)`,
        errors: sql<number>`SUM(CASE WHEN ${apiUsage.statusCode} >= 400 THEN 1 ELSE 0 END)`,
      })
      .from(apiUsage)
      .where(
        and(
          sql`${apiUsage.keyId} IN ${keyIds}`,
          gte(apiUsage.timestamp, startDate)
        )
      )
      .groupBy(sql`DATE(${apiUsage.timestamp})`)
      .orderBy(sql`DATE(${apiUsage.timestamp})`);

    // Get top endpoints
    const topEndpoints = await db
      .select({
        endpoint: apiUsage.endpoint,
        requests: sql<number>`COUNT(*)`,
      })
      .from(apiUsage)
      .where(
        and(
          sql`${apiUsage.keyId} IN ${keyIds}`,
          gte(apiUsage.timestamp, startDate)
        )
      )
      .groupBy(apiUsage.endpoint)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    // Calculate totals
    const totalRequests = usageStats.reduce((sum, day) => sum + day.requests, 0);
    const errorRequests = usageStats.reduce((sum, day) => sum + day.errors, 0);
    const successfulRequests = totalRequests - errorRequests;

    return NextResponse.json({
      totalRequests,
      successfulRequests,
      errorRequests,
      dailyUsage: usageStats,
      topEndpoints,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
