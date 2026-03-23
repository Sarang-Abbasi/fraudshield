/**
 * Server-side file database
 * Reads and writes real JSON files in /data/ on disk.
 * Only imported by Next.js API routes (server-side) — never in client components.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(name: "users" | "sessions"): string {
  return path.join(DATA_DIR, `${name}.json`);
}

function readFile<T>(name: "users" | "sessions"): T {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) {
    const empty = name === "users"
      ? { version: 1, updatedAt: 0, users: [] }
      : { version: 1, updatedAt: 0, sessions: {} };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(fp, JSON.stringify(empty, null, 2));
    return empty as T;
  }
  return JSON.parse(fs.readFileSync(fp, "utf-8")) as T;
}

function writeFile<T>(name: "users" | "sessions", data: T): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify({ ...(data as object), updatedAt: Date.now() }, null, 2));
}

// ─── Users ─────────────────────────────────────────────────────────────────

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  createdAt: number;
  lastLogin: number;
}

interface UsersFile {
  version: number;
  updatedAt: number;
  users: StoredUser[];
}

export function getAllUsers(): StoredUser[] {
  return readFile<UsersFile>("users").users;
}

export function findUserByEmail(email: string): StoredUser | null {
  return getAllUsers().find((u) => u.email === email.toLowerCase().trim()) ?? null;
}

export function findUserById(id: string): StoredUser | null {
  return getAllUsers().find((u) => u.id === id) ?? null;
}

export function insertUser(user: StoredUser): void {
  const file = readFile<UsersFile>("users");
  file.users.push(user);
  writeFile("users", file);
}

export function updateUser(updated: StoredUser): void {
  const file = readFile<UsersFile>("users");
  const idx = file.users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) file.users[idx] = updated;
  writeFile("users", file);
}

// ─── Sessions ──────────────────────────────────────────────────────────────

export interface SessionData {
  startTime: number;
  attempts: unknown[];
  modules: Record<string, unknown>;
}

interface SessionsFile {
  version: number;
  updatedAt: number;
  sessions: Record<string, SessionData>;
}

export function getUserSession(userId: string): SessionData | null {
  const file = readFile<SessionsFile>("sessions");
  return file.sessions[userId] ?? null;
}

export function setUserSession(userId: string, data: SessionData): void {
  const file = readFile<SessionsFile>("sessions");
  file.sessions[userId] = data;
  writeFile("sessions", file);
}

export function deleteUserSession(userId: string): void {
  const file = readFile<SessionsFile>("sessions");
  delete file.sessions[userId];
  writeFile("sessions", file);
}
