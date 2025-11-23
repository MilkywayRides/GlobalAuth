import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications, oauthCodes, userConsents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { client_id, redirect_uri, scope, state, approved } = body;

    if (!client_id || !redirect_uri) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Get application
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.clientId, client_id));

    if (!application) {
      return NextResponse.json({ error: "Invalid client_id" }, { status: 400 });
    }

    // Validate redirect URI
    const redirectUris = application.redirectUris || [];
    if (!redirectUris.includes(redirect_uri)) {
      return NextResponse.json({ error: "Invalid redirect_uri" }, { status: 400 });
    }

    const redirectUrl = new URL(redirect_uri);

    if (!approved) {
      // User denied authorization
      redirectUrl.searchParams.set("error", "access_denied");
      redirectUrl.searchParams.set("error_description", "User denied authorization");
      if (state) redirectUrl.searchParams.set("state", state);
      
      return NextResponse.json({ redirect_url: redirectUrl.toString() });
    }

    // User approved - generate authorization code
    const authCode = createId();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code
    await db.insert(oauthCodes).values({
      code: authCode,
      clientId: client_id,
      userId: session.user.id,
      redirectUri: redirect_uri,
      scope: scope || "read",
      expiresAt,
    });

    // Store user consent
    await db.insert(userConsents).values({
      id: createId(),
      userId: session.user.id,
      applicationId: application.id,
      scope: scope || "read",
    }).onConflictDoUpdate({
      target: [userConsents.userId, userConsents.applicationId],
      set: {
        scope: scope || "read",
      },
    });

    // Redirect with authorization code
    redirectUrl.searchParams.set("code", authCode);
    if (state) redirectUrl.searchParams.set("state", state);

    return NextResponse.json({ redirect_url: redirectUrl.toString() });

  } catch (error) {
    console.error("OAuth authorize error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
