import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');

  // Validate required parameters
  if (!clientId || !redirectUri || !scope || !state) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // Store authorization request in session/database (simplified for demo)
  const authRequest = {
    clientId,
    redirectUri,
    scope,
    state,
  };

  // Redirect to authorization page with parameters
  const authPageUrl = new URL('/oauth/authorize', request.url);
  authPageUrl.searchParams.set('client_id', clientId);
  authPageUrl.searchParams.set('redirect_uri', redirectUri);
  authPageUrl.searchParams.set('scope', scope);
  authPageUrl.searchParams.set('state', state);

  return NextResponse.redirect(authPageUrl);
}
