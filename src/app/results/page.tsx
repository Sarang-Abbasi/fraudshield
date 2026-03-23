"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, BarChart3, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, ChevronRight, RefreshCw } from "lucide-react";
import { getSession, initSession, computeRiskProfile, getOverconfidenceCount, getNeedsReinforcement, getAverageTimeTaken, clearSession, SessionData } from "@/lib/session";

const TAG_LABELS: Record<string, string> = {
  urgency: "Urgency Manipulation",
  authority: "Authority Impersonation",
  impersonation: "Identity Deception",
  payment: "Payment Pressure",
  banking: "Bank Scams",
  delivery: "Delivery Scams",
  emotional: "Emotional Manipulation",
  tech_support: "Tech Support Scams",
  family: "Family Impersonation",
};

const RISK_COLORS = {
  High: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", bar: "bg-red-500" },
  Medium: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", bar: "bg-yellow-500" },
  Low: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", bar: "bg-green-500" },
};

export default function ResultsPage() {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    initSession().then(setSession);
  }, []);

  if (!session) return null;

  const attempts = session.attempts;
  const profile = computeRiskProfile(attempts);
  const overconfidence = getOverconfidenceCount(attempts);
  const needsReinforcement = getNeedsReinforcement(attempts);
  const avgTime = getAverageTimeTaken(attempts);
  const totalCorrect = attempts.filter((a) => a.correct).length;

  // Exclude adaptive from the percentage calculation (it's unlimited)
  const fixedModules = ["real_or_fraud", "recognition", "chat"] as const;
  const totalScore = fixedModules.reduce((s, k) => s + session.modules[k].score, 0);
  const totalMax = fixedModules.reduce((s, k) => s + session.modules[k].maxScore, 0);

  const adaptiveMod = session.modules.adaptive;
  const adaptiveAttempts = attempts.filter((a) => a.module === "adaptive");
  const adaptiveCorrect = adaptiveAttempts.filter((a) => a.correct).length;

  const highRiskTags = Object.entries(profile)
    .filter(([, v]) => v.risk === "High")
    .map(([tag]) => TAG_LABELS[tag] ?? tag);

  const weakestModule = Object.entries(session.modules)
    .filter(([key, m]) => m.completed > 0 && key !== "adaptive")
    .sort(([, a], [, b]) => (a.score / a.maxScore) - (b.score / b.maxScore))[0];

  const MODULE_LABELS: Record<string, string> = {
    real_or_fraud: "Real or Fraud",
    recognition: "Scam Recognition",
    chat: "Chat Simulator",
    adaptive: "Adaptive Generator",
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-shield-border bg-shield-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-shield-accent" size={20} />
            FraudShield
          </Link>
          <Link href="/training" className="btn-outline text-sm py-2">Back to Training</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-2">Your Results</h1>
          <p className="text-shield-muted">Session-based analysis of your scam awareness performance</p>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="text-shield-muted mx-auto mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">No data yet</h2>
            <p className="text-shield-muted mb-6">Complete some training modules to see your results here.</p>
            <Link href="/training" className="btn-primary">Start Training</Link>
          </div>
        ) : (
          <>
            {/* Overall score */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="card border border-shield-border p-5 text-center md:col-span-1">
                <div className="text-5xl font-black text-shield-accent mb-1">{totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0}%</div>
                <div className="text-sm text-shield-muted">Overall Score</div>
                <div className="text-xs text-shield-muted mt-1">{totalScore}/{totalMax} pts</div>
              </div>
              <div className="card border border-shield-border p-5 text-center">
                <div className="text-4xl font-black text-green-400 mb-1">{totalCorrect}</div>
                <div className="text-sm text-shield-muted">Correct Decisions</div>
                <div className="text-xs text-shield-muted mt-1">of {attempts.length} total</div>
              </div>
              <div className="card border border-shield-border p-5 text-center">
                <div className="text-4xl font-black text-yellow-400 mb-1">{avgTime}s</div>
                <div className="text-sm text-shield-muted">Avg Decision Time</div>
                <div className="text-xs text-shield-muted mt-1">per scenario</div>
              </div>
              <div className="card border border-shield-border p-5 text-center">
                <div className="text-4xl font-black text-red-400 mb-1">{overconfidence}</div>
                <div className="text-sm text-shield-muted">Overconfidence</div>
                <div className="text-xs text-shield-muted mt-1">wrong + high confidence</div>
              </div>
            </div>

            {/* Module breakdown */}
            <div className="card border border-shield-border p-6 mb-6">
              <h2 className="text-xl font-bold mb-5">Module Breakdown</h2>
              <div className="space-y-4 mb-6">
                {fixedModules.map((key) => {
                  const mod = session.modules[key];
                  const pct = mod.maxScore > 0 ? (mod.score / mod.maxScore) * 100 : 0;
                  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{MODULE_LABELS[key]}</span>
                        <span className="text-shield-muted font-mono">{mod.score}/{mod.maxScore} · {mod.completed}/{mod.total} scenarios</span>
                      </div>
                      <div className="h-2 bg-shield-bg rounded-full overflow-hidden">
                        <div className={`h-full rounded-full progress-fill ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Adaptive — shown only if used */}
              {adaptiveMod.completed > 0 && (
                <div className="border-t border-shield-border pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold">Adaptive Generator</span>
                    <span className="badge bg-shield-accent/10 text-shield-accent border border-shield-accent/30 text-xs">Unlimited</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-shield-bg rounded-xl p-3 text-center">
                      <div className="text-2xl font-black text-shield-accent">{adaptiveMod.completed}</div>
                      <div className="text-xs text-shield-muted mt-0.5">Rounds Played</div>
                    </div>
                    <div className="bg-shield-bg rounded-xl p-3 text-center">
                      <div className="text-2xl font-black text-green-400">{adaptiveCorrect}</div>
                      <div className="text-xs text-shield-muted mt-0.5">Correct</div>
                    </div>
                    <div className="bg-shield-bg rounded-xl p-3 text-center">
                      <div className="text-2xl font-black text-yellow-400">{adaptiveMod.score}</div>
                      <div className="text-xs text-shield-muted mt-0.5">Points Earned</div>
                    </div>
                  </div>
                  {adaptiveMod.completed > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-shield-muted mb-1">
                        <span>Accuracy</span>
                        <span className="font-mono">{Math.round((adaptiveCorrect / adaptiveMod.completed) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-shield-bg rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full progress-fill bg-gradient-to-r from-shield-accent to-cyan-400"
                          style={{ width: `${Math.round((adaptiveCorrect / adaptiveMod.completed) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Risk profile */}
            {Object.keys(profile).length > 0 && (
              <div className="card border border-shield-border p-6 mb-6">
                <h2 className="text-xl font-bold mb-2">Susceptibility Profile</h2>
                <p className="text-shield-muted text-sm mb-5">Based on your incorrect answers, here's your vulnerability to each manipulation technique.</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {Object.entries(profile)
                    .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
                    .map(([tag, stats]) => {
                      const c = RISK_COLORS[stats.risk];
                      const accuracy = Math.round((stats.correct / stats.total) * 100);
                      return (
                        <div key={tag} className={`card border ${c.border} ${c.bg} p-4`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{TAG_LABELS[tag] ?? tag}</span>
                            <span className={`badge ${c.bg} ${c.text} border ${c.border} text-xs`}>{stats.risk} Risk</span>
                          </div>
                          <div className="h-1.5 bg-shield-bg rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${accuracy}%` }} />
                          </div>
                          <div className="text-xs text-shield-muted mt-1">{accuracy}% accuracy ({stats.correct}/{stats.total})</div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Behaviour insights */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Confidence analysis */}
              <div className="card border border-shield-border p-6">
                <h3 className="font-bold mb-4">Confidence Analysis</h3>
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 p-3 rounded-xl ${overconfidence > 0 ? "bg-red-500/10 border border-red-500/20" : "bg-green-500/10 border border-green-500/20"}`}>
                    {overconfidence > 0 ? <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> : <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />}
                    <div>
                      <div className="text-sm font-medium">Overconfidence Incidents: {overconfidence}</div>
                      <div className="text-xs text-shield-muted mt-0.5">{overconfidence > 0 ? "You answered incorrectly while feeling very confident — a key vulnerability." : "No overconfidence detected. Great awareness."}</div>
                    </div>
                  </div>
                  <div className={`flex items-start gap-3 p-3 rounded-xl ${needsReinforcement > 0 ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-green-500/10 border border-green-500/20"}`}>
                    {needsReinforcement > 0 ? <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} /> : <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />}
                    <div>
                      <div className="text-sm font-medium">Needs Reinforcement: {needsReinforcement}</div>
                      <div className="text-xs text-shield-muted mt-0.5">{needsReinforcement > 0 ? "You got these right but lacked confidence — keep practising." : "Your confidence matched your performance."}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card border border-shield-border p-6">
                <h3 className="font-bold mb-4">Recommendations</h3>
                <div className="space-y-3 text-sm text-shield-muted">
                  {highRiskTags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <TrendingDown className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                      <span><strong className="text-shield-text">Focus area:</strong> {highRiskTags.join(", ")} — you're most vulnerable to these techniques.</span>
                    </div>
                  )}
                  {weakestModule && (
                    <div className="flex items-start gap-2">
                      <ChevronRight className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                      <span><strong className="text-shield-text">Redo:</strong> {MODULE_LABELS[weakestModule[0]]} — your lowest scoring module.</span>
                    </div>
                  )}
                  {overconfidence > 0 && (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={16} />
                      <span><strong className="text-shield-text">Slow down:</strong> Overconfidence is dangerous — scammers rely on you acting fast.</span>
                    </div>
                  )}
                  {totalCorrect === attempts.length && attempts.length > 0 && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      <span><strong className="text-shield-text">Excellent!</strong> Perfect score — try the advanced scenarios for more challenge.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/training" className="btn-primary flex items-center justify-center gap-2">
                Continue Training <ChevronRight size={16} />
              </Link>
              <button
                onClick={() => { clearSession(); setSession(getSession()); }}
                className="btn-outline flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Reset Session
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-shield-border px-6 py-8 text-center text-shield-muted text-sm mt-12">
        <p>Report scams to <strong className="text-shield-text">Action Fraud: 0300 123 2040</strong> · actionfraud.police.uk</p>
      </footer>
    </div>
  );
}
