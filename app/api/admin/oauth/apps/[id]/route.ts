import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { applications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
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

    // Get the OAuth application
    const [app] = await db.select().from(applications).where(eq(applications.id, id));

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error('Get OAuth app error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const { name, homepageUrl, redirectUris, appType } = body;

    if (!name || !redirectUris || !appType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the OAuth application
    await db.update(applications)
      .set({
        name,
        homepageUrl,
        redirectUris,
        appType,
      })
      .where(eq(applications.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update OAuth app error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
