"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye, Info } from "lucide-react";
import { recognitionScenarios, Hotspot } from "@/data/recognition";
import { logAttempt } from "@/lib/session";

// Simulated scam content renderer
function ScamDisplay({ scenario, hotspots, selected, revealed, onHotspotClick }: {
  scenario: typeof recognitionScenarios[0];
  hotspots: Hotspot[];
  selected: Set<string>;
  revealed: boolean;
  onHotspotClick: (id: string) => void;
}) {
  if (scenario.type === "email") return <EmailDisplay scenario={scenario} hotspots={hotspots} selected={selected} revealed={revealed} onHotspotClick={onHotspotClick} />;
  if (scenario.type === "sms") return <SmsDisplay scenario={scenario} hotspots={hotspots} selected={selected} revealed={revealed} onHotspotClick={onHotspotClick} />;
  return <WebpageDisplay scenario={scenario} hotspots={hotspots} selected={selected} revealed={revealed} onHotspotClick={onHotspotClick} />;
}

function HotspotMarker({ h, selected, revealed, onClick }: { h: Hotspot; selected: boolean; revealed: boolean; onClick: () => void }) {
  const isCorrect = h.isScam;
  const color = revealed
    ? selected && isCorrect ? "bg-green-500" : selected && !isCorrect ? "bg-yellow-400" : !selected && isCorrect ? "bg-red-500 ring-2 ring-red-300" : "bg-gray-600 opacity-50"
    : selected ? "bg-blue-500 ring-2 ring-blue-300" : "bg-white/20 hover:bg-white/40";

  return (
    <button
      onClick={onClick}
      className={`absolute w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-200 cursor-pointer border-2 border-white/30 group`}
      style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%,-50%)" }}
      title={revealed ? h.description : h.label}
    >
      {revealed ? (isCorrect ? "!" : "✓") : selected ? "•" : "+"}
    </button>
  );
}

function EmailDisplay({ scenario, hotspots, selected, revealed, onHotspotClick }: any) {
  return (
    <div className="relative bg-white rounded-xl overflow-hidden text-gray-900 font-sans text-sm shadow-xl">
      {/* Email header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 relative">
        <div className="text-xs text-gray-500 mb-1">From: <span className="text-red-600">service@paypal-secure-login.com</span></div>
        <div className="text-xs text-gray-500 mb-1">To: margaret.wilson@email.com</div>
        <div className="text-xs text-gray-500">Subject: Action Required - Verify Your PayPal Account</div>
        {hotspots.filter((h: Hotspot) => h.y < 20).map((h: Hotspot) => (
          <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
        ))}
      </div>
      {/* Email body */}
      <div className="p-5 relative">
        <div className="flex justify-center mb-4 relative">
          <div className="bg-blue-600 text-white text-xl font-bold px-4 py-2 rounded">PayPal</div>
          {hotspots.filter((h: Hotspot) => h.y >= 8 && h.y < 22).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
        </div>
        <div className="relative">
          <p className="mb-3 text-gray-700">Dear Customer,</p>
          {hotspots.filter((h: Hotspot) => h.y >= 22 && h.y < 40).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
          <p className="mb-3 text-gray-700">We have noticed <strong className="text-red-600">suspicious activity</strong> on your PayPal account. To protect your account and personal details, you must verify your identity immediately.</p>
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 relative">
            <p className="text-red-600 font-semibold text-sm">⚠️ Your account will be suspended in 24 hours if you do not verify.</p>
            {hotspots.filter((h: Hotspot) => h.y >= 40 && h.y < 55).map((h: Hotspot) => (
              <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
            ))}
          </div>
          <div className="flex justify-center mb-4 relative">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold">Verify Account Now</button>
            {hotspots.filter((h: Hotspot) => h.y >= 55 && h.y < 75).map((h: Hotspot) => (
              <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
            ))}
          </div>
          <p className="text-xs text-gray-400">If you have any questions, visit: paypal-account-verify.net/help</p>
        </div>
      </div>
    </div>
  );
}

function SmsDisplay({ scenario, hotspots, selected, revealed, onHotspotClick }: any) {
  return (
    <div className="relative bg-gray-900 rounded-3xl p-4 max-w-sm mx-auto shadow-2xl">
      <div className="text-center text-white/50 text-xs mb-4">Today 14:23</div>
      <div className="relative bg-gray-800 rounded-2xl p-4 mb-3">
        <div className="text-xs text-gray-400 mb-2 relative">
          From: 07712 445 823
          {hotspots.filter((h: Hotspot) => h.y < 20).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
        </div>
        <div className="text-white text-sm leading-relaxed relative">
          <p>Royal Mail: Your parcel (GB-1842-3921) could not be delivered. A customs fee of</p>
          <p className="text-red-400 font-semibold relative">
            £1.45 is required to release it.
            {hotspots.filter((h: Hotspot) => h.y >= 35 && h.y < 55).map((h: Hotspot) => (
              <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
            ))}
          </p>
          <p>Pay within 24 hours to avoid return:</p>
          <p className="text-blue-400 underline relative">
            royalmail-redelivery.co.uk
            {hotspots.filter((h: Hotspot) => h.y >= 55 && h.y < 72).map((h: Hotspot) => (
              <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

function WebpageDisplay({ scenario, hotspots, selected, revealed, onHotspotClick }: any) {
  return (
    <div className="relative bg-white rounded-xl overflow-hidden text-gray-900 shadow-xl">
      {/* Browser chrome */}
      <div className="bg-gray-200 border-b border-gray-300 px-3 py-2 relative">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded text-xs px-3 py-1 text-red-600 border border-gray-300 flex items-center gap-1 relative">
            <span className="text-red-400">⚠</span>
            hmrc-tax-rebate.com/claim
            {hotspots.filter((h: Hotspot) => h.y < 10).map((h: Hotspot) => (
              <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
            ))}
          </div>
          {hotspots.filter((h: Hotspot) => h.y < 10 && h.x < 15).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
        </div>
      </div>
      {/* Page body */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4 relative">
          <div className="bg-green-700 text-white p-2 rounded">
            <span className="text-xl font-bold">👑</span>
          </div>
          <div>
            <div className="font-bold text-lg">HM Revenue & Customs</div>
            <div className="text-xs text-gray-500">Tax Rebate Portal</div>
          </div>
          {hotspots.filter((h: Hotspot) => h.y >= 10 && h.y < 30).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4 text-sm">
          <p className="font-semibold text-green-800">🎉 You are eligible for a tax rebate of £892.40</p>
          <p className="text-green-700 text-xs mt-1">Claim before 31st March to receive your refund</p>
        </div>
        <div className="space-y-3 text-sm relative">
          <div>
            <label className="text-xs text-gray-600 font-medium">National Insurance Number</label>
            <input className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm" placeholder="e.g. QQ123456A" readOnly />
          </div>
          {hotspots.filter((h: Hotspot) => h.y >= 50 && h.y < 68).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
          <div>
            <label className="text-xs text-gray-600 font-medium">Bank Account Number</label>
            <input className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm" placeholder="8-digit account number" readOnly />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium">Sort Code</label>
            <input className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm" placeholder="XX-XX-XX" readOnly />
          </div>
          {hotspots.filter((h: Hotspot) => h.y >= 65 && h.y < 80).map((h: Hotspot) => (
            <HotspotMarker key={h.id} h={h} selected={selected.has(h.id)} revealed={revealed} onClick={() => onHotspotClick(h.id)} />
          ))}
          <button className="w-full bg-green-700 text-white py-2 rounded font-semibold text-sm">Claim My Rebate</button>
        </div>
      </div>
    </div>
  );
}

export default function ScamRecognitionPage() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [complete, setComplete] = useState(false);

  const scenario = recognitionScenarios[scenarioIndex];
  const scamHotspots = scenario.hotspots.filter((h) => h.isScam);

  const toggleHotspot = (id: string) => {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    const correctIds = new Set(scamHotspots.map((h) => h.id));
    const truePositives = [...selected].filter((id) => correctIds.has(id)).length;
    const falsePositives = [...selected].filter((id) => !correctIds.has(id)).length;
    const points = Math.max(0, (truePositives * 30) - (falsePositives * 10));
    setScore((s) => s + points);
    setRevealed(true);

    logAttempt({
      scenario_id: scenario.id,
      module: "recognition",
      timestamp: Date.now(),
      user_choice: [...selected].join(","),
      correct: truePositives === scamHotspots.length && falsePositives === 0,
      score_delta: points,
      time_taken_seconds: Math.round((Date.now() - startTime) / 1000),
      tags: scenario.tags,
    });
  };

  const handleNext = () => {
    if (scenarioIndex + 1 >= recognitionScenarios.length) {
      setComplete(true);
    } else {
      setScenarioIndex((i) => i + 1);
      setSelected(new Set());
      setRevealed(false);
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="text-green-400 mb-4" size={64} />
        <h1 className="text-4xl font-black mb-2">Recognition Complete!</h1>
        <p className="text-shield-muted mb-8">You scored <span className="text-shield-accent font-bold">{score}</span> points</p>
        <div className="flex gap-4">
          <Link href="/training" className="btn-outline">Back to Hub</Link>
          <Link href="/results" className="btn-primary">View Results</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-shield-border bg-shield-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/training" className="flex items-center gap-2 text-shield-muted hover:text-shield-text text-sm transition-colors">
            <ChevronLeft size={16} /> Training Hub
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-shield-muted font-mono">{scenarioIndex + 1}/{recognitionScenarios.length}</span>
            <span className="badge bg-blue-400/10 text-blue-400 border border-blue-400/20">Score: {score}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <span className="badge bg-blue-400/10 text-blue-400 border border-blue-400/20">{scenario.type.toUpperCase()}</span>
            <span className="badge bg-shield-bg border border-shield-border text-shield-muted">
              {scenario.difficulty === 1 ? "Beginner" : scenario.difficulty === 2 ? "Intermediate" : "Advanced"}
            </span>
          </div>
          <h1 className="text-3xl font-black mb-2">{scenario.title}</h1>
          <p className="text-shield-muted">{scenario.description}</p>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-shield-muted bg-shield-card border border-shield-border rounded-xl px-4 py-3">
          <Info size={16} className="text-blue-400 flex-shrink-0" />
          <span>Tap the <strong className="text-shield-text">+ markers</strong> on the image to flag suspicious elements. Select all that apply, then click Submit.</span>
        </div>

        {/* Main content area */}
        <div className="card border border-shield-border p-6 mb-6">
          <ScamDisplay
            scenario={scenario}
            hotspots={scenario.hotspots}
            selected={selected}
            revealed={revealed}
            onHotspotClick={toggleHotspot}
          />
        </div>

        {/* Legend when revealed */}
        {revealed && (
          <div className="grid md:grid-cols-2 gap-4 mb-6 animate-slide-up">
            {scenario.hotspots.map((h) => (
              <div key={h.id} className={`card border p-3 text-sm ${h.isScam ? "border-red-500/30 bg-red-500/5" : "border-green-500/30 bg-green-500/5"}`}>
                <div className="flex items-start gap-2">
                  {h.isScam ? (
                    <XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                  ) : (
                    <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                  )}
                  <div>
                    <div className="font-semibold text-shield-text">{h.label}</div>
                    <div className="text-shield-muted mt-0.5">{h.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          {!revealed ? (
            <button
              onClick={handleSubmit}
              disabled={selected.size === 0}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit ({selected.size} selected)
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Next Example <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
