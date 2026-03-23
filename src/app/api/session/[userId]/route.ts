import { NextRequest, NextResponse } from "next/server";
import { getUserSession, setUserSession, type SessionData } from "@/lib/filedb";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = getUserSession(params.userId);
  if (!session) return NextResponse.json({ session: null });
  return NextResponse.json({ session });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const data: SessionData = await req.json();
  setUserSession(params.userId, data);
  return NextResponse.json({ success: true });
}
