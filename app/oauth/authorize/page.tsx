import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ConsentForm } from "@/components/oauth/consent-form";

export default async function OAuthAuthorizePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const clientId = params.client_id as string;
    const redirectUri = params.redirect_uri as string;

    if (!clientId || !redirectUri) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Invalid Request</h1>
                    <p className="text-muted-foreground">Missing client_id or redirect_uri</p>
                </div>
            </div>
        );
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        const loginUrl = new URL("/login", "http://localhost:3000"); // Base URL might need adjustment in prod
        loginUrl.searchParams.set("callbackUrl", `/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`);
        redirect(loginUrl.pathname + loginUrl.search);
    }

    const [app] = await db
        .select()
        .from(applications)
        .where(eq(applications.clientId, clientId));

    if (!app) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Application Not Found</h1>
                    <p className="text-muted-foreground">The client_id provided does not match any registered application.</p>
                </div>
            </div>
        );
    }

    // Verify redirect_uri
    const allowedUris = app.redirectUris.split(",").map((u) => u.trim());
    if (!allowedUris.includes(redirectUri)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Invalid Redirect URI</h1>
                    <p className="text-muted-foreground">The redirect_uri provided is not authorized for this application.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <ConsentForm
                app={{
                    name: app.name,
                    homepageUrl: app.homepageUrl,
                    appType: app.appType,
                }}
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image || null,
                }}
            />
        </div>
    );
}
