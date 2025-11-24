"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Smartphone, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface QRSession {
  id: string;
  qrCode: string;
  status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'rejected';
  expiresAt: number;
}

export function QRLogin() {
  const [qrSession, setQrSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const eventSourceRef = useRef<EventSource | undefined>(undefined);
  const isConnectedRef = useRef(false);
  const router = useRouter();

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = undefined;
    }
    isConnectedRef.current = false;
  }, []);

  useEffect(() => {
    checkAuth();
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (!isAuthenticated && !qrSession && !loading) {
      generateQR();
    }
  }, [isAuthenticated, qrSession, loading]);

  useEffect(() => {
    if (qrSession && !isAuthenticated && !isConnectedRef.current) {
      startCountdown();
      startSSE(qrSession.id);
    }
  }, [qrSession, isAuthenticated]);

  const checkAuth = async () => {
    try {
      const { data } = await authClient.getSession();
      setIsAuthenticated(!!data?.user);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const generateQR = async () => {
    if (isAuthenticated || loading) return;
    
    cleanup();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/qr/generate', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrSession(data);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    if (!qrSession || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, qrSession.expiresAt - now);
      setTimeLeft(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        setQrSession(prev => prev ? { ...prev, status: 'expired' } : null);
        cleanup();
      }
    }, 1000);
  };

  const startSSE = (sessionId: string) => {
    if (isConnectedRef.current || !sessionId) return;

    try {
      isConnectedRef.current = true;
      eventSourceRef.current = new EventSource(`/api/auth/qr/stream/${sessionId}`);
      
      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setQrSession(prev => prev ? { ...prev, status: data.status } : null);
          
          if (data.status === 'confirmed') {
            cleanup();
            setTimeout(async () => {
              await checkAuth();
              router.push('/dashboard');
            }, 1500);
          } else if (['rejected', 'expired'].includes(data.status)) {
            cleanup();
          }
        } catch (error) {
          console.error('Failed to parse SSE data:', error);
        }
      };

      eventSourceRef.current.onerror = () => {
        cleanup();
      };
    } catch (error) {
      console.error('Failed to start SSE:', error);
      isConnectedRef.current = false;
    }
  };

  const simulateAction = async (action: string) => {
    if (!qrSession) return;
    
    try {
      const response = await fetch(`/api/auth/qr/status/${qrSession.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setQrSession(prev => prev ? { ...prev, status: data.status } : null);
      }
    } catch (error) {
      console.error('Failed to simulate action:', error);
    }
  };

  const getStatusInfo = () => {
    switch (qrSession?.status) {
      case 'pending':
        return {
          icon: <QrCode className="h-5 w-5 text-blue-500" />,
          text: "Scan QR Code",
          description: "Open BlazeNeuro app and scan this code",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        };
      case 'scanned':
        return {
          icon: <Smartphone className="h-5 w-5 text-orange-500" />,
          text: "Confirm on Device",
          description: "Tap 'Log In' on your mobile device",
          color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: "Login Successful",
          description: "Redirecting to dashboard...",
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          text: "Login Rejected",
          description: "Login was cancelled on device",
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        };
      case 'expired':
        return {
          icon: <XCircle className="h-5 w-5 text-gray-500" />,
          text: "QR Code Expired",
          description: "Generate a new code to continue",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        };
      default:
        return {
          icon: <QrCode className="h-5 w-5" />,
          text: "Loading...",
          description: "Generating QR code...",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        };
    }
  };

  if (isAuthenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-48 h-48 rounded-lg flex items-center justify-center bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Already Authenticated</span>
              </div>
            </Badge>
            <p className="text-sm text-muted-foreground text-center">
              You are already logged in to your account
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Login
          </CardTitle>
          <CardDescription>
            Scan with your mobile device for secure login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {qrSession?.qrCode && qrSession.status !== 'expired' ? (
                <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <img 
                    src={qrSession.qrCode} 
                    alt="QR Code" 
                    className="w-48 h-48"
                  />
                  {qrSession.status === 'confirmed' && (
                    <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-green-500 animate-bounce" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  {loading ? (
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <QrCode className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              )}
            </div>

            <Badge variant="secondary" className={statusInfo.color}>
              <div className="flex items-center gap-2">
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </div>
            </Badge>

            <p className="text-sm text-muted-foreground text-center">
              {statusInfo.description}
            </p>

            {qrSession && timeLeft > 0 && qrSession.status !== 'confirmed' && (
              <div className="text-xs text-muted-foreground">
                Expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}

            {(qrSession?.status === 'expired' || qrSession?.status === 'rejected' || !qrSession) && (
              <Button 
                onClick={generateQR} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Generate New QR Code
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {qrSession && (qrSession.status === 'pending' || qrSession.status === 'scanned') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Controls</CardTitle>
            <CardDescription className="text-xs">
              Simulate mobile app actions for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => simulateAction('scan')}>
                Scan
              </Button>
              <Button size="sm" variant="outline" onClick={() => simulateAction('confirm')}>
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => simulateAction('reject')}>
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
