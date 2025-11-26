import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const regionStats = await db
    .select({
      country: user.country,
      region: user.region,
      count: sql<number>`count(*)::int`,
    })
    .from(user)
    .where(sql`${user.country} IS NOT NULL`)
    .groupBy(user.country, user.region)
    .orderBy(sql`count(*) DESC`);

  const countryStats = await db
    .select({
      country: user.country,
      count: sql<number>`count(*)::int`,
    })
    .from(user)
    .where(sql`${user.country} IS NOT NULL`)
    .groupBy(user.country)
    .orderBy(sql`count(*) DESC`);

  return NextResponse.json({
    byCountry: countryStats,
    byRegion: regionStats,
    total: regionStats.reduce((sum, r) => sum + r.count, 0),
  });
}
