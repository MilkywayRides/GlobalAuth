import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { applications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('DELETE request for app ID:', id);

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('Session user:', session?.user?.email, 'Role:', session?.user?.role);

    if (!session?.user || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the OAuth application
    const result = await db.delete(applications).where(eq(applications.id, id));
    console.log('Delete result:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete OAuth app error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
