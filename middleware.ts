import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Admin routes protection
  if (path.startsWith('/admin')) {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!session.user.emailVerified) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }

    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Dashboard routes - require email verification
  if (path.startsWith('/dashboard')) {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!session.user.emailVerified) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
