"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, ChevronLeft, CheckCircle, XCircle, Clock, ChevronRight, Lightbulb } from "lucide-react";
import { realOrFraudScenarios } from "@/data/scenarios";
import { logAttempt, getSession } from "@/lib/session";
import { getAdaptiveNextScenario } from "@/lib/session";

type Phase = "question" | "confidence" | "feedback" | "complete";

export default function RealOrFraudPage() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("question");
  const [confidence, setConfidence] = useState(50);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completed, setCompleted] = useState<string[]>([]);
  const [order, setOrder] = useState<number[]>([]);

  // Adaptive ordering
  useEffect(() => {
    const session = getSession();
    const adaptiveNext = getAdaptiveNextScenario(
      session.attempts.filter((a) => a.module === "real_or_fraud"),
      realOrFraudScenarios.map((s) => ({ id: s.id, tags: s.tags, difficulty: s.difficulty }))
    );
    // Build ordered list starting with adaptive next
    const ids = realOrFraudScenarios.map((_, i) => i);
    if (adaptiveNext) {
      const idx = realOrFraudScenarios.findIndex((s) => s.id === adaptiveNext);
      const reordered = [idx, ...ids.filter((i) => i !== idx)];
      setOrder(reordered);
    } else {
      setOrder(ids);
    }
    setStartTime(Date.now());
  }, []);

  const scenario = order.length > 0 ? realOrFraudScenarios[order[scenarioIndex]] : realOrFraudScenarios[scenarioIndex];

  const handleOptionSelect = (optionId: string) => {
    if (phase !== "question") return;
    setSelectedOption(optionId);
    setPhase("confidence");
  };

  const handleConfirmConfidence = () => {
    if (!selectedOption || !scenario) return;
    const isCorrect = selectedOption === scenario.correctAnswer;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    logAttempt({
      scenario_id: scenario.id,
      module: "real_or_fraud",
      timestamp: Date.now(),
      user_choice: selectedOption,
      correct: isCorrect,
      score_delta: isCorrect ? 100 : 0,
      time_taken_seconds: timeTaken,
      tags: scenario.tags,
      confidence_score: confidence,
    });

    if (isCorrect) setScore((s) => s + 100);
    setCompleted((c) => [...c, scenario.id]);
    setPhase("feedback");
  };

  const handleNext = () => {
    const nextIdx = scenarioIndex + 1;
    if (nextIdx >= realOrFraudScenarios.length) {
      setPhase("complete");
    } else {
      setScenarioIndex(nextIdx);
      setSelectedOption(null);
      setPhase("question");
      setConfidence(50);
      setStartTime(Date.now());
    }
  };

  if (order.length === 0) return null;

  if (phase === "complete") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="text-green-400 mb-4" size={64} />
        <h1 className="text-4xl font-black mb-2">Module Complete!</h1>
        <p className="text-shield-muted mb-2">You scored <span className="text-shield-accent font-bold">{score}</span> out of {realOrFraudScenarios.length * 100}</p>
        <p className="text-shield-muted text-sm mb-8">{realOrFraudScenarios.length} scenarios completed</p>
        <div className="flex gap-4">
          <Link href="/training" className="btn-outline">Back to Hub</Link>
          <Link href="/results" className="btn-primary">View Results</Link>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === scenario?.correctAnswer;
  const selectedOpt = scenario?.options.find((o) => o.id === selectedOption);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-shield-border bg-shield-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/training" className="flex items-center gap-2 text-shield-muted hover:text-shield-text text-sm transition-colors">
            <ChevronLeft size={16} /> Training Hub
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-shield-muted font-mono">{scenarioIndex + 1}/{realOrFraudScenarios.length}</span>
            <span className="badge bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">Score: {score}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 animate-slide-up">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-shield-muted mb-2">
            <span>Real or Fraud</span>
            <span>{Math.round((scenarioIndex / realOrFraudScenarios.length) * 100)}% complete</span>
          </div>
          <div className="h-1.5 bg-shield-card rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full progress-fill" style={{ width: `${(scenarioIndex / realOrFraudScenarios.length) * 100}%` }} />
          </div>
        </div>

        {/* Category + difficulty */}
        <div className="flex gap-2 mb-4">
          <span className="badge bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">{scenario.category}</span>
          <span className="badge bg-shield-bg border border-shield-border text-shield-muted">
            {scenario.difficulty === 1 ? "Beginner" : scenario.difficulty === 2 ? "Intermediate" : "Advanced"}
          </span>
        </div>

        {/* Scenario card */}
        <div className="card border border-shield-border p-6 mb-6">
          <div className="flex items-start gap-2 mb-3 text-xs text-shield-muted font-mono">
            <span className="badge bg-red-500/10 text-red-400 border border-red-500/20">INCOMING MESSAGE</span>
            <span>From: {scenario.sender}</span>
          </div>
          <p className="text-lg leading-relaxed text-shield-text font-light">{scenario.scenario}</p>
        </div>

        {phase === "question" && (
          <>
            <h2 className="font-semibold text-shield-muted mb-4">What would you do?</h2>
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
          </>
        )}

        {phase === "confidence" && (
          <div className="card border border-shield-border p-6 animate-slide-up">
            <h2 className="font-semibold mb-1">Before we continue…</h2>
            <p className="text-shield-muted text-sm mb-6">How confident are you in your answer? (Used to personalise your risk profile)</p>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-shield-muted mb-2">
                <span>Not sure at all</span>
                <span className="font-mono text-shield-accent">{confidence}%</span>
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
              <button onClick={handleConfirmConfidence} className="btn-primary flex-1">Submit Answer</button>
            </div>
          </div>
        )}

        {phase === "feedback" && (
          <div className={`card border p-6 animate-slide-up ${isCorrect ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <CheckCircle className="text-green-400 flex-shrink-0" size={28} />
              ) : (
                <XCircle className="text-red-400 flex-shrink-0" size={28} />
              )}
              <div>
                <h2 className="font-bold text-lg">{isCorrect ? "Correct Decision!" : "Not Quite"}</h2>
                <p className="text-sm text-shield-muted">You chose: {selectedOpt?.text}</p>
              </div>
            </div>

            <p className="text-shield-text leading-relaxed mb-5">
              {isCorrect ? scenario.feedback_correct : scenario.feedback_incorrect}
            </p>

            {!isCorrect && (
              <div className="mb-5">
                <p className="text-sm text-shield-muted mb-2 font-medium">Safe answer: <span className="text-green-400">{scenario.options.find((o) => o.id === scenario.correctAnswer)?.text}</span></p>
              </div>
            )}

            {/* Red flags */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="text-yellow-400" size={16} />
                <span className="text-sm font-semibold text-shield-muted">Red Flags in This Scenario</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {scenario.redFlags.map((flag) => (
                  <span key={flag} className="badge bg-red-500/10 text-red-400 border border-red-500/20 text-xs">{flag}</span>
                ))}
              </div>
            </div>

            <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
              Next Scenario <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
