import { NextResponse } from "next/server";
import { qrSessions } from "@/lib/qr-sessions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = qrSessions.get(id);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      session.status = 'expired';
      qrSessions.set(id, session);
    }

    return NextResponse.json({
      status: session.status,
      expiresAt: session.expiresAt,
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
    
    const session = qrSessions.get(id);
    
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
    }

    switch (action) {
      case 'scan':
        session.status = 'scanned';
        break;
      case 'confirm':
        session.status = 'confirmed';
        // Store userId for web session creation
        if (userId) {
          session.userId = userId;
          console.log('[QR Status] Stored userId:', userId);
        } else {
          console.warn('[QR Status] No userId provided in confirm action');
        }
        break;
      case 'reject':
        session.status = 'rejected';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    qrSessions.set(id, session);
    console.log('[QR Status] Updated session:', session);
    
    return NextResponse.json({ status: session.status });
  } catch (error) {
    console.error('Failed to update QR status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
