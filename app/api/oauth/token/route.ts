import { NextRequest, NextResponse } from 'next/server';
import { E2EEncryption } from '@/lib/encryption';
import { db } from '@/lib/db';
import { applications, oauthTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, client_id, redirect_uri } = body;

    console.log('Token request for client:', client_id);

    if (!code || !client_id || !redirect_uri) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate client_id exists in database
    const [app] = await db.select().from(applications).where(eq(applications.clientId, client_id));
    
    if (!app) {
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
    }

    // Validate redirect_uri is allowed for this application
    let allowedUris: string[] = [];
    if (typeof app.redirectUris === 'string') {
      allowedUris = (app.redirectUris as string).split('\n').map((uri: string) => uri.trim()).filter((uri: string) => uri.length > 0);
    } else if (Array.isArray(app.redirectUris)) {
      allowedUris = app.redirectUris as string[];
    } else {
      return NextResponse.json({ error: 'Invalid application configuration' }, { status: 500 });
    }
    
    if (!allowedUris.includes(redirect_uri)) {
      return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
    }

    // Decode user data from encrypted auth code
    try {
      const [authCode, encryptedData] = code.split('.');
      if (!encryptedData) {
        return NextResponse.json({ error: 'Invalid authorization code format' }, { status: 400 });
      }

      // Decrypt the user data using E2E encryption
      const userData = E2EEncryption.decryptOAuthData(encryptedData);
      
      // Validate that the client_id in the token matches the request
      if (userData.clientId !== client_id) {
        return NextResponse.json({ error: 'Client ID mismatch' }, { status: 400 });
      }

      console.log('Retrieved user data for:', userData.user?.email);
      
      // Check if app was created via admin endpoint (client ID starts with 'bn_') 
      // or user endpoint (client ID starts with 'usr_')
      const isAdminApp = app.clientId.startsWith('bn_');
      console.log('App client ID:', app.clientId);
      console.log('Is admin-created app:', isAdminApp);

      // Filter user data based on app creation source
      let filteredUser = userData.user;
      if (!isAdminApp) {
        // Basic access: only id, email, name, image
        filteredUser = {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.name,
          image: userData.user.image
        };
        console.log('Filtered to basic user data');
      } else {
        console.log('Full admin access granted');
      }

      // Generate secure access token
      const accessToken = 'access_' + Math.random().toString(36).substring(2, 15);
      
      // Store OAuth token for tracking authenticated users
      try {
        await db.insert(oauthTokens).values({
          accessToken: accessToken,
          clientId: client_id,
          userId: userData.user.id,
          scope: userData.scope,
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        });
        console.log('OAuth token stored for tracking');
      } catch (tokenError) {
        console.error('Failed to store OAuth token:', tokenError);
        // Continue anyway, don't fail the request
      }
      
      // Return token response with filtered user data
      const responseData = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: userData.scope,
        user: filteredUser,
        access_level: isAdminApp ? 'full' : 'basic'
      };

      return NextResponse.json(responseData, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      });

    } catch (decodeError) {
      console.error('Error decoding auth code:', decodeError);
      return NextResponse.json({ error: 'Invalid authorization code' }, { status: 400 });
    }

  } catch (error) {
    console.error('Token endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
