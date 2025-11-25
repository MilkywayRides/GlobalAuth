"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, Copy, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function UserOAuthPage() {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const { data } = await authClient.getSession();

            if (!data?.user) {
                window.location.href = "/login";
                return;
            }

            setSession(data);
            loadApps();
        } catch (error) {
            console.error("Session check failed:", error);
            window.location.href = "/login";
        }
    };

    const loadApps = async () => {
        try {
            const res = await fetch("/api/user/oauth/apps?" + new Date().getTime(), {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });
            if (res.ok) {
                const data = await res.json();
                setApps(data);
            }
        } catch (error) {
            console.error("Failed to load apps:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const deleteApp = async (appId: string, appName: string) => {
        if (!confirm(`Are you sure you want to delete "${appName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/user/oauth/apps/${appId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success("Application deleted successfully");
                loadApps();
            } else {
                toast.error("Failed to delete application");
            }
        } catch (error) {
            console.error("Failed to delete app:", error);
            toast.error("Failed to delete application");
        }
    };

    if (loading) {
        return <PageLoadingSpinner text="Loading OAuth applications..." />;
    }

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
                <div className="flex flex-1 flex-col p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">My OAuth Applications</h1>
                            <p className="text-muted-foreground">Manage your OAuth applications (Basic Access)</p>
                        </div>
                        <Link href="/dashboard/oauth/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Application
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {apps.map((app) => (
                            <Card key={app.id}>
                                <CardHeader>
                                    <CardTitle>{app.name}</CardTitle>
                                    <CardDescription>{app.appType} • Basic Access</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-semibold block">Client ID:</span>
                                            <div className="flex items-center gap-2 bg-muted p-2 rounded mt-1">
                                                <code className="truncate flex-1">{app.clientId}</code>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(app.clientId)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-semibold block">Homepage:</span>
                                            <a href={app.homepageUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block">
                                                {app.homepageUrl}
                                            </a>
                                        </div>
                                        <div className="bg-yellow-50 p-2 rounded text-xs">
                                            <strong>Access Level:</strong> Basic (id, email, name, avatar only)
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <Link href={`/dashboard/oauth/${app.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => deleteApp(app.id, app.name)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {apps.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No applications found. Create one to get started.
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
