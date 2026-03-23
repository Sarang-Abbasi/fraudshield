"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, XCircle, Lightbulb, ChevronRight, Zap, RefreshCw, Info, BarChart3 } from "lucide-react";
import { generateScenario, pickAdaptiveComponents, GeneratedScenario } from "@/lib/generator";
import { logAttempt, getSession, computeRiskProfile } from "@/lib/session";

type Phase = "loading" | "question" | "confidence" | "feedback";

const TACTIC_LABELS: Record<string, string> = {
  urgency: "Urgency",
  refund_bait: "Refund Bait",
  security_alert: "Security Alert",
  emotional: "Emotional",
  payment_pressure: "Payment Pressure",
  authority: "Authority",
  impersonation: "Impersonation",
};

const CHANNEL_ICONS: Record<string, string> = {
  sms: "📱",
  email: "📧",
  whatsapp: "💬",
  phone_call: "📞",
};

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Beginner", color: "text-green-400 border-green-400/30 bg-green-400/10" },
  2: { label: "Intermediate", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
  3: { label: "Advanced", color: "text-red-400 border-red-400/30 bg-red-400/10" },
};

export default function AdaptiveTrainingPage() {
  const [scenario, setScenario] = useState<GeneratedScenario | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(50);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [showComponentBreakdown, setShowComponentBreakdown] = useState(false);

  const generateNext = useCallback(() => {
    setPhase("loading");
    setTimeout(() => {
      const session = getSession();
      const recentAttempts = session.attempts.filter(
        (a) => a.module === "real_or_fraud" || a.module === "adaptive"
      );
      const components = pickAdaptiveComponents(recentAttempts);
      const next = generateScenario(components);
      setScenario(next);
      setSelectedOption(null);
      setConfidence(50);
      setStartTime(Date.now());
      setPhase("question");
    }, 600);
  }, []);

  useEffect(() => {
    generateNext();
  }, []);

  const handleOptionSelect = (optionId: string) => {
    if (phase !== "question") return;
    setSelectedOption(optionId);
    setPhase("confidence");
  };

  const handleSubmit = () => {
    if (!selectedOption || !scenario) return;
    const isCorrect = selectedOption === scenario.correctAnswer;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    logAttempt({
      scenario_id: scenario.id,
      module: "adaptive",
      timestamp: Date.now(),
      user_choice: selectedOption,
      correct: isCorrect,
      score_delta: isCorrect ? 100 : 0,
      time_taken_seconds: timeTaken,
      tags: scenario.tags,
      confidence_score: confidence,
    });

    if (isCorrect) {
      setScore((s) => s + 100);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setSessionAttempts((n) => n + 1);
    setPhase("feedback");
  };

  const handleNext = () => {
    setRound((r) => r + 1);
    generateNext();
  };

  const isCorrect = selectedOption === scenario?.correctAnswer;
  const selectedOpt = scenario?.options.find((o) => o.id === selectedOption);
  const diff = DIFFICULTY_LABELS[scenario?.difficulty ?? 1];
  const session = getSession();
  const profile = computeRiskProfile(session.attempts.filter(a => a.module === "real_or_fraud" || a.module === "adaptive"));

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-shield-border bg-shield-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/training" className="flex items-center gap-2 text-shield-muted hover:text-shield-text text-sm transition-colors">
            <ChevronLeft size={16} /> Training Hub
          </Link>
          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <span className="badge bg-orange-400/10 text-orange-400 border border-orange-400/20">
                🔥 {streak} streak
              </span>
            )}
            <span className="badge bg-shield-bg border border-shield-border text-shield-muted font-mono">
              Round {round}
            </span>
            <span className="badge bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
              {score} pts
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="text-shield-accent" size={20} />
              <h1 className="text-2xl font-black">Adaptive Training</h1>
            </div>
            <p className="text-shield-muted text-sm">Scenarios are generated based on your weak areas — no two sessions are the same.</p>
          </div>
          <button
            onClick={() => setShowComponentBreakdown(!showComponentBreakdown)}
            className="p-2 rounded-lg border border-shield-border text-shield-muted hover:text-shield-text hover:border-shield-accent transition-all"
            title="Show risk profile"
          >
            <BarChart3 size={18} />
          </button>
        </div>

        {/* Risk profile mini panel */}
        {showComponentBreakdown && Object.keys(profile).length > 0 && (
          <div className="card border border-shield-border p-4 mb-6 animate-slide-up">
            <h3 className="text-sm font-semibold mb-3 text-shield-muted uppercase tracking-wider">Your Current Risk Profile (driving scenario selection)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(profile).map(([tag, stats]) => {
                const acc = Math.round((stats.correct / stats.total) * 100);
                const color = stats.risk === "High" ? "text-red-400" : stats.risk === "Medium" ? "text-yellow-400" : "text-green-400";
                return (
                  <div key={tag} className="flex items-center justify-between bg-shield-bg rounded-lg px-3 py-2 text-xs">
                    <span className="text-shield-muted">{TACTIC_LABELS[tag] ?? tag}</span>
                    <span className={`font-mono font-bold ${color}`}>{acc}%</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-shield-muted mt-3 flex items-center gap-1">
              <Info size={12} />
              Scenarios with your weakest tactics are prioritised automatically.
            </p>
          </div>
        )}

        {phase === "loading" && (
          <div className="card border border-shield-border p-12 text-center animate-pulse-slow">
            <Zap className="text-shield-accent mx-auto mb-4" size={32} />
            <p className="text-shield-muted">Generating personalised scenario…</p>
          </div>
        )}

        {phase !== "loading" && scenario && (
          <>
            {/* Scenario metadata */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`badge border text-xs ${diff.color}`}>{diff.label}</span>
              <span className="badge bg-shield-bg border border-shield-border text-shield-muted text-xs">
                {CHANNEL_ICONS[scenario.components.channel]} {scenario.components.channel.replace("_", " ")}
              </span>
              <span className="badge bg-shield-bg border border-shield-border text-shield-muted text-xs">
                🎯 {TACTIC_LABELS[scenario.components.tactic] ?? scenario.components.tactic}
              </span>
              <span className="badge bg-shield-bg border border-shield-border text-shield-muted text-xs">
                {scenario.category}
              </span>
            </div>

            {/* Scenario card */}
            <div className="card border border-shield-border p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-xs">INCOMING</span>
                <span className="text-xs text-shield-muted font-mono">{scenario.sender}</span>
              </div>
              <h2 className="font-bold text-lg mb-3">{scenario.title}</h2>
              <p className="text-shield-text leading-relaxed">{scenario.scenario}</p>
            </div>

            {/* Question phase */}
            {phase === "question" && (
              <div className="animate-slide-up">
                <p className="text-shield-muted font-medium mb-4">What would you do?</p>
                <div className="space-y-3">
                  {scenario.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      className="w-full text-left card border border-shield-border hover:border-shield-accent p-4 transition-all duration-200 flex items-start gap-3 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-shield-bg border border-shield-border text-shield-muted text-sm font-mono flex items-center justify-center flex-shrink-0 group-hover:border-shield-accent group-hover:text-shield-accent transition-colors">
                        {opt.id.toUpperCase()}
                      </span>
                      <span className="text-shield-text leading-relaxed">{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence phase */}
            {phase === "confidence" && (
              <div className="card border border-shield-border p-6 animate-slide-up">
                <h3 className="font-semibold mb-1">How confident are you?</h3>
                <p className="text-shield-muted text-sm mb-5">This helps track your decision patterns over time.</p>
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-shield-muted mb-2">
                    <span>Not sure</span>
                    <span className="font-mono text-shield-accent text-lg font-bold">{confidence}%</span>
                    <span>Very confident</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPhase("question")} className="btn-outline flex-1">Back</button>
                  <button onClick={handleSubmit} className="btn-primary flex-1">Submit Answer</button>
                </div>
              </div>
            )}

            {/* Feedback phase */}
            {phase === "feedback" && (
              <div className={`card border p-6 animate-slide-up ${isCorrect ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
                <div className="flex items-center gap-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="text-green-400 flex-shrink-0" size={28} />
                  ) : (
                    <XCircle className="text-red-400 flex-shrink-0" size={28} />
                  )}
                  <div>
                    <h2 className="font-bold text-lg">{isCorrect ? "Correct!" : "Incorrect"}</h2>
                    <p className="text-sm text-shield-muted">You chose: {selectedOpt?.text}</p>
                  </div>
                  {confidence > 70 && !isCorrect && (
                    <span className="ml-auto badge bg-orange-400/10 text-orange-400 border border-orange-400/20 text-xs">
                      ⚠ Overconfidence
                    </span>
                  )}
                </div>

                <p className="text-shield-text leading-relaxed mb-5">
                  {isCorrect ? scenario.feedback_correct : scenario.feedback_incorrect}
                </p>

                {!isCorrect && (
                  <p className="text-sm mb-4 text-shield-muted">
                    Safe answer: <span className="text-green-400 font-medium">{scenario.options.find((o) => o.id === "c")?.text}</span>
                  </p>
                )}

                {/* Red flags */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="text-yellow-400" size={16} />
                    <span className="text-sm font-semibold text-shield-muted">Red Flags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scenario.redFlags.map((flag) => (
                      <span key={flag} className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-xs">{flag}</span>
                    ))}
                  </div>
                </div>

                {/* What this scenario targeted */}
                <div className="bg-shield-bg rounded-xl p-3 mb-5 text-xs text-shield-muted flex items-center gap-2">
                  <Zap className="text-shield-accent flex-shrink-0" size={14} />
                  This scenario was generated to target your <strong className="text-shield-text mx-1">{TACTIC_LABELS[scenario.components.tactic]}</strong> vulnerability
                  at <strong className="text-shield-text mx-1">{diff.label}</strong> difficulty.
                  {!isCorrect && " A new scenario with this tactic will be prioritised."}
                </div>

                <div className="flex gap-3">
                  <Link href="/results" className="btn-outline flex items-center gap-2 px-4">
                    <BarChart3 size={16} /> Results
                  </Link>
                  <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    Next Scenario <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
