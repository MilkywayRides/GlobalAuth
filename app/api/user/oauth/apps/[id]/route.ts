import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
        }

        // Verify the app belongs to the user before deleting
        const [app] = await db
            .select({ id: applications.id })
            .from(applications)
            .where(and(
                eq(applications.id, id),
                eq(applications.userId, session.user.id)
            ));

        if (!app) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Delete the application
        await db
            .delete(applications)
            .where(and(
                eq(applications.id, id),
                eq(applications.userId, session.user.id)
            ));

        return NextResponse.json({ message: "Application deleted successfully" });
    } catch (error) {
        console.error("Failed to delete OAuth app:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
