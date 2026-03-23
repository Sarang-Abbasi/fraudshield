/**
 * FraudShield JSON Storage Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates a flat-file JSON database using localStorage.
 * Each "table" is stored as a separate JSON key so it can be inspected,
 * exported, or swapped for a real REST API / database in future.
 *
 * Storage keys:
 *   fs_db_users        → UsersTable   { users: StoredUser[] }
 *   fs_db_sessions     → SessionsTable { [userId]: SessionData }
 *   fs_db_guest        → SessionData  (guest, no userId)
 *
 * All reads/writes go through this module — no direct localStorage calls
 * should exist elsewhere.
 */

import type { SessionData, AttemptLog, ModuleProgress } from "./session";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  createdAt: number;
  lastLogin: number;
}

export interface UsersTable {
  version: number;
  updatedAt: number;
  users: StoredUser[];
}

export interface SessionsTable {
  version: number;
  updatedAt: number;
  sessions: Record<string, SessionData>; // keyed by userId
}

// ─── Table keys ───────────────────────────────────────────────────────────────

const KEYS = {
  users: "fs_db_users",
  sessions: "fs_db_sessions",
  guest: "fs_db_guest",
  authUser: "fraudshield_auth_user", // sessionStorage — who's logged in right now
} as const;

const DB_VERSION = 1;

// ─── Low-level helpers ────────────────────────────────────────────────────────

function readLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function readSS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeSS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

// ─── Users table ──────────────────────────────────────────────────────────────

export function readUsersTable(): UsersTable {
  return readLS<UsersTable>(KEYS.users) ?? {
    version: DB_VERSION,
    updatedAt: Date.now(),
    users: [],
  };
}

export function writeUsersTable(table: UsersTable): void {
  writeLS(KEYS.users, { ...table, updatedAt: Date.now() });
}

export function findUserByEmail(email: string): StoredUser | null {
  const table = readUsersTable();
  return table.users.find((u) => u.email === email.toLowerCase().trim()) ?? null;
}

export function findUserById(id: string): StoredUser | null {
  const table = readUsersTable();
  return table.users.find((u) => u.id === id) ?? null;
}

export function insertUser(user: StoredUser): void {
  const table = readUsersTable();
  table.users.push(user);
  writeUsersTable(table);
}

export function updateUser(updated: StoredUser): void {
  const table = readUsersTable();
  const idx = table.users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) {
    table.users[idx] = updated;
    writeUsersTable(table);
  }
}

// ─── Sessions table ───────────────────────────────────────────────────────────

function readSessionsTable(): SessionsTable {
  return readLS<SessionsTable>(KEYS.sessions) ?? {
    version: DB_VERSION,
    updatedAt: Date.now(),
    sessions: {},
  };
}

function writeSessionsTable(table: SessionsTable): void {
  writeLS(KEYS.sessions, { ...table, updatedAt: Date.now() });
}

export function readUserSession(userId: string): SessionData | null {
  const table = readSessionsTable();
  return table.sessions[userId] ?? null;
}

export function writeUserSession(userId: string, data: SessionData): void {
  const table = readSessionsTable();
  table.sessions[userId] = data;
  writeSessionsTable(table);
}

export function deleteUserSession(userId: string): void {
  const table = readSessionsTable();
  delete table.sessions[userId];
  writeSessionsTable(table);
}

// ─── Guest session ────────────────────────────────────────────────────────────

export function readGuestSession(): SessionData | null {
  return readSS<SessionData>(KEYS.guest);
}

export function writeGuestSession(data: SessionData): void {
  writeSS(KEYS.guest, data);
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEYS.guest);
}

// ─── Auth session (who is logged in right now) ────────────────────────────────

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: number;
  lastLogin: number;
}

export function readActiveUser(): ActiveUser | null {
  return readSS<ActiveUser>(KEYS.authUser);
}

export function writeActiveUser(user: ActiveUser): void {
  writeSS(KEYS.authUser, user);
}

export function clearActiveUser(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEYS.authUser);
}

// ─── Debug / export helpers ───────────────────────────────────────────────────

/** Returns a full JSON snapshot of the entire database — useful for export/debug */
export function exportDatabase(): string {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      users: readUsersTable(),
      sessions: readSessionsTable(),
    },
    null,
    2
  );
}

/** Wipes all FraudShield data from localStorage (not sessionStorage) */
export function nukeDatabase(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.users);
  localStorage.removeItem(KEYS.sessions);
}
