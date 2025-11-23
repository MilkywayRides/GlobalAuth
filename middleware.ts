import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Request logging queue for batch processing
const requestQueue: Array<{
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}> = [];

function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Batch process request logs every 5 seconds
if (typeof window === 'undefined') {
  setInterval(async () => {
    if (requestQueue.length > 0) {
      const batch = requestQueue.splice(0, 100); // Process in batches of 100
      try {
        // In a real app, you'd batch insert to database here
        console.log(`Processed ${batch.length} API requests`);
      } catch (error) {
        console.error('Failed to process request batch:', error);
      }
    }
  }, 5000);
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const response = NextResponse.next();
  
  // Add security and performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Development optimizations
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
    response.headers.set('X-Request-ID', crypto.randomUUID());
  }

  // Skip middleware for static files and health checks
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  try {
    // Rate limiting
    if (!rateLimit(ipAddress)) {
      const responseTime = Date.now() - startTime;
      
      // Log rate limited requests
      requestQueue.push({
        endpoint: pathname,
        method,
        statusCode: 429,
        responseTime,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });
      
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Redirect authenticated users from auth pages
    if (session?.user && ['/login', '/signup'].includes(pathname)) {
      if (session.user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Redirect authenticated users from root to their respective dashboards
    if (session?.user && pathname === "/") {
      if (session.user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Log all requests (queue for batch processing)
    const responseTime = Date.now() - startTime;
    requestQueue.push({
      endpoint: pathname,
      method,
      statusCode: response.status || 200,
      responseTime,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    
    const responseTime = Date.now() - startTime;
    
    // Log errors
    requestQueue.push({
      endpoint: pathname,
      method,
      statusCode: 500,
      responseTime,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
    
    // In case of auth error, redirect to login for protected routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
