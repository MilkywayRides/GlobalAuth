import { NextRequest, NextResponse } from 'next/server';
import { E2EEncryption } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, client_id, redirect_uri } = body;

    console.log('Token request for code:', code?.substring(0, 20) + '...');

    if (!code || !client_id || !redirect_uri) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Decode user data from encrypted auth code
    try {
      const [authCode, encryptedData] = code.split('.');
      if (!encryptedData) {
        return NextResponse.json({ error: 'Invalid authorization code format' }, { status: 400 });
      }

      // Decrypt the user data using E2E encryption
      const userData = E2EEncryption.decryptOAuthData(encryptedData);
      console.log('Retrieved user data for:', userData.user?.email);

      // Generate secure access token
      const accessToken = 'access_' + Math.random().toString(36).substring(2, 15);
      
      // Return token response with encrypted user data
      const responseData = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: userData.scope,
        user: userData.user
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
