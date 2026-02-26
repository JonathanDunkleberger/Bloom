"use client";

import { useMemo } from "react";
import { daysAgo, fmtDate } from "@/lib/utils";

interface HeatmapProps {
  getData: (date: string) => number;
  weeks?: number;
  color?: string;
  heatEmpty?: string;
  labelColor?: string;
  legendColor?: string;
}

export function Heatmap({
  getData,
  weeks = 16,
  color = "#4caf50",
  heatEmpty = "rgba(0,0,0,0.025)",
  labelColor = "rgba(0,0,0,0.14)",
  legendColor = "rgba(0,0,0,0.12)",
}: HeatmapProps) {
  const cs = 12;
  const gap = 2;
  const lw = 18;

  const cr = parseInt(color.slice(1, 3), 16) || 76;
  const cg = parseInt(color.slice(3, 5), 16) || 175;
  const cb = parseInt(color.slice(5, 7), 16) || 80;

  const hc = (v: number): string => {
    if (!v || v === 0) return heatEmpty;
    if (v <= 0.25) return `rgba(${cr},${cg},${cb},0.25)`;
    if (v <= 0.5) return `rgba(${cr},${cg},${cb},0.45)`;
    if (v <= 0.75) return `rgba(${cr},${cg},${cb},0.7)`;
    return `rgba(${cr},${cg},${cb},0.95)`;
  };

  const cells = useMemo(() => {
    const result: Array<{ weekIdx: number; dow: number; date: string; val: number }> = [];
    const now = new Date();
    const totalDays = weeks * 7;
    const start = new Date();
    start.setDate(start.getDate() - totalDays + 1);
    const startDow = start.getDay();
    for (let i = 0; i < totalDays; i++) {
      const date = daysAgo(totalDays - 1 - i);
      const d = new Date(date + "T12:00:00");
      if (d > now) continue;
      const dow = d.getDay();
      const weekIdx = Math.floor((i + startDow) / 7);
      result.push({ weekIdx, dow, date, val: getData(date) });
    }
    return result;
  }, [getData, weeks]);

  const maxWeek = cells.length > 0 ? Math.max(...cells.map((c) => c.weekIdx)) : 0;
  const svgW = (maxWeek + 1) * (cs + gap) + lw + 4;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={7 * (cs + gap) + 4} style={{ display: "block", minWidth: svgW }}>
        {["S", "M", "", "W", "", "F", ""].map((d, i) => (
          <text key={i} x={0} y={i * (cs + gap) + cs - 1} fontSize="8" fill={labelColor} fontFamily="inherit">
            {d}
          </text>
        ))}
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.weekIdx * (cs + gap) + lw}
            y={c.dow * (cs + gap)}
            width={cs}
            height={cs}
            rx={3}
            fill={hc(c.val)}
            style={{ transition: "fill 0.3s ease" }}
          >
            <title>
              {fmtDate(c.date)}: {Math.round(c.val * 100)}%
            </title>
          </rect>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, marginTop: 2 }}>
        <span style={{ fontSize: 8, color: legendColor }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2.5, background: hc(v) }} />
        ))}
        <span style={{ fontSize: 8, color: legendColor }}>More</span>
      </div>
    </div>
  );
}
