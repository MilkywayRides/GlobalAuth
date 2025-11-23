"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateOAuthAppPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const [createdApp, setCreatedApp] = useState<any>(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const { data } = await authClient.getSession();

            if (!data?.user || data.user.role !== "admin") {
                window.location.href = "/";
                return;
            }

            setSession(data);
        } catch (error) {
            console.error("Session check failed:", error);
            window.location.href = "/login";
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            homepageUrl: formData.get("homepageUrl"),
            redirectUris: formData.get("redirectUris"),
            appType: formData.get("appType"),
        };

        try {
            const res = await fetch("/api/admin/oauth/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const result = await res.json();
                setCreatedApp(result);
                toast.success("Application created successfully");
            } else {
                toast.error("Failed to create application");
            }
        } catch (error) {
            console.error("Create app failed:", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const user = session?.user ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "",
        role: session.user.role,
    } : undefined;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" user={user} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-4 md:p-6 max-w-3xl mx-auto w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Create OAuth Application</h1>
                        <p className="text-muted-foreground">Register a new application to use OAuth authentication</p>
                    </div>

                    {createdApp ? (
                        <Card className="border-green-500/50 bg-green-500/5 dark:bg-green-500/10">
                            <CardHeader>
                                <CardTitle className="text-green-600 dark:text-green-400">Application Created!</CardTitle>
                                <CardDescription>
                                    Please copy your Client Secret now. It will <strong>never</strong> be shown again.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Client ID</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input value={createdApp.clientId} readOnly />
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdApp.clientId)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label>Client Secret</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input value={createdApp.clientSecret} readOnly className="font-mono" />
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(createdApp.clientSecret)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>
                                        Store this secret securely. If you lose it, you will need to generate a new one.
                                    </AlertDescription>
                                </Alert>
                                <Button onClick={() => router.push("/admin/oauth")} className="w-full">
                                    Back to Applications
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Details</CardTitle>
                                <CardDescription>Enter the details for your new application</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Application Name</Label>
                                        <Input id="name" name="name" placeholder="My Awesome App" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="appType">Application Type</Label>
                                        <Select name="appType" required defaultValue="web">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="web">Web Application</SelectItem>
                                                <SelectItem value="native">Native (Mobile/Desktop)</SelectItem>
                                                <SelectItem value="spa">Single Page App</SelectItem>
                                                <SelectItem value="service">Service (Machine to Machine)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="homepageUrl">Homepage URL</Label>
                                        <Input id="homepageUrl" name="homepageUrl" type="url" placeholder="https://example.com" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="redirectUris">Authorization Callback URL</Label>
                                        <Input id="redirectUris" name="redirectUris" type="url" placeholder="https://example.com/callback" required />
                                        <p className="text-xs text-muted-foreground">
                                            Where we should redirect users after they authorize your app.
                                        </p>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? "Creating..." : "Create Application"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
