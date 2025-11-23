"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Eye, Edit, Database, CheckCircle, XCircle } from "lucide-react";

interface OAuthConsentFormProps {
  application: {
    id: string;
    name: string;
    description?: string;
    homepageUrl?: string;
  };
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  scopes: string[];
  redirectUri: string;
  state?: string;
}

const scopeDescriptions = {
  read: "View your basic profile information",
  write: "Modify your profile information",
  email: "Access your email address",
  profile: "Access your full profile",
  admin: "Administrative access (if you're an admin)",
};

const scopeIcons = {
  read: Eye,
  write: Edit,
  email: User,
  profile: User,
  admin: Shield,
};

export function OAuthConsentForm({ application, user, scopes, redirectUri, state }: OAuthConsentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthorize = async (approved: boolean) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: application.id,
          redirect_uri: redirectUri,
          scope: scopes.join(" "),
          state,
          approved,
        }),
      });

      const data = await response.json();

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        console.error("Authorization failed:", data.error);
      }
    } catch (error) {
      console.error("Authorization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-xl">Authorize Application</CardTitle>
        <CardDescription>
          <strong>{application.name}</strong> wants to access your BlazeNeuro account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Application Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Application Details</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Name:</strong> {application.name}</p>
            {application.description && (
              <p><strong>Description:</strong> {application.description}</p>
            )}
            {application.homepageUrl && (
              <p><strong>Website:</strong> 
                <a href={application.homepageUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  {application.homepageUrl}
                </a>
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* User Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Account</h3>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user.name || user.email}</span>
          </div>
        </div>

        <Separator />

        {/* Permissions */}
        <div className="space-y-3">
          <h3 className="font-medium">This application will be able to:</h3>
          <div className="space-y-2">
            {scopes.map((scope) => {
              const Icon = scopeIcons[scope as keyof typeof scopeIcons] || Database;
              const description = scopeDescriptions[scope as keyof typeof scopeDescriptions] || `Access ${scope} permissions`;
              
              return (
                <div key={scope} className="flex items-start space-x-3">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleAuthorize(false)}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Deny
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleAuthorize(true)}
            disabled={isLoading}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isLoading ? "Authorizing..." : "Authorize"}
          </Button>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center">
          <p>By authorizing, you allow this application to access your account with the permissions listed above. You can revoke access at any time in your account settings.</p>
        </div>
      </CardContent>
    </Card>
  );
}
