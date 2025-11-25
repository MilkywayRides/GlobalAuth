"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateUserOAuthApp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    homepageUrl: "",
    redirectUris: "",
    appType: "web",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrisArray = formData.redirectUris
        .split('\n')
        .map(uri => uri.trim())
        .filter(uri => uri.length > 0);

      const res = await fetch("/api/user/oauth/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          redirectUris: redirectUrisArray,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Application created successfully!");
        
        // Show the credentials in a modal or alert
        alert(`Application created!\n\nClient ID: ${data.clientId}\nClient Secret: ${data.clientSecret}\n\nSave these credentials securely!`);
        
        router.push("/dashboard/oauth");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to create application");
      }
    } catch (error) {
      console.error("Failed to create app:", error);
      toast.error("Failed to create application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/oauth">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create OAuth Application</h1>
          <p className="text-muted-foreground">Create a new OAuth application with basic access</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
          <CardDescription>
            Basic information about your OAuth application. This will have basic access (id, email, name, avatar only).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Application Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Application"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homepage">Homepage URL</Label>
              <Input
                id="homepage"
                type="url"
                value={formData.homepageUrl}
                onChange={(e) => setFormData({ ...formData, homepageUrl: e.target.value })}
                placeholder="https://myapp.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUris">Redirect URIs *</Label>
              <Textarea
                id="redirectUris"
                value={formData.redirectUris}
                onChange={(e) => setFormData({ ...formData, redirectUris: e.target.value })}
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
              <Select value={formData.appType} onValueChange={(value) => setFormData({ ...formData, appType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web Application</SelectItem>
                  <SelectItem value="mobile">Mobile Application</SelectItem>
                  <SelectItem value="desktop">Desktop Application</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Access Level: Basic</h4>
              <p className="text-xs text-muted-foreground">
                This application will only have access to basic user information: id, email, name, and avatar.
                For full access, contact an administrator.
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
