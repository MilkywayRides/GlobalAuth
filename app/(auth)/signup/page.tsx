"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { SignupForm } from "@/components/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function SignupPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isShutdown, setIsShutdown] = useState(false);
  const [checkingShutdown, setCheckingShutdown] = useState(true);

  useEffect(() => {
    checkShutdownStatus();
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      // Redirect to verify-email if not verified, otherwise dashboard
      if (session.user.emailVerified) {
        router.push("/dashboard");
      } else {
        router.push("/verify-email");
      }
    }
  }, [session, isPending, router]);

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

  // Show shutdown message - signup is always blocked during shutdown
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
              New account registration is currently disabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                We're performing essential maintenance. 
                Please try creating your account later.
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
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
