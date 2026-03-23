import {
  readActiveUser,
  apiGetSession,
  apiSaveSession,
  readGuestSession,
  writeGuestSession,
  clearGuestSession,
} from "./apiStore";

export interface AttemptLog {
  scenario_id: string;
  module: "real_or_fraud" | "recognition" | "chat" | "adaptive";
  timestamp: number;
  user_choice: string;
  correct: boolean;
  score_delta: number;
  time_taken_seconds: number;
  tags: string[];
  confidence_score?: number;
}

export interface ModuleProgress {
  completed: number;
  total: number;
  score: number;
  maxScore: number;
}

export interface SessionData {
  startTime: number;
  attempts: AttemptLog[];
  modules: {
    real_or_fraud: ModuleProgress;
    recognition: ModuleProgress;
    chat: ModuleProgress;
    adaptive: ModuleProgress;
  };
}

// In-memory cache so we don't hit the API on every keystroke
let _cache: SessionData | null = null;
let _cacheUserId: string | null = null;

function getActiveUserId(): string | null {
  return readActiveUser()?.id ?? null;
}

export function createEmptySession(): SessionData {
  return {
    startTime: Date.now(),
    attempts: [],
    modules: {
      real_or_fraud: { completed: 0, total: 6, score: 0, maxScore: 600 },
      recognition: { completed: 0, total: 3, score: 0, maxScore: 300 },
      chat: { completed: 0, total: 2, score: 0, maxScore: 200 },
      adaptive: { completed: 0, total: 999, score: 0, maxScore: 99900 },
    },
  };
}

// Synchronous read from cache (used during render)
export function getSession(): SessionData {
  const userId = getActiveUserId();
  if (userId) {
    if (_cache && _cacheUserId === userId) return _cache;
    // Cache miss — return empty and let initSession() fill it async
    return createEmptySession();
  }
  return (readGuestSession() as SessionData) ?? createEmptySession();
}

// Call this once on page mount to load from disk
export async function initSession(): Promise<SessionData> {
  const userId = getActiveUserId();
  if (userId) {
    const data = await apiGetSession(userId);
    const session = (data as SessionData) ?? createEmptySession();
    _cache = session;
    _cacheUserId = userId;
    return session;
  }
  return (readGuestSession() as SessionData) ?? createEmptySession();
}

export function saveSession(data: SessionData): void {
  const userId = getActiveUserId();
  if (userId) {
    _cache = data;
    _cacheUserId = userId;
    // Fire and forget — non-blocking write to disk
    apiSaveSession(userId, data).catch(console.error);
  } else {
    writeGuestSession(data);
  }
}

export function clearSession(): void {
  const userId = getActiveUserId();
  _cache = null;
  _cacheUserId = null;
  if (userId) {
    apiSaveSession(userId, createEmptySession()).catch(console.error);
  } else {
    clearGuestSession();
  }
}

export function logAttempt(attempt: AttemptLog): void {
  const session = getSession();
  session.attempts.push(attempt);
  const mod = session.modules[attempt.module];
  if (mod) {
    if (attempt.module === "adaptive") {
      mod.completed += 1;
      mod.score += attempt.score_delta;
    } else {
      mod.completed = Math.min(mod.completed + 1, mod.total);
      mod.score = Math.min(mod.score + attempt.score_delta, mod.maxScore);
    }
  }
  saveSession(session);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function computeRiskProfile(
  attempts: AttemptLog[]
): Record<string, { correct: number; total: number; risk: "High" | "Medium" | "Low" }> {
  const tagStats: Record<string, { correct: number; total: number }> = {};
  for (const attempt of attempts) {
    for (const tag of attempt.tags) {
      if (!tagStats[tag]) tagStats[tag] = { correct: 0, total: 0 };
      tagStats[tag].total++;
      if (attempt.correct) tagStats[tag].correct++;
    }
  }
  const result: Record<string, { correct: number; total: number; risk: "High" | "Medium" | "Low" }> = {};
  for (const [tag, stats] of Object.entries(tagStats)) {
    const accuracy = stats.total > 0 ? stats.correct / stats.total : 1;
    result[tag] = { ...stats, risk: accuracy < 0.4 ? "High" : accuracy < 0.7 ? "Medium" : "Low" };
  }
  return result;
}

export function getAdaptiveNextScenario(
  attempts: AttemptLog[],
  availableScenarios: { id: string; tags: string[]; difficulty: number }[]
): string | null {
  if (attempts.length === 0) return null;
  const profile = computeRiskProfile(attempts);
  const completedIds = new Set(attempts.map((a) => a.scenario_id));
  const weakTags = Object.entries(profile).filter(([, v]) => v.risk === "High").map(([tag]) => tag);
  const remaining = availableScenarios.filter((s) => !completedIds.has(s.id));
  if (remaining.length === 0) return null;
  if (weakTags.length > 0) {
    const match = remaining.find((s) => s.tags.some((t) => weakTags.includes(t)));
    if (match) return match.id;
  }
  return remaining[0]?.id ?? null;
}

export function getOverconfidenceCount(attempts: AttemptLog[]): number {
  return attempts.filter((a) => !a.correct && (a.confidence_score ?? 0) > 70).length;
}

export function getNeedsReinforcement(attempts: AttemptLog[]): number {
  return attempts.filter((a) => a.correct && (a.confidence_score ?? 100) < 40).length;
}

export function getAverageTimeTaken(attempts: AttemptLog[]): number {
  if (attempts.length === 0) return 0;
  return Math.round(attempts.reduce((s, a) => s + a.time_taken_seconds, 0) / attempts.length);
}
