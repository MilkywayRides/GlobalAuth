"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageLoadingSpinner, LoadingSpinner } from "@/components/ui/loading-spinner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2, Key, Shield } from "lucide-react";
import { toast } from "sonner";

interface OAuthApp {
  id: string;
  name: string;
  clientId: string;
  appType: string;
  redirectUris: string[];
  homepageUrl?: string;
  createdAt: string;
}

export default function UserOAuthPage() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newApp, setNewApp] = useState({
    name: "",
    appType: "web",
    redirectUris: "",
    homepageUrl: ""
  });

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
      const res = await fetch("/api/user/oauth/apps");
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps);
      }
    } catch (error) {
      console.error("Failed to load apps:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const createApp = async () => {
    if (!newApp.name.trim() || !newApp.redirectUris.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/user/oauth/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newApp,
          redirectUris: newApp.redirectUris.split(",").map(uri => uri.trim())
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Application created successfully");
        setShowCreateDialog(false);
        setNewApp({ name: "", appType: "web", redirectUris: "", homepageUrl: "" });
        loadApps();
        
        // Show client credentials
        toast.success(`Client ID: ${data.clientId}`, { duration: 10000 });
        toast.success(`Client Secret: ${data.clientSecret}`, { duration: 10000 });
      } else {
        toast.error("Failed to create application");
      }
    } catch (error) {
      toast.error("Failed to create application");
    } finally {
      setCreating(false);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      const res = await fetch(`/api/user/oauth/apps/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("Application deleted");
        loadApps();
      } else {
        toast.error("Failed to delete application");
      }
    } catch (error) {
      toast.error("Failed to delete application");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
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
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">OAuth Applications</h1>
              <p className="text-muted-foreground">Manage your OAuth applications and API keys</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create OAuth Application</DialogTitle>
                  <DialogDescription>
                    Create a new OAuth application to integrate with your services.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Application Name *</Label>
                    <Input
                      id="name"
                      value={newApp.name}
                      onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                      placeholder="My Application"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appType">Application Type</Label>
                    <Select value={newApp.appType} onValueChange={(value) => setNewApp({ ...newApp, appType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web Application</SelectItem>
                        <SelectItem value="spa">Single Page App</SelectItem>
                        <SelectItem value="native">Native App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="redirectUris">Redirect URIs * (comma-separated)</Label>
                    <Input
                      id="redirectUris"
                      value={newApp.redirectUris}
                      onChange={(e) => setNewApp({ ...newApp, redirectUris: e.target.value })}
                      placeholder="https://example.com/callback, https://localhost:3000/callback"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homepageUrl">Homepage URL</Label>
                    <Input
                      id="homepageUrl"
                      value={newApp.homepageUrl}
                      onChange={(e) => setNewApp({ ...newApp, homepageUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createApp} disabled={creating}>
                    {creating ? <LoadingSpinner size="sm" /> : "Create Application"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your OAuth applications can only access basic profile information (name, email, avatar). 
                  Client secrets are shown only once during creation. Store them securely.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="secondary">{app.appType}</Badge>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteApp(app.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold block mb-1">Client ID:</span>
                      <div className="flex items-center gap-2 bg-muted p-2 rounded">
                        <code className="truncate flex-1 text-xs">{app.clientId}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(app.clientId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {app.homepageUrl && (
                      <div>
                        <span className="font-semibold block mb-1">Homepage:</span>
                        <a
                          href={app.homepageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline truncate block text-xs"
                        >
                          {app.homepageUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold block mb-1">Redirect URIs:</span>
                      <div className="space-y-1">
                        {app.redirectUris.map((uri, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground truncate">
                            {uri}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {apps.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No OAuth applications found.</p>
                <p className="text-sm">Create your first application to get started.</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
