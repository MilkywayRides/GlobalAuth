"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ConsentFormProps {
    app: {
        name: string;
        homepageUrl: string | null;
        appType: string;
    };
    user: {
        name: string;
        email: string;
        image: string | null;
    };
}

export function ConsentForm({ app, user }: ConsentFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const handleDecision = async (decision: "allow" | "deny") => {
        setLoading(true);
        try {
            const res = await fetch("/api/oauth/authorize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_id: searchParams.get("client_id"),
                    redirect_uri: searchParams.get("redirect_uri"),
                    state: searchParams.get("state"),
                    decision,
                }),
            });

            const data = await res.json();
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                console.error("No redirect URL returned");
            }
        } catch (error) {
            console.error("Consent error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAppTypeColor = (type: string) => {
        switch (type) {
            case "web": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
            case "native": return "bg-green-500/10 text-green-700 dark:text-green-400";
            case "spa": return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
            case "service": return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
            default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
        }
    };

    return (
        <Card className="w-full max-w-lg mx-auto border-2 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
                <div className="mx-auto bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl w-fit shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold">Authorization Request</CardTitle>
                    <CardDescription className="text-base">
                        <span className="font-semibold text-foreground">{app.name}</span> is requesting access to your account
                    </CardDescription>
                </div>
                <Badge variant="secondary" className={getAppTypeColor(app.appType)}>
                    {app.appType.charAt(0).toUpperCase() + app.appType.slice(1)} Application
                </Badge>
            </CardHeader>

            <Separator />

            <CardContent className="space-y-6 pt-6">
                {/* User to App Connection */}
                <div className="flex items-center justify-between gap-4 p-5 bg-muted/50 rounded-xl border">
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <Avatar className="w-14 h-14 border-2 border-primary/20">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />

                    <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-md">
                            <span className="text-2xl font-bold text-white">{app.name[0]}</span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold">{app.name}</p>
                            {app.homepageUrl && (
                                <a
                                    href={app.homepageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    Visit site
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        This will allow {app.name} to:
                    </h4>
                    <div className="space-y-2 bg-muted/30 p-4 rounded-lg border">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Access your profile information</p>
                                <p className="text-xs text-muted-foreground">Name, email address, and profile picture</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">View your account role</p>
                                <p className="text-xs text-muted-foreground">User or administrator status</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs text-blue-900 dark:text-blue-300">
                        <strong>Note:</strong> You can revoke access at any time from your account settings.
                    </p>
                </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col gap-3 pt-6">
                <Button
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handleDecision("allow")}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Authorize"}
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-11 text-base"
                    onClick={() => handleDecision("deny")}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </CardFooter>
        </Card>
    );
}
