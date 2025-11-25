import { NextRequest, NextResponse } from 'next/server';
import { storeAuthCode } from '@/lib/auth-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, user, scope, clientId } = body;

    console.log('Storing auth code:', code, 'for user:', user?.email);

    if (!code || !user) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Store the auth code with user data
    storeAuthCode(code, { user, scope, clientId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Store code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
