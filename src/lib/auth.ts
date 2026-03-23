import {
  readActiveUser,
  writeActiveUser,
  clearActiveUser,
  apiSignup,
  apiLogin,
  type ActiveUser,
  type SessionSummary,
} from "./apiStore";

export type { ActiveUser as UserProfile, SessionSummary };

export type SignupResult =
  | { success: true; user: ActiveUser }
  | { success: false; error: string };

export async function signup(name: string, email: string, password: string): Promise<SignupResult> {
  return apiSignup(name, email, password);
}

export type LoginResult =
  | { success: true; user: ActiveUser; sessionSummary: SessionSummary }
  | { success: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  return apiLogin(email, password);
}

export function logout(): void {
  clearActiveUser();
}

export function getCurrentUser(): ActiveUser | null {
  return readActiveUser();
}
