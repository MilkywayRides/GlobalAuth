import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';

export async function GET() {
  try {
    // Check database connection
    await db.execute('SELECT 1');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'BlazeNeuro Developer Portal',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'BlazeNeuro Developer Portal',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
