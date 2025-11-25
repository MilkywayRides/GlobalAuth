import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');

  console.log('OAuth authorize request:', { clientId, redirectUri, scope, state });

  // Validate required parameters
  if (!clientId || !redirectUri || !scope || !state) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    // Validate client_id exists in database
    console.log('Looking up client ID:', clientId);
    const [app] = await db.select().from(applications).where(eq(applications.clientId, clientId));
    
    if (!app) {
      console.log('Client ID not found:', clientId);
      return NextResponse.json({ error: 'Invalid client_id' }, { status: 400 });
    }

    console.log('Found application:', app.name);

    // Validate redirect_uri is allowed for this application
    console.log('Raw redirectUris:', app.redirectUris, 'Type:', typeof app.redirectUris);
    
    let allowedUris: string[] = [];
    if (typeof app.redirectUris === 'string') {
      allowedUris = (app.redirectUris as string).split('\n').map((uri: string) => uri.trim()).filter((uri: string) => uri.length > 0);
    } else if (Array.isArray(app.redirectUris)) {
      allowedUris = app.redirectUris as string[];
    } else {
      console.log('Invalid redirectUris format');
      return NextResponse.json({ error: 'Invalid application configuration' }, { status: 500 });
    }
    
    console.log('Allowed URIs:', allowedUris);
    console.log('Requested URI:', redirectUri);
    
    if (!allowedUris.includes(redirectUri)) {
      console.log('Redirect URI not allowed');
      return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });
    }

    // Redirect to authorization page with parameters
    const authPageUrl = new URL('/oauth/authorize', request.url);
    authPageUrl.searchParams.set('client_id', clientId);
    authPageUrl.searchParams.set('redirect_uri', redirectUri);
    authPageUrl.searchParams.set('scope', scope);
    authPageUrl.searchParams.set('state', state);
    authPageUrl.searchParams.set('app_name', app.name);

    console.log('Redirecting to:', authPageUrl.toString());
    return NextResponse.redirect(authPageUrl);
  } catch (error) {
    console.error('OAuth authorize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
