import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { session, oauthTokens, applications } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

interface LocationData {
  country: string;
  city: string;
  lat: number;
  lon: number;
  count: number;
}

export async function GET() {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unique IP addresses from sessions of users who authenticated through current user's OAuth apps
    const sessions = await db
      .select({
        ipAddress: session.ipAddress,
        count: sql<number>`count(*)::int`,
      })
      .from(session)
      .innerJoin(oauthTokens, eq(session.userId, oauthTokens.userId))
      .innerJoin(applications, eq(oauthTokens.clientId, applications.clientId))
      .where(sql`${session.ipAddress} IS NOT NULL AND ${session.ipAddress} != '' AND ${applications.userId} = ${sessionData.user.id}`)
      .groupBy(session.ipAddress)
      .limit(100);

    // Fetch geolocation data for each IP
    const locations: LocationData[] = [];
    
    for (const s of sessions) {
      if (!s.ipAddress) continue;
      
      try {
        // Use ip-api.com free API (no key required, 45 req/min limit)
        const response = await fetch(`http://ip-api.com/json/${s.ipAddress}?fields=status,country,city,lat,lon`);
        const data = await response.json();
        
        if (data.status === 'success') {
          locations.push({
            country: data.country,
            city: data.city,
            lat: data.lat,
            lon: data.lon,
            count: s.count,
          });
        }
      } catch (error) {
        console.error(`Failed to fetch location for IP ${s.ipAddress}:`, error);
      }
    }

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Error fetching user locations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
