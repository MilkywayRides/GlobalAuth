"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const checkVerification = async () => {
      if (!session?.user) {
        setCheckingSession(false);
        return;
      }
      
      if (session.user.emailVerified) {
        router.push("/dashboard");
        return;
      }
      
      setCheckingSession(false);
    };
    
    checkVerification();
  }, [session, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);

    try {
      await authClient.verifyEmail({ 
        query: { token: otp }
      });
      
      toast.success("Email verified successfully!");
      
      // Refresh session to get updated emailVerified status
      await authClient.getSession();
      
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!session?.user?.email) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setResending(true);
    try {
      const response = await fetch("/api/send-verification", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Verification email sent!");
      } else {
        toast.error(data.error || "Failed to send email");
      }
    } catch (error: any) {
      toast.error("Failed to send email");
    } finally {
      setResending(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to verify your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/login")} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
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
            We sent a 6-digit code to<br />
            <strong>{session.user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value.toUpperCase())}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || otp.length !== 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={resending}
                className="text-sm"
              >
                {resending ? "Sending..." : "Didn't receive code? Resend"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
