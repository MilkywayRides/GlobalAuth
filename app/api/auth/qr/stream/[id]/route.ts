import { qrSessions } from "@/lib/qr-sessions";

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

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
      
      const sendUpdate = () => {
        const currentSession = qrSessions.get(id);
        if (!currentSession) {
          controller.close();
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

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        if (['confirmed', 'rejected', 'expired'].includes(currentSession.status)) {
          controller.close();
        }
      };

      sendUpdate();
      const interval = setInterval(sendUpdate, 5000); // Increased to 5 seconds

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
