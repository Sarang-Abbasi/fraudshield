/**
 * Client-side API store
 * All auth and session data now goes through real API routes
 * which read/write JSON files on disk.
 * sessionStorage is still used only to remember who is logged in
 * for the current browser session.
 */

const AUTH_USER_KEY = "fraudshield_auth_user";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: number;
  lastLogin: number;
}

export interface SessionSummary {
  totalAttempts: number;
  totalScore: number;
  lastActive: number | null;
}

// ─── Active user (sessionStorage — who is logged in right now) ────────────────

export function readActiveUser(): ActiveUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function writeActiveUser(user: ActiveUser): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearActiveUser(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_USER_KEY);
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export async function apiSignup(name: string, email: string, password: string): Promise<
  | { success: true; user: ActiveUser }
  | { success: false; error: string }
> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error ?? "Signup failed." };
  writeActiveUser(data.user);
  return { success: true, user: data.user };
}

export async function apiLogin(email: string, password: string): Promise<
  | { success: true; user: ActiveUser; sessionSummary: SessionSummary }
  | { success: false; error: string }
> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error ?? "Login failed." };
  writeActiveUser(data.user);
  return { success: true, user: data.user, sessionSummary: data.sessionSummary };
}

// ─── Session API calls ────────────────────────────────────────────────────────

export async function apiGetSession(userId: string) {
  const res = await fetch(`/api/session/${userId}`);
  const data = await res.json();
  return data.session ?? null;
}

export async function apiSaveSession(userId: string, sessionData: unknown): Promise<void> {
  await fetch(`/api/session/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData),
  });
}

// ─── Guest session (still in sessionStorage for guests) ───────────────────────

const GUEST_KEY = "fs_guest_session";

export function readGuestSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function writeGuestSession(data: unknown): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GUEST_KEY, JSON.stringify(data));
}

export function clearGuestSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GUEST_KEY);
}
