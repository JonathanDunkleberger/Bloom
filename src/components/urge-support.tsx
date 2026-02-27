"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Wind, PenLine, RotateCcw, RefreshCw, Sparkles, ChevronLeft, Check } from "lucide-react";
import { Creature } from "@/components/creature";
import type { ThemeColors } from "@/lib/constants";

/* ═══════════ Redirect activities ═══════════ */
const REDIRECT_ACTIVITIES = [
  "Do 10 pushups",
  "Splash cold water on your face",
  "Walk outside for 2 minutes",
  "Count backward from 100 by 7s",
  "Drink a full glass of water",
  "Text someone you care about",
  "Name 5 things you can see",
  "Make tight fists for 10 seconds, release, repeat 5x",
];

const URGE_TAGS = ["Stress", "Boredom", "Social", "After meal", "Night", "Habit loop"];

/* ═══════════ Types ═══════════ */
interface UrgeSupportProps {
  habit: { id: string; name: string; color: string };
  /** How many urges have been beaten today across all quit habits */
  urgesToday: number;
  onComplete: (data: { method: "breathe" | "write" | "redirect"; tags?: string[]; note?: string }) => void;
  onClose: () => void;
  th: ThemeColors;
}

type Screen = "menu" | "breathe" | "write" | "redirect" | "reward";

/* ═══════════ Main component ═══════════ */
export function UrgeSupport({ habit, urgesToday, onComplete, onClose, th }: UrgeSupportProps) {
  const [screen, setScreen] = useState<Screen>("menu");
  const [method, setMethod] = useState<"breathe" | "write" | "redirect">("breathe");

  /* ── Breathe state ── */
  const [bPhase, setBPhase] = useState<"ready" | "inhale" | "hold" | "exhale" | "done">("ready");
  const [bSec, setBSec] = useState(0);
  const [bCycle, setBCycle] = useState(0);
  const bTotal = 5;
  const bTime = { inhale: 4, hold: 4, exhale: 6 };

  /* ── Write state ── */
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  /* ── Redirect state ── */
  const [activity, setActivity] = useState(() => REDIRECT_ACTIVITIES[Math.floor(Math.random() * REDIRECT_ACTIVITIES.length)]);

  /* ── Completed method ref for reward ── */
  const [completedMethod, setCompletedMethod] = useState<"breathe" | "write" | "redirect">("breathe");

  /* ── Breathing timer ── */
  useEffect(() => {
    if (screen !== "breathe" || bPhase === "ready" || bPhase === "done") return;
    const t = setInterval(() => setBSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [screen, bPhase]);

  useEffect(() => {
    if (screen !== "breathe" || bPhase === "ready" || bPhase === "done") return;
    if (bPhase === "inhale" && bSec >= bTime.inhale) { setBSec(0); setBPhase("hold"); }
    else if (bPhase === "hold" && bSec >= bTime.hold) { setBSec(0); setBPhase("exhale"); }
    else if (bPhase === "exhale" && bSec >= bTime.exhale) {
      if (bCycle + 1 >= bTotal) { setBPhase("done"); finishMethod("breathe"); }
      else { setBCycle((c) => c + 1); setBSec(0); setBPhase("inhale"); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bSec, bPhase, bCycle, screen]);

  const finishMethod = useCallback((m: "breathe" | "write" | "redirect") => {
    setCompletedMethod(m);
    setMethod(m);
    setScreen("reward");
  }, []);

  /* ── Breathing ring ── */
  const ringR = 55;
  const ringC = 2 * Math.PI * ringR;
  const ringPct = bPhase === "inhale" ? bSec / bTime.inhale
    : bPhase === "hold" ? 1
    : bPhase === "exhale" ? 1 - bSec / bTime.exhale : 0;

  const tryAnother = () => {
    let next = activity;
    while (next === activity && REDIRECT_ACTIVITIES.length > 1) {
      next = REDIRECT_ACTIVITIES[Math.floor(Math.random() * REDIRECT_ACTIVITIES.length)];
    }
    setActivity(next);
  };

  /* ── Shared full-screen backdrop ── */
  const backdrop: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(5,5,15,0.94)", backdropFilter: "blur(20px)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: 24, animation: "fadeUp 0.25s ease",
  };

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 18px",
    cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)",
    transition: "background 0.15s",
    width: "100%", maxWidth: 340,
  };

  /* ══════════════════════════════════
     MENU SCREEN
     ══════════════════════════════════ */
  if (screen === "menu") {
    return (
      <div style={backdrop}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 4, fontFamily: "'Fraunces',serif" }}>
            Having an urge?
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 28 }}>
            This will pass. Pick one:
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {/* Breathe */}
            <div style={card} onClick={() => { setScreen("breathe"); setBPhase("inhale"); setBSec(0); setBCycle(0); }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Wind size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>Breathe</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>5-minute guided breathing</div>
                </div>
              </div>
            </div>

            {/* Write */}
            <div style={card} onClick={() => setScreen("write")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PenLine size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>Write it out</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>What triggered this?</div>
                </div>
              </div>
            </div>

            {/* Redirect */}
            <div style={card} onClick={() => setScreen("redirect")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <RotateCcw size={22} color="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>Redirect</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>A quick activity to reset</div>
                </div>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, marginBottom: 20 }}>
            The average urge lasts 10–15 minutes.<br />You can outlast this.
          </p>

          <button onClick={onClose} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.3)",
            fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 4,
          }}>
            <X size={14} /> Close
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     BREATHE SCREEN
     ══════════════════════════════════ */
  if (screen === "breathe") {
    const label = bPhase === "done" ? "Done" : bPhase === "ready" ? "Ready" : bPhase.charAt(0).toUpperCase() + bPhase.slice(1);
    const timeLeft = bPhase === "inhale" ? bTime.inhale - bSec
      : bPhase === "hold" ? bTime.hold - bSec
      : bPhase === "exhale" ? bTime.exhale - bSec : 0;

    return (
      <div style={backdrop}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            Cycle {bCycle + 1} of {bTotal}
          </div>

          {/* Ring */}
          <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 24px" }}>
            <svg width={160} height={160} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={80} cy={80} r={ringR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
              <circle cx={80} cy={80} r={ringR} fill="none" stroke={habit.color} strokeWidth={6}
                strokeDasharray={ringC} strokeDashoffset={ringC * (1 - ringPct)}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.3s linear" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "white", fontFamily: "'Fraunces',serif" }}>{label}</div>
              {bPhase !== "done" && bPhase !== "ready" && (
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{timeLeft}s</div>
              )}
            </div>
          </div>

          {bPhase === "done" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                You made it through.
              </p>
            </div>
          )}

          <button onClick={() => setScreen("menu")} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.25)",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 10,
            display: "inline-flex", alignItems: "center", gap: 2,
          }}>
            <ChevronLeft size={14} strokeWidth={1.5} /> Back
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     WRITE SCREEN
     ══════════════════════════════════ */
  if (screen === "write") {
    return (
      <div style={backdrop}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4, fontFamily: "'Fraunces',serif" }}>
            Write it out
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            What triggered this urge?
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write freely — no one sees this but you..."
            rows={4}
            style={{
              width: "100%", borderRadius: 12, padding: 14, fontSize: 14,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
              color: "white", resize: "none", fontFamily: "inherit", lineHeight: 1.5,
              outline: "none",
            }}
            autoFocus
          />

          {/* Quick tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, justifyContent: "center" }}>
            {URGE_TAGS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button key={tag} onClick={() => setTags((t) => active ? t.filter((x) => x !== tag) : [...t, tag])} style={{
                  fontSize: 12, padding: "5px 12px", borderRadius: 100,
                  background: active ? `${habit.color}25` : "rgba(255,255,255,0.06)",
                  color: active ? habit.color : "rgba(255,255,255,0.5)",
                  border: active ? `1px solid ${habit.color}40` : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                  transition: "all 0.15s",
                }}>
                  {tag}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => finishMethod("write")}
            disabled={!note.trim() && tags.length === 0}
            style={{
              marginTop: 20, padding: "12px 28px", borderRadius: 12,
              background: (note.trim() || tags.length > 0) ? "linear-gradient(135deg,#4caf50,#2e7d32)" : "rgba(255,255,255,0.06)",
              color: (note.trim() || tags.length > 0) ? "white" : "rgba(255,255,255,0.25)",
              border: "none", fontSize: 15, fontWeight: 700,
              cursor: (note.trim() || tags.length > 0) ? "pointer" : "default",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            Done
          </button>

          <div>
            <button onClick={() => setScreen("menu")} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.25)",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 14,
              display: "inline-flex", alignItems: "center", gap: 2,
            }}>
              <ChevronLeft size={14} strokeWidth={1.5} /> Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     REDIRECT SCREEN
     ══════════════════════════════════ */
  if (screen === "redirect") {
    return (
      <div style={backdrop}>
        <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 4, fontFamily: "'Fraunces',serif" }}>
            Try this instead
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
            A quick reset to break the loop.
          </div>

          <div style={{
            ...card,
            margin: "0 auto 28px", padding: "24px 20px", textAlign: "center",
            cursor: "default",
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "white", lineHeight: 1.4 }}>
              {activity}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={tryAnother} style={{
              padding: "11px 20px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <RefreshCw size={14} /> Try another
            </button>
            <button onClick={() => finishMethod("redirect")} style={{
              padding: "11px 20px", borderRadius: 12,
              background: "linear-gradient(135deg,#4caf50,#2e7d32)", color: "white",
              border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Check size={14} strokeWidth={2.5} /> I did it
            </button>
          </div>

          <div>
            <button onClick={() => setScreen("menu")} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.25)",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 18,
              display: "inline-flex", alignItems: "center", gap: 2,
            }}>
              <ChevronLeft size={14} strokeWidth={1.5} /> Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     REWARD SCREEN
     ══════════════════════════════════ */
  const rewardMsg = completedMethod === "breathe"
    ? "You made it through."
    : completedMethod === "write"
    ? "Writing it down takes the power away."
    : "You outlasted the urge.";

  return (
    <div style={backdrop}>
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        {/* Creature with sparkle */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Creature stage={3} color={habit.color} happy size={100} />
          <Sparkles
            size={28} color="#fbbf24"
            strokeWidth={1.5}
            style={{
              position: "absolute", top: -4, right: "calc(50% - 58px)",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 6, fontFamily: "'Fraunces',serif" }}>
          {rewardMsg}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
          Urges beaten today: {urgesToday + 1}
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(74,222,128,0.12)", borderRadius: 100, padding: "8px 18px",
          marginBottom: 28,
        }}>
          <Sparkles size={14} color="#4ade80" />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#4ade80" }}>+3 coins</span>
        </div>

        <div>
          <button
            onClick={() => onComplete({ method: completedMethod, tags: tags.length > 0 ? tags : undefined, note: note.trim() || undefined })}
            style={{
              padding: "12px 28px", borderRadius: 12,
              background: "rgba(255,255,255,0.08)", color: "white",
              border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Back to habits
          </button>
        </div>
      </div>
    </div>
  );
}
