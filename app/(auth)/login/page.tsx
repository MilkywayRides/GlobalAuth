"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoginForm } from "@/components/login-form";
import { QRLogin } from "@/components/qr-login";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isShutdown, setIsShutdown] = useState(false);
  const [checkingShutdown, setCheckingShutdown] = useState(true);

  useEffect(() => {
    checkShutdownStatus();
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      // Allow admin access even during shutdown
      if (session.user.role === 'admin' || !isShutdown) {
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router, isShutdown]);

  const checkShutdownStatus = async () => {
    try {
      const response = await fetch("/api/admin/emergency-shutdown");
      const data = await response.json();
      setIsShutdown(data.shutdown);
    } catch (error) {
      console.error("Failed to check shutdown status:", error);
    } finally {
      setCheckingShutdown(false);
    }
  };

  if (isPending || checkingShutdown) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (session) {
    return null;
  }

  // Show shutdown message for non-admin users
  if (isShutdown) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle>Service Temporarily Unavailable</CardTitle>
            <CardDescription>
              Authentication services are currently under maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                We're performing essential maintenance to improve your experience. 
                Please check back in a few minutes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Choose your preferred sign in method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <LoginForm />
            </TabsContent>
            <TabsContent value="qr">
              <QRLogin />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
