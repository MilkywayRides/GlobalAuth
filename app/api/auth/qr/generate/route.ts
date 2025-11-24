import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { qrSession } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const sessionId = nanoid(32);
    const token = nanoid(64);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    await db.insert(qrSession).values({
      id: sessionId,
      token,
      status: 'pending',
      createdAt: now,
      expiresAt,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent'),
    });

    console.log('[QR Generate] Created session:', sessionId);

    const qrData = {
      type: 'blazeneuro_login',
      sessionId,
      token,
      domain: req.headers.get('host') || 'localhost:3000',
      timestamp: now.getTime(),
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      id: sessionId,
      qrCode: qrCodeDataURL,
      status: 'pending',
      expiresAt: expiresAt.getTime(),
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
