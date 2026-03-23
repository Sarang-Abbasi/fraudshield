import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const DATA_DIR = path.join(process.cwd(), "data");

  const users = fs.existsSync(path.join(DATA_DIR, "users.json"))
    ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, "users.json"), "utf-8"))
    : {};

  const sessions = fs.existsSync(path.join(DATA_DIR, "sessions.json"))
    ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, "sessions.json"), "utf-8"))
    : {};

  const snapshot = {
    exported_at: new Date().toISOString(),
    users,
    sessions,
  };

  // Strip password hashes before export
  if (snapshot.users?.users) {
    snapshot.users.users = snapshot.users.users.map(
      ({ passwordHash: _, ...u }: { passwordHash: string; [key: string]: unknown }) => u
    );
  }

  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fraudshield_export_${Date.now()}.json"`,
    },
  });
}
