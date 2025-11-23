import { db } from "@/lib/db";
import { apiUsage } from "@/lib/db/schema";
import { nanoid } from "nanoid";

interface LogApiRequestParams {
  keyId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export async function logApiRequest(params: LogApiRequestParams) {
  try {
    await db.insert(apiUsage).values({
      id: nanoid(),
      keyId: params.keyId || 'system',
      endpoint: params.endpoint,
      method: params.method,
      statusCode: params.statusCode,
      responseTime: params.responseTime,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log API request:', error);
  }
}

export function withApiLogging(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const startTime = Date.now();
    const url = new URL(req.url);
    const endpoint = url.pathname;
    const method = req.method;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    try {
      const response = await handler(req, ...args);
      const responseTime = Date.now() - startTime;
      
      // Log the request asynchronously
      setImmediate(() => {
        logApiRequest({
          endpoint,
          method,
          statusCode: response.status || 200,
          responseTime,
          ipAddress,
          userAgent,
        });
      });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed requests too
      setImmediate(() => {
        logApiRequest({
          endpoint,
          method,
          statusCode: 500,
          responseTime,
          ipAddress,
          userAgent,
        });
      });
      
      throw error;
    }
  };
}
