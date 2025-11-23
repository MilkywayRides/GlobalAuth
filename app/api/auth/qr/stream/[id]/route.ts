import { qrSessions } from "@/lib/qr-sessions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const session = qrSessions.get(id);
  if (!session) {
    return new Response('Session not found', { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendUpdate = () => {
        const currentSession = qrSessions.get(id);
        if (!currentSession) {
          controller.close();
          return;
        }

        // Check expiry
        if (currentSession.expiresAt < Date.now()) {
          currentSession.status = 'expired';
          qrSessions.set(id, currentSession);
        }

        const data = JSON.stringify({
          status: currentSession.status,
          expiresAt: currentSession.expiresAt,
        });

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        // Close stream if session is complete
        if (['confirmed', 'rejected', 'expired'].includes(currentSession.status)) {
          controller.close();
        }
      };

      // Send initial status
      sendUpdate();

      // Send updates every 2 seconds
      const interval = setInterval(sendUpdate, 2000);

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
