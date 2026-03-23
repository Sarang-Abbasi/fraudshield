"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, ChevronRight, AlertTriangle, Eye, MessageSquare, BarChart3, LogIn } from "lucide-react";
import { clearSession } from "@/lib/session";
import { getCurrentUser, UserProfile } from "@/lib/auth";

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleStart = () => {
    if (!user) clearSession();
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-shield-border/50">
        <div className="flex items-center gap-2 font-bold">
          <Shield className="text-shield-accent" size={18} />
          FraudShield
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-shield-muted hidden sm:block">Hi, {user.name.split(" ")[0]}</span>
              <Link href="/training" className="btn-primary py-2 px-4 text-sm">Go to Training</Link>
            </>
          ) : (
            <>
              <Link href="/auth" className="text-sm text-shield-muted hover:text-shield-text transition-colors flex items-center gap-1.5">
                <LogIn size={15} /> Sign In
              </Link>
              <Link href="/auth" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-glow flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="flex items-center gap-2 badge bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-8">
          <Shield size={12} />
          Cyber Awareness Training Platform
        </div>

        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-shield-accent/10 border border-shield-accent/30 flex items-center justify-center mx-auto">
            <Shield className="text-shield-accent" size={40} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-shield-bg animate-pulse" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          Fraud<span className="text-shield-accent">Shield</span>
        </h1>
        <p className="text-xl md:text-2xl text-shield-muted font-light max-w-2xl mb-4">
          Don't just learn about scams — <span className="text-shield-text font-medium">practice avoiding them</span>
        </p>
        <p className="text-shield-muted max-w-xl mb-10 leading-relaxed">
          Interactive scenario training designed to help you recognise manipulation tactics, make confident decisions, and protect yourself from fraud.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {user ? (
            <Link
              href="/training"
              className="btn-primary flex items-center gap-2 text-lg px-8 py-4 shadow-lg shadow-blue-500/20"
            >
              Continue Training <ChevronRight size={20} />
            </Link>
          ) : (
            <>
              <Link
                href="/auth"
                className="btn-primary flex items-center gap-2 text-lg px-8 py-4 shadow-lg shadow-blue-500/20"
              >
                Create Account <ChevronRight size={20} />
              </Link>
              <Link
                href="/training"
                onClick={handleStart}
                className="btn-outline text-lg px-8 py-4"
              >
                Try Without Account
              </Link>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16 text-center">
          {[
            { n: "6", label: "Scam Scenarios" },
            { n: "3", label: "Recognition Tests" },
            { n: "2", label: "Chat Simulations" },
            { n: "∞", label: "Adaptive Scenarios" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-shield-accent">{s.n}</div>
              <div className="text-sm text-shield-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* About section */}
      <div id="about" className="bg-shield-surface border-t border-shield-border px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">What You'll Practice</h2>
          <p className="text-shield-muted text-center mb-12">Scams succeed because of how they make you <em>feel</em> — not because they're clever. Train your instincts.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <AlertTriangle className="text-yellow-400" size={24} />,
                title: "Real or Fraud",
                desc: "Read real-life scam scenarios and decide what you'd do. Get instant feedback on your reasoning.",
                color: "yellow",
              },
              {
                icon: <Eye className="text-blue-400" size={24} />,
                title: "Scam Recognition",
                desc: "Identify suspicious elements in emails, texts, and webpages — the red flags most people miss.",
                color: "blue",
              },
              {
                icon: <MessageSquare className="text-green-400" size={24} />,
                title: "Chat Simulator",
                desc: "Navigate live scam conversations. Your choices determine the outcome.",
                color: "green",
              },
              {
                icon: <BarChart3 className="text-purple-400" size={24} />,
                title: "Risk Profile",
                desc: "See exactly which manipulation tactics you're most vulnerable to and where to focus.",
                color: "purple",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-shield-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Warning types */}
          <div className="mt-12 card p-6">
            <h3 className="font-semibold text-center mb-6 text-shield-muted uppercase tracking-wider text-sm">Scam Types Covered</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {["Bank Fraud", "HMRC Impersonation", "Tech Support", "Delivery Scams", "Family Impersonation", "APP Fraud", "Phishing Emails", "Safe Account"].map(
                (tag) => (
                  <span key={tag} className="badge bg-shield-bg border border-shield-border text-shield-muted text-sm px-3 py-1.5">
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-shield-bg border-t border-shield-border px-6 py-8 text-center text-shield-muted text-sm">
        <p>FraudShield · University Final Year Project · Cyber Awareness Training Platform</p>
        <p className="mt-1 text-xs opacity-50">For educational purposes only. Report scams to Action Fraud: 0300 123 2040</p>
      </footer>
    </main>
  );
}
