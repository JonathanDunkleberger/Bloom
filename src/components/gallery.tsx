"use client";

import { Star, LayoutGrid } from "lucide-react";
import { Creature } from "@/components/creature";
import { CoinBadge } from "@/components/milestone-coin";
import { STAGE_LABELS, STAGE_THRESHOLDS } from "@/lib/constants";
import type { ThemeColors } from "@/lib/constants";
import type { HabitWithStats } from "@/types";

interface GalleryProps {
  habits: HabitWithStats[];
  getStage: (id: string) => number;
  getTotal: (id: string) => number;
  isHappy: (id: string) => boolean;
  th: ThemeColors;
  onCreatureTap?: (habitId: string) => void;
  earnedMilestoneCoins?: Record<string, string[]>;
}

export function Gallery({ habits, getStage, getTotal, isHappy, th, onCreatureTap, earnedMilestoneCoins }: GalleryProps) {
  const allCreatures = habits.map((h) => ({
    ...h,
    stage: getStage(h.id),
    total: getTotal(h.id),
    happy: isHappy(h.id),
  }));
  const evolved = allCreatures.filter((c) => c.stage >= 4).length;
  const hatched = allCreatures.filter((c) => c.stage >= 1).length;

  return (
    <div style={{ animation: "fadeUp .28s ease" }}>
      {/* Stats header */}
      <div
        className="cd"
        style={{
          padding: 18, marginBottom: 10, textAlign: "center",
          background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
        }}
      >
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>
          Creature Collection
        </h2>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
          {[
            { l: "Hatched", v: hatched, c: "#4caf50" },
            { l: "Evolved", v: evolved, c: "#FFD700" },
            { l: "Total", v: habits.length, c: th.textSub },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces',serif", color: s.c }}>{s.v}</div>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: ".7px",
                textTransform: "uppercase", color: th.label, marginTop: 2,
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Creatures grid */}
      {habits.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: th.textMuted, fontSize: 13 }}>
          <LayoutGrid size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
          <p>Add habits to start collecting creatures</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {allCreatures.map((c) => (
            <div
              key={c.id}
              className="cd"
              onClick={() => onCreatureTap?.(c.id)}
              style={{
                padding: 16, textAlign: "center",
                background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                border: `1.5px solid ${c.stage >= 4 ? "rgba(255,215,0,.2)" : th.cardBorder}`,
                position: "relative", overflow: "hidden",
                cursor: onCreatureTap ? "pointer" : "default",
              }}
            >
              {c.stage >= 4 && (
                <div style={{
                  position: "absolute", top: 6, right: 8, fontSize: 8, fontWeight: 700,
                  background: "rgba(255,215,0,.1)", color: "#d4a017", padding: "2px 6px",
                  borderRadius: 6, display: "flex", alignItems: "center", gap: 2,
                }}>
                  <Star size={8} fill="#FFD700" />MAX
                </div>
              )}
              <div style={{ animation: "bob 2.5s ease-in-out infinite" }}>
                <Creature stage={c.stage} color={c.color} happy={c.happy} size={60} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: th.text, marginTop: 4 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: th.textSub, marginTop: 1 }}>{STAGE_LABELS[c.stage]}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: s <= c.stage ? c.color : th.progressBg,
                        transition: "background .3s",
                        border: s === c.stage ? `1.5px solid ${c.color}` : "1.5px solid transparent",
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 9, color: th.textMuted, marginTop: 3 }}>{c.total} days completed</div>
                {earnedMilestoneCoins && (earnedMilestoneCoins[c.id] || []).length > 0 && (
                  <div style={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
                    <CoinBadge earnedCoins={earnedMilestoneCoins[c.id]} isQuit={c.category === "quit"} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evolution guide */}
      <div className="cd" style={{ padding: 14, marginTop: 10, background: th.card, borderColor: th.cardBorder }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: ".7px",
          textTransform: "uppercase", color: th.label, marginBottom: 8,
        }}>
          Evolution Guide
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
          {STAGE_LABELS.map((name, i) => (
            <div key={i} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: th.textMuted, marginBottom: 4 }}>{name}</div>
              <div style={{
                fontSize: 16, fontWeight: 700, fontFamily: "'Fraunces',serif",
                color: i === 0 ? th.textMuted : th.text,
              }}>
                {STAGE_THRESHOLDS[i]}d
              </div>
              {i < 4 && <div style={{ fontSize: 8, color: th.textFaint, marginTop: 1 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
