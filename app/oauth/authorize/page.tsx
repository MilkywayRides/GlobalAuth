"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2 } from 'lucide-react';

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { data: session, isPending } = authClient.useSession();

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const appName = searchParams.get('app_name');

  const scopes = scope?.split(',') || [];

  useEffect(() => {
    if (!isPending) {
      setIsCheckingAuth(false);
    }
  }, [isPending]);

  const handleLogin = () => {
    authClient.signIn.social({ provider: "google" });
  };

  const handleAuthorize = async () => {
    if (!session) return;
    
    setIsLoading(true);
    
    const authCode = 'auth_' + Math.random().toString(36).substring(2, 15);
    
    const userData = {
      user: session.user,
      scope: scope,
      clientId: clientId
    };
    
    const { E2EEncryption } = await import('@/lib/encryption');
    const encryptedData = E2EEncryption.encryptOAuthData(userData);
    const fullAuthCode = authCode + '.' + encryptedData;
    
    const callbackUrl = new URL(redirectUri!);
    callbackUrl.searchParams.set('code', fullAuthCode);
    callbackUrl.searchParams.set('state', state!);
    
    window.location.href = callbackUrl.toString();
  };

  const handleDeny = () => {
    const callbackUrl = new URL(redirectUri!);
    callbackUrl.searchParams.set('error', 'access_denied');
    callbackUrl.searchParams.set('state', state!);
    
    window.location.href = callbackUrl.toString();
  };

  const getScopeDescription = (scopeItem: string) => {
    switch (scopeItem) {
      case 'profile':
        return 'Access your basic profile information';
      case 'email':
        return 'Access your email address';
      default:
        return `Access your ${scopeItem}`;
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <span className="text-2xl font-bold text-white">BN</span>
            </div>
            <CardTitle className="text-2xl">BlazeNeuro</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
            <span className="text-2xl font-bold text-white">BN</span>
          </div>
          <CardTitle className="text-2xl">{appName || 'Application'}</CardTitle>
          <CardDescription>wants to access your account</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3 rounded-lg bg-muted p-3">
            <Avatar>
              <AvatarImage 
                src={session.user.image || undefined} 
                alt={session.user.name || 'User'} 
              />
              <AvatarFallback>
                {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-sm mb-3">This app will be able to:</h3>
            <div className="space-y-2">
              {scopes.map((scopeItem) => (
                <div key={scopeItem} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">
                    {getScopeDescription(scopeItem)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleDeny} 
              disabled={isLoading}
              className="flex-1"
            >
              Deny
            </Button>
            <Button 
              onClick={handleAuthorize} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authorizing...
                </>
              ) : (
                'Authorize'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthorizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    }>
      <AuthorizeContent />
    </Suspense>
  );
}
