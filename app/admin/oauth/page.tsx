"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, Copy, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function OAuthAppsPage() {
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

            if (data.user.role !== "admin") {
                window.location.href = "/";
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
            const res = await fetch("/api/admin/oauth/apps?" + new Date().getTime(), {
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

        console.log('Deleting app:', appId, appName);

        try {
            const res = await fetch(`/api/admin/oauth/apps/${appId}`, {
                method: 'DELETE',
            });

            console.log('Delete response status:', res.status);
            const responseData = await res.json();
            console.log('Delete response data:', responseData);

            if (res.ok) {
                toast.success("Application deleted successfully");
                loadApps(); // Reload the list
            } else {
                toast.error(`Failed to delete application: ${responseData.error || 'Unknown error'}`);
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
                            <h1 className="text-2xl font-bold">OAuth Applications</h1>
                            <p className="text-muted-foreground">Manage third-party applications</p>
                        </div>
                        <Link href="/admin/oauth/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Application
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {apps.map((app) => (
                            <Card key={app.id} className="hover:shadow-md transition-shadow border-border">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{app.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <span>{app.appType}</span>
                                                <span className="text-muted-foreground">•</span>
                                                <Badge variant="default" className="text-xs">
                                                    Full Access
                                                </Badge>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">CLIENT ID</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <code className="flex-1 text-xs bg-muted/50 px-2 py-1.5 rounded border font-mono truncate">
                                                    {app.clientId}
                                                </code>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-muted"
                                                    onClick={() => copyToClipboard(app.clientId)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {app.homepageUrl && (
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">HOMEPAGE</Label>
                                                <a 
                                                    href={app.homepageUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="block text-xs text-primary hover:underline truncate mt-1"
                                                >
                                                    {app.homepageUrl}
                                                </a>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">REDIRECT URIS</Label>
                                            <div className="space-y-1 mt-1">
                                                {(Array.isArray(app.redirectUris) ? app.redirectUris : []).slice(0, 2).map((uri: string, idx: number) => (
                                                    <div key={idx} className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded truncate">
                                                        {uri}
                                                    </div>
                                                ))}
                                                {Array.isArray(app.redirectUris) && app.redirectUris.length > 2 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        +{app.redirectUris.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2 border-t border-border">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Created {new Date(app.createdAt).toLocaleDateString()}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    Admin Created
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between pt-2">
                                        <Link href={`/admin/oauth/${app.id}`}>
                                            <Button variant="outline" size="sm" className="h-8">
                                                <Settings className="mr-2 h-3 w-3" />
                                                Settings
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            className="h-8"
                                            onClick={() => deleteApp(app.id, app.name)}
                                        >
                                            <Trash2 className="mr-2 h-3 w-3" />
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
