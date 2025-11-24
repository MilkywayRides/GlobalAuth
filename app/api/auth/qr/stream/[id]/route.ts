import { db } from "@/lib/db";
import { qrSession } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  console.log('[QR Stream] Connecting to session:', id);
  
  const [session] = await db
    .select()
    .from(qrSession)
    .where(eq(qrSession.id, id))
    .limit(1);
    
  if (!session) {
    console.error('[QR Stream] Session not found:', id);
    return new Response('Session not found', { status: 404 });
  }
  
  console.log('[QR Stream] Session found:', session.status);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;
      let interval: NodeJS.Timeout | null = null;
      
      const cleanup = () => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch (e) {
            // Already closed
          }
        }
      };
      
      const sendUpdate = async () => {
        if (isClosed) return;
        
        try {
          const [currentSession] = await db
            .select()
            .from(qrSession)
            .where(eq(qrSession.id, id))
            .limit(1);
            
          if (!currentSession) {
            cleanup();
            return;
          }

          if (currentSession.expiresAt < new Date()) {
            await db
              .update(qrSession)
              .set({ status: 'expired' })
              .where(eq(qrSession.id, id));
            currentSession.status = 'expired';
          }

          const data = JSON.stringify({
            status: currentSession.status,
            expiresAt: currentSession.expiresAt.getTime(),
          });

          try {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (e) {
            cleanup();
            return;
          }

          if (['confirmed', 'rejected', 'expired'].includes(currentSession.status)) {
            cleanup();
          }
        } catch (error) {
          console.error('[QR Stream] Error:', error);
          cleanup();
        }
      };

      await sendUpdate();
      interval = setInterval(sendUpdate, 3000);

      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
