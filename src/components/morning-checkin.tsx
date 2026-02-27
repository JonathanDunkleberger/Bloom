"use client";

import { useState, useRef, useCallback } from "react";
import { Sunrise, ArrowRight, ChevronUp, Sparkles, DollarSign } from "lucide-react";
import { Creature } from "@/components/creature";
import { HEAL, getHealKey } from "@/lib/constants";
import { fmtDuration, fmtMoney } from "@/lib/utils";
import type { HabitWithStats, QuitData } from "@/types";
import type { ThemeColors } from "@/lib/constants";

interface MorningCheckinProps {
  habits: HabitWithStats[];
  quitDataMap: Record<string, QuitData>;
  getCleanDays: (hId: string) => number;
  getStreak: (hId: string) => number;
  isComplete: (hId: string, date: string) => boolean;
  todayStr: string;
  yesterdayStr: string;
  onDismiss: () => void;
  th: ThemeColors;
}

/** Get the current science-based healing fact for a quit habit */
function getHealFact(habitName: string, cleanDays: number): { title: string; desc: string } | null {
  const key = getHealKey(habitName);
  const steps = HEAL[key] || HEAL.default;
  // Find the most recent milestone the user has reached
  let best: { title: string; desc: string } | null = null;
  for (const step of steps) {
    if (cleanDays >= step.d) {
      best = { title: step.t, desc: step.desc };
    }
  }
  return best;
}

/** Get the next upcoming healing milestone */
function getNextMilestone(habitName: string, cleanDays: number): { days: number; title: string } | null {
  const key = getHealKey(habitName);
  const steps = HEAL[key] || HEAL.default;
  for (const step of steps) {
    if (cleanDays < step.d) {
      return { days: step.d, title: step.t };
    }
  }
  return null;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MORNING_MESSAGES = [
  "A new day to grow.",
  "You showed up. That matters.",
  "Small steps, big change.",
  "Your planet is waiting.",
  "Today is yours.",
];

export function MorningCheckin({
  habits, quitDataMap, getCleanDays, getStreak,
  isComplete, todayStr, yesterdayStr, onDismiss, th,
}: MorningCheckinProps) {
  const [dismissing, setDismissing] = useState(false);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const [swipeY, setSwipeY] = useState(0);

  const quitHabits = habits.filter((h) => h.category === "quit");
  const buildHabits = habits.filter((h) => h.category !== "quit");
  const hasQuitHabits = quitHabits.length > 0;

  // Find the quit habit with most clean days for the hero card
  const heroQuit = quitHabits.length > 0
    ? quitHabits.reduce((best, h) => getCleanDays(h.id) > getCleanDays(best.id) ? h : best, quitHabits[0])
    : null;
  const heroCleanDays = heroQuit ? getCleanDays(heroQuit.id) : 0;
  const heroQuitData = heroQuit ? quitDataMap[heroQuit.id] : null;
  const heroFact = heroQuit ? getHealFact(heroQuit.name, heroCleanDays) : null;
  const heroNext = heroQuit ? getNextMilestone(heroQuit.name, heroCleanDays) : null;
  const heroSaved = heroQuitData ? (heroQuitData.dailyCost || 0) * heroCleanDays : 0;

  // Build habits stats
  const yesterdayDone = buildHabits.filter((h) => isComplete(h.id, yesterdayStr)).length;
  const yesterdayTotal = buildHabits.length;
  const bestStreak = buildHabits.length > 0
    ? Math.max(...buildHabits.map((h) => getStreak(h.id)))
    : 0;

  const dayName = DAY_NAMES[new Date().getDay()];
  const msgIdx = todayStr.split("-").reduce((s, n) => s + parseInt(n), 0) % MORNING_MESSAGES.length;

  const handleDismiss = useCallback(() => {
    setDismissing(true);
    setTimeout(onDismiss, 350);
  }, [onDismiss]);

  // Swipe-to-dismiss
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const dy = touchStartY.current - touchCurrentY.current;
    if (dy > 0) setSwipeY(Math.min(dy * 0.5, 120));
  }, []);

  const onTouchEnd = useCallback(() => {
    const dy = touchStartY.current - touchCurrentY.current;
    if (dy > 80) {
      handleDismiss();
    } else {
      setSwipeY(0);
    }
  }, [handleDismiss]);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "fixed", inset: 0, zIndex: 9990,
        background: "linear-gradient(180deg, #0a0e1a 0%, #121828 40%, #1a2040 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "24px 20px",
        animation: dismissing ? "checkinOut .35s ease forwards" : "fi .3s ease",
        transform: swipeY > 0 ? `translateY(-${swipeY}px)` : undefined,
        opacity: dismissing ? undefined : swipeY > 0 ? Math.max(0, 1 - swipeY / 150) : 1,
        transition: swipeY === 0 && !dismissing ? "transform .2s ease, opacity .2s ease" : undefined,
        overflow: "hidden",
      }}
    >
      {/* Stars background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 30 }).map((_, i) => {
          const x = ((i * 37 + 13) % 100);
          const y = ((i * 59 + 7) % 100);
          const s = 1 + (i % 3) * 0.5;
          const delay = (i * 0.3) % 3;
          return (
            <div key={i} style={{
              position: "absolute", left: `${x}%`, top: `${y}%`,
              width: s, height: s, borderRadius: "50%", background: "white",
              opacity: 0.15 + (i % 4) * 0.1,
              animation: `sparkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }} />
          );
        })}
      </div>

      {/* Top: Day & greeting */}
      <div style={{
        textAlign: "center", marginBottom: 28, position: "relative",
        animation: "fadeUp .5s ease .1s both",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.06)", borderRadius: 20,
          padding: "6px 14px", marginBottom: 12,
        }}>
          <Sunrise size={14} style={{ color: "#fbbf24" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: 1, textTransform: "uppercase" }}>
            {dayName}
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500,
          color: "white", margin: 0, lineHeight: 1.3,
        }}>
          {MORNING_MESSAGES[msgIdx]}
        </h1>
      </div>

      {/* ── QUIT USERS: Hero clean days card ── */}
      {hasQuitHabits && heroQuit && (
        <div style={{
          width: "100%", maxWidth: 340, animation: "fadeUp .5s ease .2s both",
        }}>
          {/* Big day count */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Creature stage={Math.min(4, Math.floor(heroCleanDays / 5))} color={heroQuit.color} happy size={48} />
            <div style={{
              fontFamily: "'Fraunces',serif", fontSize: 64, fontWeight: 700,
              color: "white", lineHeight: 1, marginTop: 8,
            }}>
              {heroCleanDays}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              day{heroCleanDays !== 1 ? "s" : ""} clean — {heroQuit.name}
            </div>
          </div>

          {/* Science fact card */}
          {heroFact && (
            <div style={{
              background: "rgba(255,255,255,0.06)", borderRadius: 16,
              padding: "14px 16px", marginBottom: 10,
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={12} />
                {heroFact.title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                {heroFact.desc}
              </div>
            </div>
          )}

          {/* Next milestone + money saved row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {heroNext && (
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12,
                padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Next milestone
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
                  Day {heroNext.days}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {heroNext.days - heroCleanDays} day{heroNext.days - heroCleanDays !== 1 ? "s" : ""} away
                </div>
              </div>
            )}
            {heroSaved > 0 && (
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12,
                padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Money saved
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
                  <DollarSign size={12} />
                  {fmtMoney(heroSaved)}
                </div>
              </div>
            )}
          </div>

          {/* CTA: I'm still clean */}
          <button
            onClick={handleDismiss}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 16,
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              border: "none", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700,
              color: "#052e16", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(74,222,128,0.3)",
            }}
          >
            I&apos;m still clean
            <ArrowRight size={16} />
          </button>

          {/* Other quit habits summary */}
          {quitHabits.length > 1 && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                +{quitHabits.length - 1} other quit habit{quitHabits.length - 1 !== 1 ? "s" : ""} tracked
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── BUILD USERS: Habits summary card ── */}
      {!hasQuitHabits && buildHabits.length > 0 && (
        <div style={{
          width: "100%", maxWidth: 340, animation: "fadeUp .5s ease .2s both",
        }}>
          {/* Yesterday summary */}
          <div style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 16,
            padding: "16px 18px", marginBottom: 12,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Yesterday
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 700, color: "white" }}>
                {yesterdayDone}/{yesterdayTotal}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                habits completed
              </span>
            </div>
            {yesterdayDone === yesterdayTotal && yesterdayTotal > 0 && (
              <div style={{ fontSize: 12, color: "#4ade80", marginTop: 4 }}>
                ✨ Perfect day!
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12,
              padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Habits today
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "white" }}>
                {buildHabits.length}
              </div>
            </div>
            {bestStreak > 0 && (
              <div style={{
                flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12,
                padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Best streak
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fbbf24" }}>
                  {bestStreak}🔥
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleDismiss}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 16,
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              border: "none", cursor: "pointer",
              fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700,
              color: "#052e16", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8,
              boxShadow: "0 4px 20px rgba(74,222,128,0.3)",
            }}
          >
            Let&apos;s go
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Mixed users: show quit hero with build summary below */}
      {hasQuitHabits && buildHabits.length > 0 && (
        <div style={{
          textAlign: "center", marginTop: 10,
          animation: "fadeUp .5s ease .4s both",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {yesterdayDone}/{yesterdayTotal} build habits done yesterday
            {bestStreak > 0 && ` · ${bestStreak}🔥 streak`}
          </div>
        </div>
      )}

      {/* Swipe hint */}
      <div style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        animation: "fadeUp .5s ease .5s both",
      }}>
        <ChevronUp size={16} style={{ color: "rgba(255,255,255,0.2)", animation: "bob 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>swipe up or tap</span>
      </div>

      {/* +2 coins badge */}
      <div style={{
        position: "absolute", top: 20, right: 20,
        background: "rgba(245,158,11,0.15)", borderRadius: 12,
        padding: "4px 10px", display: "flex", alignItems: "center", gap: 4,
        animation: "fadeUp .5s ease .3s both",
      }}>
        <span style={{ fontSize: 12 }}>🪙</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24" }}>+2</span>
      </div>
    </div>
  );
}
