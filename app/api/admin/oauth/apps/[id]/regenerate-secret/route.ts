import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { applications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new client secret
    const newClientSecret = `bn_${crypto.randomBytes(32).toString("hex")}`;

    // Update the OAuth application with new secret
    await db.update(applications)
      .set({ clientSecret: newClientSecret })
      .where(eq(applications.id, id));

    return NextResponse.json({ clientSecret: newClientSecret });
  } catch (error) {
    console.error('Regenerate secret error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
