import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { qrSessions } from "@/lib/qr-sessions";

export async function POST(req: Request) {
  try {
    const sessionId = nanoid(32);
    const token = nanoid(64);
    const now = Date.now();
    const expiresAt = now + (5 * 60 * 1000);

    const session = {
      id: sessionId,
      token,
      status: 'pending' as const,
      createdAt: now,
      expiresAt,
    };

    qrSessions.set(sessionId, session);

    // Create QR data for mobile app
    const qrData = {
      type: 'blazeneuro_login',
      sessionId,
      token,
      domain: req.headers.get('host') || 'localhost:3000',
      timestamp: now,
    };

    // Generate real QR code
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
      expiresAt,
    });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
