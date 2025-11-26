import { headers } from "next/headers";

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export async function getGeoLocation(ip?: string): Promise<GeoLocation> {
  try {
    const headersList = await headers();
    const ipAddress = ip || 
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip");

    if (!ipAddress || ipAddress === "::1" || ipAddress === "127.0.0.1") {
      return {};
    }

    // Using ip-api.com (free, no key required, 45 req/min)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,regionName,city,timezone`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) return {};

    const data = await response.json();
    
    return {
      country: data.country,
      region: data.regionName,
      city: data.city,
      timezone: data.timezone,
    };
  } catch {
    return {};
  }
}
