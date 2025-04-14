import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ status: "ok", message: "Test API endpoint is working" });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ status: "ok", message: "Test POST endpoint is working" });
} 