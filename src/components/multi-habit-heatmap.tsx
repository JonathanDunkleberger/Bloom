"use client";

import { useMemo } from "react";
import { daysAgo } from "@/lib/utils";
import type { HabitWithStats } from "@/types";
import type { ThemeColors } from "@/lib/constants";

interface MultiHabitHeatmapProps {
  habits: HabitWithStats[];
  isDone: (id: string, date: string) => boolean;
  getCleanDays?: (id: string) => number;
  th: ThemeColors;
}

export function MultiHabitHeatmap({ habits, isDone, getCleanDays, th }: MultiHabitHeatmapProps) {
  const weeks = 12;
  const cellSize = 8;
  const cellGap = 2;
  const colGap = 16;
  const totalDays = weeks * 7;

  const columns = useMemo(() => {
    return habits.map((h) => {
      const isQuit = h.category === "quit";
      const cleanDays = isQuit && getCleanDays ? getCleanDays(h.id) : 0;
      const days: { date: string; done: boolean; isToday: boolean; isFuture: boolean }[] = [];

      for (let i = 0; i < totalDays; i++) {
        const date = daysAgo(i);
        const now = new Date();
        const d = new Date(date + "T12:00:00");
        const isFuture = d > now;
        const isToday = i === 0;
        let done = false;

        if (isQuit) {
          // For quit habits, a day is "done" if it falls within the clean period
          done = cleanDays > i;
        } else {
          done = isDone(h.id, date);
        }

        days.push({ date, done, isToday, isFuture });
      }

      // Abbreviate habit name to max 4 chars
      const abbr = h.name.length > 4 ? h.name.slice(0, 4) : h.name;

      return { habit: h, days, abbr };
    });
  }, [habits, isDone, getCleanDays, totalDays]);

  if (habits.length === 0) return null;

  const cr = (hex: string) => {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!match) return { r: 76, g: 175, b: 80 };
    return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
  };

  return (
    <div className="cd" style={{
      padding: "14px 12px", marginBottom: 10,
      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
        textTransform: "uppercase" as const, color: "rgba(255,255,255,0.25)",
        marginBottom: 10, paddingLeft: 2,
      }}>
        All Habits
      </div>
      <div style={{
        overflowX: habits.length > 6 ? "auto" : "visible",
        paddingBottom: 4,
      }}>
        <div style={{
          display: "flex",
          gap: colGap,
          justifyContent: habits.length <= 6 ? "center" : "flex-start",
          minWidth: "fit-content",
        }}>
          {columns.map(({ habit, days, abbr }) => {
            const { r, g, b } = cr(habit.color);
            return (
              <div key={habit.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Color dot */}
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: habit.color, marginBottom: 3,
                }} />
                {/* Abbreviated name */}
                <div style={{
                  fontSize: 9, fontWeight: 600, color: habit.color,
                  marginBottom: 6, lineHeight: 1,
                }}>
                  {abbr}
                </div>
                {/* Vertical column of cells — today at top, oldest at bottom */}
                <div style={{ display: "flex", flexDirection: "column", gap: cellGap }}>
                  {days.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        width: cellSize, height: cellSize, borderRadius: 2,
                        background: d.isFuture
                          ? "transparent"
                          : d.done
                            ? `rgba(${r},${g},${b},1)`
                            : `rgba(${r},${g},${b},0.08)`,
                        border: d.isToday ? `1px solid ${habit.color}` : "none",
                        boxSizing: "border-box" as const,
                      }}
                      title={`${d.date}: ${d.done ? "✓" : "—"}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
