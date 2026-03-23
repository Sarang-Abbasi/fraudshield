import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateUser, getUserSession } from "@/lib/filedb";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const normalised = email?.toLowerCase().trim();
  const found = findUserByEmail(normalised);

  if (!found)
    return NextResponse.json({ error: "No account found with that email." }, { status: 401 });

  if (found.passwordHash !== simpleHash(password))
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });

  found.lastLogin = Date.now();
  updateUser(found);

  // Build session summary
  const saved = getUserSession(found.id);
  let sessionSummary = { totalAttempts: 0, totalScore: 0, lastActive: null as number | null };
  if (saved) {
    const attempts = (saved.attempts ?? []) as { timestamp: number }[];
    const totalScore = Object.values(saved.modules ?? {}).reduce(
      (s, m) => s + (((m as Record<string, number>).score) ?? 0), 0
    );
    const lastTimestamp = attempts.length > 0 ? Math.max(...attempts.map((a) => a.timestamp)) : null;
    sessionSummary = { totalAttempts: attempts.length, totalScore, lastActive: lastTimestamp };
  }

  const { passwordHash: _, ...profile } = found;
  return NextResponse.json({ success: true, user: profile, sessionSummary });
}
