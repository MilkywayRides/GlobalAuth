import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { qrSession } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const [session] = await db
      .select()
      .from(qrSession)
      .where(eq(qrSession.id, id))
      .limit(1);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.expiresAt < new Date()) {
      await db
        .update(qrSession)
        .set({ status: 'expired' })
        .where(eq(qrSession.id, id));
      
      return NextResponse.json({
        status: 'expired',
        expiresAt: session.expiresAt.getTime(),
      });
    }

    return NextResponse.json({
      status: session.status,
      expiresAt: session.expiresAt.getTime(),
    });
  } catch (error) {
    console.error('Failed to check QR status:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, userId } = body;
    
    console.log('[QR Status] Session ID:', id, 'Action:', action, 'UserId:', userId);
    
    const [session] = await db
      .select()
      .from(qrSession)
      .where(eq(qrSession.id, id))
      .limit(1);
    
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
    }

    let newStatus = session.status;
    let newUserId = session.userId;

    switch (action) {
      case 'scan':
        newStatus = 'scanned';
        break;
      case 'confirm':
        newStatus = 'confirmed';
        if (userId) {
          newUserId = userId;
          console.log('[QR Status] Stored userId:', userId);
        } else {
          console.warn('[QR Status] No userId provided in confirm action');
        }
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await db
      .update(qrSession)
      .set({ status: newStatus, userId: newUserId })
      .where(eq(qrSession.id, id));
    
    console.log('[QR Status] Updated session to:', newStatus);
    
    return NextResponse.json({ status: newStatus });
  } catch (error) {
    console.error('Failed to update QR status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
