import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiUsage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];

    try {
        const usage = await db
            .select({
                keyId: apiUsage.keyId,
                endpoint: apiUsage.endpoint,
                method: apiUsage.method,
                statusCode: apiUsage.statusCode,
                timestamp: apiUsage.timestamp,
            })
            .from(apiUsage);

        return NextResponse.json({ usage });
    } catch (error) {
        console.error("Error fetching usage:", error);
        return NextResponse.json({ usage: [] });
    }
}
