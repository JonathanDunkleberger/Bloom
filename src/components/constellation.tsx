"use client";

import { useMemo } from "react";
import { Sparkles, TrendingUp, Shield, Flame, Heart, Calendar } from "lucide-react";
import { seed, daysAgo } from "@/lib/utils";
import { getSynergyName } from "@/lib/constants";
import type { ThemeColors } from "@/lib/constants";
import type { HabitWithStats } from "@/types";

interface ConstellationProps {
  habits: HabitWithStats[];
  isDone: (id: string, date: string) => boolean;
  getStreak: (id: string) => number;
  getTotal: (id: string) => number;
  getCleanDays?: (id: string) => number;
  isPro?: boolean;
  onUpgrade?: () => void;
  th: ThemeColors;
}

interface Synergy {
  a: number;
  b: number;
  strength: number;
  coCount: number;
  name: string | null;
  label: string;
}

export function Constellation({ habits, isDone, getStreak, getTotal, getCleanDays, isPro, onUpgrade, th }: ConstellationProps) {
  const sr = seed;

  const buildHabits = habits.filter((h) => h.category !== "quit");
  const quitHabits = habits.filter((h) => h.category === "quit");

  // ── Overview stats ──
  const todayStr = new Date().toISOString().slice(0, 10);
  const buildDoneToday = buildHabits.filter((h) => isDone(h.id, todayStr)).length;
  const totalHabitsOnTrack = habits.filter((h) => {
    if (h.category === "quit") return getCleanDays ? getCleanDays(h.id) > 0 : getStreak(h.id) > 0;
    return isDone(h.id, todayStr);
  }).length;
  const weekPct = habits.length ? Math.round((totalHabitsOnTrack / habits.length) * 100) : 0;
  const avgClean = quitHabits.length
    ? Math.round(quitHabits.reduce((sum, h) => sum + (getCleanDays ? getCleanDays(h.id) : getStreak(h.id)), 0) / quitHabits.length)
    : 0;

  // ── Synergies ──
  const synergies = useMemo<Synergy[]>(() => {
    const result: Synergy[] = [];
    if (buildHabits.length < 2) return result;
    const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(i));
    for (let i = 0; i < buildHabits.length; i++) {
      for (let j = i + 1; j < buildHabits.length; j++) {
        const a = buildHabits[i], b = buildHabits[j];
        let coCount = 0;
        last30.forEach((d) => { if (isDone(a.id, d) && isDone(b.id, d)) coCount++; });
        if (coCount >= 3) {
          const name = getSynergyName(a.name, b.name);
          result.push({
            a: i, b: j, strength: Math.min(coCount / 20, 1), coCount, name,
            label: name || `${a.name.slice(0, 8)} × ${b.name.slice(0, 8)}`,
          });
        }
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, isDone]);

  // ── Streak insights ──
  const longestQuitStreak = quitHabits.reduce((best, h) => {
    const s = getCleanDays ? getCleanDays(h.id) : getStreak(h.id);
    return s > best.days ? { days: s, name: h.name } : best;
  }, { days: 0, name: "" });

  const bestBuildStreak = buildHabits.length > 0 ? Math.max(...buildHabits.map((h) => getStreak(h.id))) : 0;
  const bestBuildName = buildHabits.find((h) => getStreak(h.id) === bestBuildStreak)?.name || "";

  // Day-of-week analysis
  const dayOfWeekMisses = useMemo(() => {
    const missByDay = [0, 0, 0, 0, 0, 0, 0];
    const last30 = Array.from({ length: 30 }, (_, i) => daysAgo(i));
    last30.forEach((d) => {
      const dayIdx = new Date(d + "T12:00:00").getDay();
      buildHabits.forEach((h) => {
        if (!isDone(h.id, d)) missByDay[dayIdx]++;
      });
    });
    return missByDay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, isDone]);

  const worstDay = dayOfWeekMisses.indexOf(Math.max(...dayOfWeekMisses));
  const dayNames = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

  // ── Calm advice ──
  const getAdvice = (): string => {
    const justRelapsed = quitHabits.some((h) => (getCleanDays ? getCleanDays(h.id) : getStreak(h.id)) === 0);
    if (justRelapsed) {
      return longestQuitStreak.days > 0
        ? `A slip is not a fall. You've proven you can go ${longestQuitStreak.days} ${longestQuitStreak.days === 1 ? "day" : "days"}. Do it again.`
        : "Starting over takes courage. You're here. That's what matters.";
    }
    const shortQuit = quitHabits.find((h) => {
      const d = getCleanDays ? getCleanDays(h.id) : getStreak(h.id);
      return d > 0 && d < 3;
    });
    if (shortQuit) return "The first 72 hours are the hardest. Your brain is recalibrating. This is temporary.";
    const weekStreak = quitHabits.find((h) => {
      const d = getCleanDays ? getCleanDays(h.id) : getStreak(h.id);
      return d >= 7;
    });
    if (weekStreak) return "One week in. Your neural pathways are physically changing. Don\u2019t stop now.";
    if (totalHabitsOnTrack === habits.length && habits.length > 0) return "You showed up today. That\u2019s what matters.";
    return "Small steps compound. Trust the process.";
  };
  const advice = getAdvice();

  // Constellation positions
  const cx = 160, cy = 140, radius = 90;
  const positions = buildHabits.map((_, i) => {
    const angle = (i / Math.max(buildHabits.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });

  return (
    <div style={{ animation: "fadeUp .28s ease" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>Insights</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Your habits at a glance</p>
      </div>

      {/* ── 1. Overview stats ── */}
      <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: weekPct >= 80 ? "#4caf50" : th.text }}>{weekPct}%</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: th.label, marginTop: 2 }}>On Track</div>
            <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>{totalHabitsOnTrack} of {habits.length}</div>
          </div>
          {quitHabits.length > 0 && (
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>{avgClean}<span style={{ fontSize: 14, fontWeight: 500 }}>d</span></div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: th.label, marginTop: 2 }}>Avg Clean</div>
              <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>{quitHabits.length} quit {quitHabits.length === 1 ? "habit" : "habits"}</div>
            </div>
          )}
          {buildHabits.length > 0 && (
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Fraunces',serif", color: buildDoneToday === buildHabits.length ? "#4caf50" : th.text }}>
                {buildDoneToday}<span style={{ fontSize: 14, fontWeight: 500 }}>/{buildHabits.length}</span>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase", color: th.label, marginTop: 2 }}>Done Today</div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Habit synergies (constellation visual) — Bloom+ only ── */}
      {isPro && buildHabits.length >= 2 && (
        <div className="cd" style={{ overflow: "hidden", marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div style={{ padding: "12px 14px 0" }}>
            <div className="lb" style={{ color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={10} /> Habit Synergies
            </div>
          </div>
          <svg viewBox="0 0 320 280" style={{ width: "100%", display: "block" }}>
            <defs>
              <filter id="cgl"><feGaussianBlur stdDeviation="2.5" /></filter>
              <radialGradient id="cbg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.04" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="320" height="280" fill="url(#cbg)" />
            {Array.from({ length: 25 }).map((_, i) => {
              const r = sr(i * 31 + 7);
              return <circle key={i} cx={r() * 320} cy={r() * 280} r={0.3 + r() * 0.7} fill={th.text} opacity={0.06 + r() * 0.08} />;
            })}
            {synergies.map((syn, i) => {
              const from = positions[syn.a], to = positions[syn.b];
              if (!from || !to) return null;
              return (
                <g key={`syn${i}`}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#8B5CF6" strokeWidth={2 + syn.strength * 3} opacity={syn.strength * 0.15} filter="url(#cgl)" />
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="#8B5CF6" strokeWidth={0.8 + syn.strength * 1.2} opacity={syn.strength * 0.5} strokeLinecap="round">
                    <animate attributeName="opacity" values={`${syn.strength * 0.3};${syn.strength * 0.6};${syn.strength * 0.3}`} dur={`${3 + i}s`} repeatCount="indefinite" />
                  </line>
                </g>
              );
            })}
            {buildHabits.map((h, i) => {
              const pos = positions[i];
              if (!pos) return null;
              const streak = getStreak(h.id);
              const nodeR = 6 + Math.min(streak, 30) * 0.2;
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r={nodeR + 4} fill={h.color} opacity="0.06" />
                  <circle cx={pos.x} cy={pos.y} r={nodeR} fill={h.color} opacity="0.85" />
                  <circle cx={pos.x - nodeR * 0.3} cy={pos.y - nodeR * 0.3} r={nodeR * 0.2} fill="white" opacity="0.25" />
                  <text x={pos.x} y={pos.y + nodeR + 12} textAnchor="middle" fontSize="8" fill={th.text} opacity="0.6" fontWeight="600">{h.name}</text>
                  <text x={pos.x} y={pos.y + nodeR + 21} textAnchor="middle" fontSize="7" fill={th.text} opacity="0.25">{streak}d</text>
                </g>
              );
            })}
          </svg>
          {synergies.length > 0 && (
            <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
              {[...synergies].sort((a, b) => b.strength - a.strength).slice(0, 3).map((syn, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: th.hoverBg }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#8B5CF6", opacity: syn.strength }} />
                  <div style={{ flex: 1, fontSize: 11, color: th.text, fontWeight: 500 }}>{syn.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#8B5CF6", opacity: 0.7 }}>{syn.coCount}d together</div>
                </div>
              ))}
            </div>
          )}
          {synergies.length === 0 && (
            <div style={{ padding: "8px 14px 14px", fontSize: 11, color: th.textMuted, textAlign: "center" }}>
              Complete habits on the same days to form synergies
            </div>
          )}
        </div>
      )}

      {/* ── 3. Streak insights — Bloom+ only ── */}
      {isPro && (
      <div className="cd" style={{ padding: 14, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
        <div className="lb" style={{ marginBottom: 10, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
          <TrendingUp size={10} /> Streak Insights
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {longestQuitStreak.days > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={14} color="#4ade80" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                  Longest quit streak: {longestQuitStreak.days} {longestQuitStreak.days === 1 ? "day" : "days"}
                </div>
                <div style={{ fontSize: 10, color: th.textSub }}>{longestQuitStreak.name}</div>
              </div>
            </div>
          )}
          {bestBuildStreak > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flame size={14} color="#f59e0b" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                  Best build streak: {bestBuildStreak} {bestBuildStreak === 1 ? "day" : "days"}
                </div>
                <div style={{ fontSize: 10, color: th.textSub }}>{bestBuildName}</div>
              </div>
            </div>
          )}
          {buildHabits.length > 0 && dayOfWeekMisses[worstDay] > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={14} color={th.textMuted} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                  You tend to miss habits on {dayNames[worstDay]}
                </div>
                <div style={{ fontSize: 10, color: th.textSub }}>Stay vigilant on that day</div>
              </div>
            </div>
          )}
          {habits.length === 0 && (
            <div style={{ fontSize: 12, color: th.textMuted, textAlign: "center", padding: 10 }}>
              Add habits to see insights
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── 4. Calm advice ── */}
      {habits.length > 0 && (
        <div className="cd" style={{ padding: 16, marginBottom: 10, background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Heart size={16} color={th.textSub} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: th.text, fontWeight: 500, lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>
              &ldquo;{advice}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ── 5. Free-user upgrade card ── */}
      {!isPro && habits.length > 0 && (
        <div className="cd" style={{
          padding: 18,
          marginBottom: 10,
          background: "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.02))",
          borderColor: "rgba(74,222,128,0.25)",
          boxShadow: th.cardShadow,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 4 }}>
            See your full picture
          </div>
          <div style={{ fontSize: 12, color: th.textSub, lineHeight: 1.5, marginBottom: 12 }}>
            Trigger patterns, habit synergies, and day-of-week analysis help you understand what works.
          </div>
          <button
            onClick={() => onUpgrade?.()}
            style={{
              background: "#4ade80",
              color: "#0a0e18",
              border: "none",
              borderRadius: 10,
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Unlock with Bloom+
          </button>
        </div>
      )}
    </div>
  );
}
