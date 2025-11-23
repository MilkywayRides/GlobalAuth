import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OAuthConsentForm } from "@/components/oauth/oauth-consent-form";

interface AuthorizePageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    response_type?: string;
    scope?: string;
    state?: string;
  }>;
}

async function AuthorizeContent({ searchParams }: AuthorizePageProps) {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(h => h.headers()),
  });
  const params = await searchParams;

  if (!session?.user) {
    const loginUrl = new URL("/login", process.env.BETTER_AUTH_URL || "http://localhost:3000");
    loginUrl.searchParams.set("callbackUrl", `/oauth/authorize?${new URLSearchParams(params as Record<string, string>).toString()}`);
    redirect(loginUrl.toString());
  }

  const { client_id, redirect_uri, response_type, scope, state } = params;

  if (!client_id || !redirect_uri || response_type !== "code") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid OAuth Request</h1>
          <p className="text-muted-foreground">Missing or invalid parameters</p>
        </div>
      </div>
    );
  }

  // Get application details
  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.clientId, client_id));

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Not Found</h1>
          <p className="text-muted-foreground">Invalid client_id</p>
        </div>
      </div>
    );
  }

  // Validate redirect URI
  const redirectUris = application.redirectUris || [];
  if (!redirectUris.includes(redirect_uri)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Redirect URI</h1>
          <p className="text-muted-foreground">Redirect URI not registered for this application</p>
        </div>
      </div>
    );
  }

  const scopes = scope?.split(" ") || ["read"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <OAuthConsentForm
        application={{
          id: application.id,
          name: application.name,
          description: application.description || undefined,
          homepageUrl: application.homepageUrl || undefined,
        }}
        user={session.user}
        scopes={scopes}
        redirectUri={redirect_uri}
        state={state}
      />
    </div>
  );
}

export default function AuthorizePage(props: AuthorizePageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthorizeContent {...props} />
    </Suspense>
  );
}
