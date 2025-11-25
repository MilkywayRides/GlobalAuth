"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string;
  homepageUrl: string;
  appType: string;
}

export default function OAuthAppSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<OAuthApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSecret, setGeneratingSecret] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data } = await authClient.getSession();

      if (!data?.user) {
        router.push("/login");
        return;
      }

      if (data.user.role !== "admin") {
        router.push("/");
        return;
      }

      setSession(data);
      loadApp();
    } catch (error) {
      console.error("Session check failed:", error);
      router.push("/login");
    }
  };

  const loadApp = async () => {
    try {
      const res = await fetch(`/api/admin/oauth/apps/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data);
      } else {
        toast.error("Failed to load application");
        router.push("/admin/oauth");
      }
    } catch (error) {
      console.error("Failed to load app:", error);
      toast.error("Failed to load application");
      router.push("/admin/oauth");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/oauth/apps/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: app.name,
          homepageUrl: app.homepageUrl,
          redirectUris: app.redirectUris,
          appType: app.appType,
        }),
      });

      if (res.ok) {
        toast.success("Application updated successfully");
      } else {
        toast.error("Failed to update application");
      }
    } catch (error) {
      console.error("Failed to update app:", error);
      toast.error("Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!app || !confirm(`Are you sure you want to delete "${app.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/oauth/apps/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success("Application deleted successfully");
        router.push("/admin/oauth");
      } else {
        toast.error("Failed to delete application");
      }
    } catch (error) {
      console.error("Failed to delete app:", error);
      toast.error("Failed to delete application");
    }
  };

  const generateNewSecret = async () => {
    if (!confirm("Are you sure you want to generate a new client secret? This will invalidate the current secret.")) {
      return;
    }

    setGeneratingSecret(true);
    try {
      const res = await fetch(`/api/admin/oauth/apps/${params.id}/regenerate-secret`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setApp({ ...app!, clientSecret: data.clientSecret });
        toast.success("New client secret generated successfully");
      } else {
        toast.error("Failed to generate new secret");
      }
    } catch (error) {
      console.error("Failed to generate secret:", error);
      toast.error("Failed to generate new secret");
    } finally {
      setGeneratingSecret(false);
    }
  };

  if (loading) {
    return <PageLoadingSpinner text="Loading application settings..." />;
  }

  if (!app) {
    return <div>Application not found</div>;
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
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/oauth">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Applications
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Application Settings</h1>
              <p className="text-muted-foreground">Configure your OAuth application</p>
            </div>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>Basic information about your application</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Application Name</Label>
                    <Input
                      id="name"
                      value={app.name}
                      onChange={(e) => setApp({ ...app, name: e.target.value })}
                      placeholder="My Application"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homepage">Homepage URL</Label>
                    <Input
                      id="homepage"
                      type="url"
                      value={app.homepageUrl}
                      onChange={(e) => setApp({ ...app, homepageUrl: e.target.value })}
                      placeholder="https://myapp.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redirectUris">Redirect URIs</Label>
                    <Textarea
                      id="redirectUris"
                      value={app.redirectUris}
                      onChange={(e) => setApp({ ...app, redirectUris: e.target.value })}
                      placeholder="https://myapp.com/callback&#10;https://localhost:3000/callback"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      One URI per line. These are the allowed callback URLs for your application.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appType">Application Type</Label>
                    <Select value={app.appType} onValueChange={(value) => setApp({ ...app, appType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web Application</SelectItem>
                        <SelectItem value="mobile">Mobile Application</SelectItem>
                        <SelectItem value="desktop">Desktop Application</SelectItem>
                        <SelectItem value="server">Server Application</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Application
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Credentials</CardTitle>
                <CardDescription>Use these credentials to authenticate your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded">
                    <code className="flex-1 text-sm">{app.clientId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(app.clientId);
                        toast.success("Client ID copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={generateNewSecret}
                      disabled={generatingSecret}
                    >
                      {generatingSecret ? 'Generating...' : 'Generate New Secret'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generate a new client secret. This will invalidate the current secret.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
