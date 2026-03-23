import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, insertUser, type StoredUser } from "@/lib/filedb";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

function generateAvatar(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || name.trim().length < 2)
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });

  const normalised = email?.toLowerCase().trim();
  if (!normalised?.includes("@") || !normalised?.includes("."))
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  if (!password || password.length < 6)
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  if (findUserByEmail(normalised))
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const user: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: normalised,
    createdAt: Date.now(),
    lastLogin: Date.now(),
    avatar: generateAvatar(name),
    passwordHash: simpleHash(password),
  };

  insertUser(user);

  // Return profile without passwordHash
  const { passwordHash: _, ...profile } = user;
  return NextResponse.json({ success: true, user: profile }, { status: 201 });
}
