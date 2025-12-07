import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const responseType = searchParams.get('response_type')
  const scope = searchParams.get('scope')
  const signup = searchParams.get('signup')

  // Validate OAuth parameters
  if (!clientId || !redirectUri || responseType !== 'code') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  // Check if user is authenticated
  const session = await auth.api.getSession({ headers: request.headers })
  
  if (!session?.user) {
    // User not logged in - redirect to signup or login
    const authUrl = new URL(signup === 'true' ? '/signup' : '/login', request.url)
    authUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(authUrl)
  }

  // Check if user exists in database
  const [userRecord] = await db.select().from(user).where(eq(user.id, session.user.id))
  
  if (!userRecord) {
    // User not registered - redirect to signup
    const signupUrl = new URL('/signup', request.url)
    signupUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signupUrl)
  }

  // Generate authorization code
  const code = Math.random().toString(36).substring(2, 15)
  
  // Store code temporarily (you might want to use Redis or database)
  // For now, we'll redirect with the code
  const callback = new URL(redirectUri)
  callback.searchParams.set('code', code)
  callback.searchParams.set('state', searchParams.get('state') || '')
  
  return NextResponse.redirect(callback.toString())
}
