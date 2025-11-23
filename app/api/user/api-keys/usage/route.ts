import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiKeyUsage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];

    try {
        const usage = await db
            .select({
                apiKeyId: apiKeyUsage.apiKeyId,
                requestCount: apiKeyUsage.requestCount,
            })
            .from(apiKeyUsage)
            .where(eq(apiKeyUsage.date, date));

        return NextResponse.json({ usage });
    } catch (error) {
        console.error("Error fetching usage:", error);
        return NextResponse.json({ usage: [] });
    }
}
