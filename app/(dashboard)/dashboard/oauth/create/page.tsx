"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function CreateOAuthAppPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        appType: "web",
        homepageUrl: "",
        redirectUris: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createdApp, setCreatedApp] = useState<{
        clientId: string;
        clientSecret: string;
        name: string;
    } | null>(null);
    const [copiedId, setCopiedId] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/user/oauth/apps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create application");
            }

            setCreatedApp(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, type: 'id' | 'secret') => {
        navigator.clipboard.writeText(text);
        if (type === 'id') {
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        } else {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        }
    };

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "",
        role: session.user.role,
    };

    if (createdApp) {
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
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl mx-auto w-full">
                                <div className="flex items-center gap-2">
                                    <Link href="/dashboard/oauth">
                                        <Button variant="ghost" size="icon">
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <h1 className="text-3xl font-bold">Application Created</h1>
                                </div>

                                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                                    <AlertDescription className="text-green-900 dark:text-green-300">
                                        Your OAuth application has been created successfully. Make sure to copy your Client Secret now - you won't be able to see it again!
                                    </AlertDescription>
                                </Alert>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{createdApp.name}</CardTitle>
                                        <CardDescription>
                                            Save these credentials securely. The Client Secret will only be shown once.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Client ID</Label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-sm font-mono">
                                                    {createdApp.clientId}
                                                </code>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleCopy(createdApp.clientId, 'id')}
                                                    className="flex-shrink-0"
                                                >
                                                    {copiedId ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Client Secret</Label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-sm font-mono">
                                                    {createdApp.clientSecret}
                                                </code>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleCopy(createdApp.clientSecret, 'secret')}
                                                    className="flex-shrink-0"
                                                >
                                                    {copiedSecret ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Link href="/dashboard/oauth" className="w-full">
                                            <Button className="w-full">Done</Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

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
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-3xl mx-auto w-full">
                            <div className="flex items-center gap-2">
                                <Link href="/dashboard/oauth">
                                    <Button variant="ghost" size="icon">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <h1 className="text-3xl font-bold">Create OAuth Application</h1>
                            </div>

                            <Card>
                                <form onSubmit={handleSubmit}>
                                    <CardHeader>
                                        <CardTitle>New OAuth Application</CardTitle>
                                        <CardDescription>
                                            Register a new OAuth application to enable third-party integrations
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {error && (
                                            <Alert variant="destructive">
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Application Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="My Awesome App"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="What does your application do?"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                disabled={loading}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="appType">Application Type *</Label>
                                            <Select
                                                value={formData.appType}
                                                onValueChange={(value) => setFormData({ ...formData, appType: value })}
                                                disabled={loading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select application type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="web">Web Application</SelectItem>
                                                    <SelectItem value="native">Native Application</SelectItem>
                                                    <SelectItem value="spa">Single Page Application</SelectItem>
                                                    <SelectItem value="service">Service/Machine-to-Machine</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="homepageUrl">Homepage URL</Label>
                                            <Input
                                                id="homepageUrl"
                                                type="url"
                                                placeholder="https://example.com"
                                                value={formData.homepageUrl}
                                                onChange={(e) => setFormData({ ...formData, homepageUrl: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="redirectUris">Authorization Callback URL *</Label>
                                            <Input
                                                id="redirectUris"
                                                type="url"
                                                placeholder="https://example.com/oauth/callback"
                                                value={formData.redirectUris}
                                                onChange={(e) => setFormData({ ...formData, redirectUris: e.target.value })}
                                                required
                                                disabled={loading}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Users will be redirected here after authorization
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Link href="/dashboard/oauth" className="flex-1">
                                            <Button type="button" variant="outline" className="w-full" disabled={loading}>
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button type="submit" className="flex-1" disabled={loading || !formData.name || !formData.redirectUris}>
                                            {loading ? "Creating..." : "Create Application"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
