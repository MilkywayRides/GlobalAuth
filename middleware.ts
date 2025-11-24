import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { checkEmergencyShutdown } from '@/lib/emergency-shutdown';

// Initialize rate limiter (only in production)
const redis = process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ratelimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
}) : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check emergency shutdown first
  const shutdownResponse = await checkEmergencyShutdown(request);
  if (shutdownResponse) {
    return shutdownResponse;
  }

  // Rate limiting for API routes in production
  if (pathname.startsWith('/api/') && ratelimit) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      });
    }
  }

  // Security headers
  const response = NextResponse.next();
  
  // CORS headers for mobile app
  if (pathname.startsWith('/api/auth/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    );
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
