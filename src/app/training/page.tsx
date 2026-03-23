"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, Eye, MessageSquare, BarChart3, ChevronRight, Lock, Zap, LogOut, LogIn } from "lucide-react";
import { getSession, initSession, SessionData } from "@/lib/session";
import { useAuth } from "@/lib/useAuth";

export default function TrainingPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    initSession().then(setSession);
  }, []);

  const modules = [
    {
      id: "real-or-fraud",
      href: "/real-or-fraud",
      icon: <AlertTriangle size={28} />,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20 hover:border-yellow-400/50",
      title: "Real or Fraud",
      subtitle: "Scenario Training",
      desc: "Read realistic scam situations and decide what you would do. Understand why decisions matter.",
      scenarios: "6 Scenarios",
      difficulty: "Beginner → Advanced",
      key: "real_or_fraud" as const,
    },
    {
      id: "scam-recognition",
      href: "/scam-recognition",
      icon: <Eye size={28} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20 hover:border-blue-400/50",
      title: "Scam Recognition",
      subtitle: "Spot the Red Flags",
      desc: "Identify suspicious elements in emails, texts and webpages. Train your eye to spot what others miss.",
      scenarios: "3 Examples",
      difficulty: "Visual Detection",
      key: "recognition" as const,
    },
    {
      id: "chat-simulator",
      href: "/chat-simulator",
      icon: <MessageSquare size={28} />,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20 hover:border-green-400/50",
      title: "Chat Simulator",
      subtitle: "Live Conversation Training",
      desc: "Navigate a real-time scam call with branching decisions. Your choices shape the outcome.",
      scenarios: "2 Simulations",
      difficulty: "Decision Trees",
      key: "chat" as const,
    },
  ];

  const totalCompleted = session
    ? (session.modules.real_or_fraud.completed + session.modules.recognition.completed + session.modules.chat.completed)
    : 0;
  const totalScenarios = 11;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-shield-border bg-shield-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-shield-accent" size={20} />
            FraudShield
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/results" className="flex items-center gap-2 text-shield-muted hover:text-shield-text text-sm transition-colors">
              <BarChart3 size={16} />
              Results
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-shield-card border border-shield-border rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-shield-accent/20 border border-shield-accent/30 flex items-center justify-center text-xs font-bold text-shield-accent">
                    {user.avatar}
                  </div>
                  <span className="text-sm text-shield-text hidden sm:block">{user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-shield-muted hover:text-shield-text hover:bg-shield-card border border-transparent hover:border-shield-border transition-all"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="flex items-center gap-1.5 text-sm text-shield-accent hover:underline">
                <LogIn size={15} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2">Training Hub</h1>
          <p className="text-shield-muted text-lg">Choose a module to begin. Complete all three for your full risk profile.</p>

          {/* Overall progress */}
          <div className="mt-6 card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-shield-muted font-medium">Overall Progress</span>
              <span className="text-sm font-mono text-shield-accent">{totalCompleted}/{totalScenarios} completed</span>
            </div>
            <div className="h-2 bg-shield-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-shield-accent to-cyan-400 rounded-full progress-fill"
                style={{ width: `${(totalCompleted / totalScenarios) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {modules.map((mod) => {
            const progress = session?.modules[mod.key];
            const pct = progress ? (progress.completed / progress.total) * 100 : 0;
            const done = progress?.completed === progress?.total && (progress?.total ?? 0) > 0;

            return (
              <Link
                key={mod.id}
                href={mod.href}
                className={`card border p-6 ${mod.border} transition-all duration-200 hover:bg-shield-surface group relative overflow-hidden`}
              >
                {done && (
                  <div className="absolute top-3 right-3 badge bg-green-500/10 text-green-400 border border-green-500/20">
                    ✓ Done
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl ${mod.bg} flex items-center justify-center mb-4 ${mod.color}`}>
                  {mod.icon}
                </div>

                <div className="text-xs text-shield-muted font-mono uppercase tracking-wider mb-1">{mod.subtitle}</div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{mod.title}</h2>
                <p className="text-shield-muted text-sm leading-relaxed mb-4">{mod.desc}</p>

                <div className="flex gap-3 text-xs text-shield-muted mb-4">
                  <span className="badge bg-shield-bg border border-shield-border">{mod.scenarios}</span>
                  <span className="badge bg-shield-bg border border-shield-border">{mod.difficulty}</span>
                </div>

                {progress && (
                  <div>
                    <div className="flex justify-between text-xs text-shield-muted mb-1">
                      <span>Progress</span>
                      <span>{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="h-1.5 bg-shield-bg rounded-full overflow-hidden">
                      <div className={`h-full rounded-full progress-fill ${done ? "bg-green-400" : `bg-gradient-to-r from-shield-accent to-cyan-400`}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${mod.color}`}>
                  {done ? "Redo Training" : "Start Module"} <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Adaptive training highlight */}
        <Link
          href="/adaptive-training"
          className="card border border-shield-accent/30 hover:border-shield-accent bg-shield-accent/5 hover:bg-shield-accent/10 p-6 mb-6 flex items-center gap-5 transition-all duration-200 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-shield-accent/20 flex items-center justify-center flex-shrink-0">
            <Zap className="text-shield-accent" size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">Adaptive Scenario Generator</span>
              <span className="badge bg-shield-accent/10 text-shield-accent border border-shield-accent/30 text-xs">∞ Unlimited</span>
            </div>
            <p className="text-shield-muted text-sm leading-relaxed">
              Unlimited generated scenarios, personalised to your weak areas. Every round combines a different sender, scam tactic, channel, and pressure level based on where you struggle most.
            </p>
          </div>
          <ChevronRight className="text-shield-accent flex-shrink-0 group-hover:translate-x-1 transition-transform" size={20} />
        </Link>

        {/* Tips */}
        <div className="card p-6 border border-shield-border">
          <div className="flex items-start gap-4">
            <Lock className="text-shield-accent mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold mb-1">Training Tip</h3>
              <p className="text-shield-muted text-sm leading-relaxed">
                Scams work because they trigger emotional responses — urgency, fear, authority. As you train, notice <em>how</em> the scenarios make you feel, not just whether you spotted the scam. Real vulnerability comes from emotional reactions, not lack of knowledge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
