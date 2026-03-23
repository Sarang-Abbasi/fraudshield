"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, PhoneOff, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import { chatSimulations, ChatNode } from "@/data/chatSimulations";
import { logAttempt } from "@/lib/session";

interface Message {
  id: string;
  speaker: "scammer" | "user" | "system";
  text: string;
}

export default function ChatSimulatorPage() {
  const [simIndex, setSimIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNode, setCurrentNode] = useState<ChatNode | null>(null);
  const [outcome, setOutcome] = useState<"safe" | "unsafe" | "partial" | null>(null);
  const [outcomeMessage, setOutcomeMessage] = useState("");
  const [score, setScore] = useState(0);
  const [complete, setComplete] = useState(false);
  const [startTime] = useState(Date.now());
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sim = chatSimulations[simIndex];

  useEffect(() => {
    initSim();
  }, [simIndex]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const initSim = () => {
    const startNode = chatSimulations[simIndex].nodes[chatSimulations[simIndex].startNodeId];
    setMessages([]);
    setCurrentNode(null);
    setOutcome(null);
    setOutcomeMessage("");
    setTimeout(() => {
      addScammerMessage(startNode);
    }, 500);
  };

  const addScammerMessage = (node: ChatNode) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: `${Date.now()}`, speaker: node.speaker, text: node.message }]);
      setCurrentNode(node);
      if (node.isEnd) {
        setOutcome(node.outcome ?? "unsafe");
        setOutcomeMessage(node.outcomeMessage ?? "");
        const delta = node.scoreChange ?? 0;
        setScore((s) => s + delta);
        logAttempt({
          scenario_id: sim.id,
          module: "chat",
          timestamp: Date.now(),
          user_choice: node.id,
          correct: (node.outcome ?? "unsafe") === "safe",
          score_delta: delta,
          time_taken_seconds: Math.round((Date.now() - startTime) / 1000),
          tags: sim.tags,
        });
      }
    }, 1200 + Math.random() * 600);
  };

  const handleChoice = (optionId: string) => {
    if (!currentNode?.options) return;
    const option = currentNode.options.find((o) => o.id === optionId);
    if (!option) return;

    // Add user message
    setMessages((prev) => [...prev, { id: `${Date.now()}`, speaker: "user", text: option.text }]);
    setCurrentNode(null);

    // Get next node
    const nextNode = sim.nodes[option.nextNodeId];
    if (nextNode) {
      setTimeout(() => addScammerMessage(nextNode), 400);
    }
  };

  const handleNext = () => {
    if (simIndex + 1 >= chatSimulations.length) {
      setComplete(true);
    } else {
      setSimIndex((i) => i + 1);
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="text-green-400 mb-4" size={64} />
        <h1 className="text-4xl font-black mb-2">Simulations Complete!</h1>
        <p className="text-shield-muted mb-8">You scored <span className="text-shield-accent font-bold">{score}</span> points</p>
        <div className="flex gap-4">
          <Link href="/training" className="btn-outline">Back to Hub</Link>
          <Link href="/results" className="btn-primary">View Results</Link>
        </div>
      </div>
    );
  }

  const outcomeColors = {
    safe: { bg: "border-green-500/40 bg-green-500/5", icon: <CheckCircle className="text-green-400" size={24} />, label: "Safe Outcome" },
    unsafe: { bg: "border-red-500/40 bg-red-500/5", icon: <XCircle className="text-red-400" size={24} />, label: "Scam Successful" },
    partial: { bg: "border-yellow-500/40 bg-yellow-500/5", icon: <AlertCircle className="text-yellow-400" size={24} />, label: "Partial Risk" },
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-shield-border bg-shield-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/training" className="flex items-center gap-2 text-shield-muted hover:text-shield-text text-sm transition-colors">
            <ChevronLeft size={16} /> Training Hub
          </Link>
          <span className="badge bg-green-400/10 text-green-400 border border-green-400/20">Simulation {simIndex + 1}/{chatSimulations.length}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col px-4 py-6">
        {/* Sim header */}
        <div className="card border border-shield-border p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Phone className="text-red-400" size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{sim.callerName}</div>
              <div className="text-xs text-shield-muted">{sim.callerType} · Incoming</div>
            </div>
            <div className="badge bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">LIVE</div>
          </div>
          <p className="text-shield-muted text-sm mt-3">{sim.description}</p>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {sim.tags.map((tag) => (
            <span key={tag} className="badge bg-shield-bg border border-shield-border text-shield-muted text-xs">{tag.replace("_", " ")}</span>
          ))}
        </div>

        {/* Chat messages */}
        <div className="flex-1 space-y-4 mb-4 min-h-0 overflow-y-auto max-h-96">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.speaker === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
              {msg.speaker === "scammer" && (
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                  <Phone className="text-red-400" size={12} />
                </div>
              )}
              <div className={`max-w-xs md:max-w-sm px-4 py-3 text-sm leading-relaxed ${
                msg.speaker === "user" ? "chat-bubble-user text-blue-100" :
                msg.speaker === "system" ? "chat-bubble-scammer text-shield-muted italic" :
                "chat-bubble-scammer text-shield-text"
              }`}>
                {msg.text}
              </div>
              {msg.speaker === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center ml-2 flex-shrink-0 self-end">
                  <Shield className="text-blue-400" size={12} />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex justify-start animate-slide-up">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-2 flex-shrink-0">
                <Phone className="text-red-400" size={12} />
              </div>
              <div className="chat-bubble-scammer px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-shield-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-shield-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-shield-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Outcome */}
        {outcome && (
          <div className={`card border p-4 mb-4 animate-slide-up ${outcomeColors[outcome].bg}`}>
            <div className="flex items-start gap-3">
              {outcomeColors[outcome].icon}
              <div>
                <div className="font-semibold mb-1">{outcomeColors[outcome].label}</div>
                <p className="text-shield-muted text-sm leading-relaxed">{outcomeMessage}</p>
              </div>
            </div>
            <button onClick={handleNext} className="btn-primary w-full mt-4">
              {simIndex + 1 < chatSimulations.length ? "Next Simulation" : "View Results"}
            </button>
          </div>
        )}

        {/* Response options */}
        {currentNode?.options && !outcome && (
          <div className="space-y-2 animate-slide-up">
            <p className="text-xs text-shield-muted mb-3 text-center">Choose your response:</p>
            {currentNode.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChoice(opt.id)}
                className="w-full text-left card border border-shield-border hover:border-shield-accent p-3 text-sm transition-all duration-200 leading-relaxed"
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
