"use client";

import { Creature } from "@/components/creature";
import { Heart, RotateCcw } from "lucide-react";
import { fmtDuration } from "@/lib/utils";
import type { ThemeColors } from "@/lib/constants";

interface RelapseModalProps {
  habit: { name: string; color: string; id: string };
  cleanDays: number;
  bestStreak?: number;
  onConfirm: () => void;
  onClose: () => void;
  th: ThemeColors;
}

const COMPASSION_MESSAGES = [
  "Recovery isn't a straight line. It's a spiral — and you're still moving upward.",
  "The fact that you're here, being honest, shows incredible strength.",
  "A setback doesn't erase your progress. Your body remembers every clean day.",
  "You're not starting over. You're starting from experience.",
  "Falling down is part of the journey. Getting back up is the whole point.",
];

export function RelapseModal({ habit, cleanDays, bestStreak, onConfirm, onClose, th }: RelapseModalProps) {
  // Pick a compassion message deterministically
  const msgIdx = habit.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % COMPASSION_MESSAGES.length;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      animation: "fi .2s ease", padding: 20,
    }}>
      <div style={{
        background: th.modalBg, borderRadius: 22, padding: "28px 24px", maxWidth: 340, width: "100%",
        textAlign: "center", animation: "su .35s cubic-bezier(.16,1,.3,1)",
        border: `1px solid ${th.cardBorder}`,
      }}>
        {/* Creature — always shown happy/neutral, never sad */}
        <Creature stage={Math.min(4, Math.floor(cleanDays / 5))} color={habit.color} happy size={64} />

        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 500, color: th.text, margin: "12px 0 6px" }}>
          It&apos;s okay
        </h2>

        {/* Time survived — warm framing */}
        <p style={{ fontSize: 13, color: th.textSub, lineHeight: 1.6, marginBottom: 8 }}>
          {cleanDays > 0 ? (
            <>
              You went <span style={{ color: "#4ade80", fontWeight: 700 }}>{fmtDuration(cleanDays)}</span> clean.
              {" "}That&apos;s {cleanDays} day{cleanDays !== 1 ? "s" : ""} of healing your body will never forget.
            </>
          ) : (
            "Starting fresh takes real courage. We're here with you."
          )}
        </p>

        {/* Best streak — if they had one */}
        {bestStreak && bestStreak > cleanDays && (
          <p style={{ fontSize: 11, color: th.textMuted, marginBottom: 6 }}>
            Your personal best: {fmtDuration(bestStreak)} — still standing.
          </p>
        )}

        {/* Compassion message */}
        <div style={{
          background: `${habit.color}10`, borderRadius: 12,
          padding: "10px 14px", marginBottom: 14,
          border: `1px solid ${habit.color}18`,
        }}>
          <p style={{ fontSize: 12, color: th.textSub, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
            &ldquo;{COMPASSION_MESSAGES[msgIdx]}&rdquo;
          </p>
        </div>

        {/* Creature keeps growth reassurance */}
        <p style={{ fontSize: 11, color: th.textMuted, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Heart size={10} style={{ color: habit.color }} />
          Your creature keeps all its growth
        </p>

        {/* +5 coins for honesty */}
        <p style={{ fontSize: 11, color: "#fbbf24", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          🪙 +5 coins for your honesty
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${th.cardBorder}`,
              background: "transparent", color: th.textSub, fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            I&apos;m still clean
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: 12, borderRadius: 12, border: "none",
              background: habit.color, color: "white", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <RotateCcw size={13} />
            Reset &amp; restart
          </button>
        </div>
      </div>
    </div>
  );
}
