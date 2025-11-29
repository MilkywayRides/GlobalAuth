import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { session, user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

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

    if (!sessionData?.user || sessionData.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all unique IP addresses from all sessions
    const sessions = await db
      .select({
        ipAddress: session.ipAddress,
        count: sql<number>`count(*)::int`,
      })
      .from(session)
      .where(sql`${session.ipAddress} IS NOT NULL AND ${session.ipAddress} != ''`)
      .groupBy(session.ipAddress)
      .limit(200);

    // Get total user count
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Fetch geolocation data for each IP
    const locations: LocationData[] = [];
    
    for (const s of sessions) {
      if (!s.ipAddress) continue;
      
      try {
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

    return NextResponse.json({ locations, totalUsers });
  } catch (error) {
    console.error("Error fetching user locations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
