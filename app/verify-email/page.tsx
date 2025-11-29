"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailContent() {
  const [resending, setResending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session?.user?.emailVerified && !token) {
      router.replace("/dashboard");
    } else if (!isPending) {
      setCheckingSession(false);
    }
  }, [session?.user?.emailVerified, isPending, token, router]);

  useEffect(() => {
    if (token && !verifying && !verified && session?.user && !session.user.emailVerified) {
      handleVerifyToken(token);
    }
  }, [token, session, verifying, verified]);

  const handleVerifyToken = (verifyToken: string) => {
    setVerifying(true);
    window.location.href = `/api/verify?token=${verifyToken}`;
  };

  const handleResend = async () => {
    if (!session?.user?.email) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/send-verification", { method: "POST" });
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Verification email sent! Check your inbox.");
      } else if (response.status === 429) {
        toast.error("Please wait before requesting another email");
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch {
      toast.error("Failed to send email");
    } finally {
      setResending(false);
    }
  };

  if (checkingSession || verifying || isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {verifying ? "Verifying your email..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to verify your email</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>Redirecting to dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We sent a verification link to<br />
            <strong>{session.user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-primary" />
            Click the link in your email to verify your account
          </div>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={resending}
              className="text-sm"
            >
              {resending ? "Sending..." : "Didn't receive email? Resend"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
