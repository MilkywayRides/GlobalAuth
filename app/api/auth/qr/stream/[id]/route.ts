import { qrSessions } from "@/lib/qr-sessions";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false;
  }
  
  limit.count++;
  return true;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  const session = qrSessions.get(id);
  if (!session) {
    return new Response('Session not found', { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
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
      
      const sendUpdate = () => {
        if (isClosed) return;
        
        const currentSession = qrSessions.get(id);
        if (!currentSession) {
          cleanup();
          return;
        }

        if (currentSession.expiresAt < Date.now()) {
          currentSession.status = 'expired';
          qrSessions.set(id, currentSession);
        }

        const data = JSON.stringify({
          status: currentSession.status,
          expiresAt: currentSession.expiresAt,
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
      };

      sendUpdate();
      interval = setInterval(sendUpdate, 5000);

      req.signal.addEventListener('abort', cleanup);
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
