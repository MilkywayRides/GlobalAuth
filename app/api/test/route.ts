import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "POST request received",
      receivedData: body
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to parse request"
    }, { status: 400 });
  }
}
