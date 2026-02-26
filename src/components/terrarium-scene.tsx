"use client";

import { Sparkles } from "lucide-react";
import { Creature } from "@/components/creature";
import { seed } from "@/lib/utils";
import { SEASONS } from "@/lib/constants";
import type { HabitWithStats } from "@/types";
import type { SeasonKey } from "@/lib/constants";

interface TerrariumSceneProps {
  habits: HabitWithStats[];
  getStage: (id: string) => number;
  isHappy: (id: string) => boolean;
  pct: number;
  bouncingId: string | null;
  season?: SeasonKey;
  darkMode?: boolean;
}

export function TerrariumScene({
  habits, getStage, isHappy, pct, bouncingId,
  season = "summer", darkMode = false,
}: TerrariumSceneProps) {
  const allDone = pct >= 1 && habits.length > 0;
  const half = pct >= 0.5;
  const sn = SEASONS[season] || SEASONS.summer;

  const skyTop = allDone ? sn.skyTop : pct > 0 ? sn.skyTop + "cc" : (darkMode ? "#1a2030" : "#C5D5CB");
  const skyMid = allDone ? sn.skyMid : pct > 0 ? sn.skyMid + "cc" : (darkMode ? "#1a2830" : "#C8CCBA");

  const sr = seed;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "5/4",
        borderRadius: 22,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 40%, #8FBC6B 65%, #6B9E4A 80%, #5A8C3E 100%)`,
        transition: "background 1.5s ease",
        boxShadow: "0 2px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
    >
      <svg
        width="100%" height="100%" viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <radialGradient id="sun">
            <stop offset="0" stopColor="#FFF8DC" stopOpacity="0.9" />
            <stop offset="0.5" stopColor="#FFE4A0" stopOpacity="0.3" />
            <stop offset="1" stopColor="#FFE4A0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sun */}
        {half && (
          <>
            <circle cx="345" cy="42" r={allDone ? 42 : 30} fill="url(#sun)">
              <animate attributeName="r" values={allDone ? "40;46;40" : "28;33;28"} dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="345" cy="42" r="13" fill="#FFF3B5" opacity="0.9" />
          </>
        )}

        {/* Clouds */}
        <g opacity={allDone ? 0.7 : 0.35}>
          <ellipse cx="80" cy="32" rx="30" ry="11" fill="white" opacity="0.6">
            <animate attributeName="cx" values="80;100;80" dur="22s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="68" cy="29" rx="18" ry="8" fill="white" opacity="0.5" />
          <ellipse cx="230" cy="48" rx="24" ry="9" fill="white" opacity="0.4">
            <animate attributeName="cx" values="230;248;230" dur="28s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Background hills */}
        <path d="M0 180 Q60 150 120 170 Q180 145 240 165 Q310 140 400 160 L400 200 L0 200Z" fill="#7BAF56" opacity="0.4" />
        <path d="M0 195 Q80 175 160 190 Q250 170 400 185 L400 210 L0 210Z" fill="#6FA04D" opacity="0.35" />

        {/* Trees */}
        {[50, 130, 250, 340].map((x, i) => {
          const r = sr(i * 71 + 3);
          const h = 18 + r() * 14;
          return (
            <g key={`t${i}`} opacity={0.3 + pct * 0.25}>
              <rect x={x - 1.5} y={190 - h} width="3" height={h} rx="1.5" fill="#6B5344" />
              <ellipse cx={x} cy={190 - h - 6} rx={8 + r() * 5} ry={7 + r() * 4}
                fill={`hsl(${110 + r() * 30},${45 + r() * 15 + pct * 10}%,${35 + r() * 10}%)`} />
              <ellipse cx={x - 3} cy={190 - h - 8} rx={5 + r() * 3} ry={5 + r() * 3}
                fill={`hsl(${115 + r() * 25},${50 + r() * 15}%,${40 + r() * 10}%)`} />
            </g>
          );
        })}

        {/* Ground layers (seasonal) */}
        <path d="M0 230 Q50 215 100 225 Q150 210 200 222 Q270 212 330 220 Q370 216 400 222 L400 320 L0 320Z" fill={sn.ground1} />
        <path d="M0 240 Q80 228 140 238 Q200 225 280 235 Q350 228 400 234 L400 320 L0 320Z" fill={sn.ground2} />
        <path d="M0 255 Q100 245 200 252 Q300 242 400 250 L400 320 L0 320Z" fill={sn.ground3} />
        <path d="M0 295 Q200 290 400 295 L400 320 L0 320Z" fill={sn.dirt} opacity="0.25" />

        {/* Grass blades */}
        {Array.from({ length: 35 + Math.floor(pct * 25) }).map((_, i) => {
          const r = sr(i * 73 + 11);
          const x = r() * 400;
          const by = 245 + r() * 30;
          const h = 6 + r() * 14 + pct * 5;
          const sw = (r() - 0.5) * 5;
          return (
            <line key={`g${i}`} x1={x} y1={by} x2={x + sw} y2={by - h}
              stroke={`hsl(${85 + r() * 40},${40 + r() * 25 + pct * 15}%,${32 + r() * 20}%)`}
              strokeWidth={1 + r() * 1.5} strokeLinecap="round" opacity={0.5 + r() * 0.3} />
          );
        })}

        {/* Flowers (seasonal colors) */}
        {Array.from({ length: Math.floor(pct * 18) }).map((_, i) => {
          const r = sr(i * 199 + 77);
          const x = 15 + r() * 370;
          const y = 250 + r() * 28;
          const fc = sn.flowerColors[Math.floor(r() * sn.flowerColors.length)];
          const ps = 2 + r() * 2;
          return (
            <g key={`f${i}`}>
              <circle cx={x - ps * 0.7} cy={y - ps * 0.5} r={ps * 0.6} fill={fc} opacity={0.7} />
              <circle cx={x + ps * 0.7} cy={y - ps * 0.5} r={ps * 0.6} fill={fc} opacity={0.7} />
              <circle cx={x} cy={y - ps} r={ps * 0.6} fill={fc} opacity={0.7} />
              <circle cx={x} cy={y} r={ps * 0.4} fill="#FFF8DC" />
              <line x1={x} y1={y + ps * 0.5} x2={x} y2={y + 6 + r() * 4}
                stroke="#5A8C3E" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          );
        })}

        {/* Mushrooms */}
        {pct > 0.3 && [120, 310].map((x, i) => {
          const r = sr(i * 311);
          const y = 268 + r() * 15;
          return (
            <g key={`m${i}`} opacity={0.5 + pct * 0.3}>
              <rect x={x - 1} y={y} width="2.5" height="6" rx="1" fill="#F5DEB3" />
              <ellipse cx={x + 0.3} cy={y} rx="5" ry="3.5" fill={i === 0 ? "#FF6B6B" : "#DDA0DD"} />
              <ellipse cx={x - 1.5} cy={y - 0.5} rx="1" ry="0.7" fill="white" opacity="0.6" />
            </g>
          );
        })}

        {/* Rocks */}
        {[70, 190, 330].map((x, i) => {
          const r = sr(i * 137 + 42);
          const y = 265 + r() * 20;
          return (
            <g key={`r${i}`}>
              <ellipse cx={x} cy={y} rx={4 + r() * 5} ry={3 + r() * 3}
                fill={`hsl(35,${12 + r() * 10}%,${60 + r() * 15}%)`} opacity="0.5" />
            </g>
          );
        })}

        {/* Butterfly 1 (50%+) */}
        {half && (
          <g style={{ animation: "float 7s ease-in-out infinite" }}>
            <ellipse cx="70" cy="140" rx="4" ry="3" fill="#FF85A2" opacity="0.65" transform="rotate(-20 70 140)">
              <animate attributeName="rx" values="4;1.5;4" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="78" cy="140" rx="4" ry="3" fill="#FFB6C1" opacity="0.65" transform="rotate(20 78 140)">
              <animate attributeName="rx" values="4;1.5;4" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* Butterfly 2 (100%) */}
        {allDone && (
          <g style={{ animation: "float2 9s ease-in-out infinite" }}>
            <ellipse cx="320" cy="115" rx="3.5" ry="2.5" fill="#B6E3FF" opacity="0.55" transform="rotate(-15 320 115)">
              <animate attributeName="rx" values="3.5;1;3.5" dur="0.35s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="327" cy="115" rx="3.5" ry="2.5" fill="#D4EEFF" opacity="0.55" transform="rotate(15 327 115)">
              <animate attributeName="rx" values="3.5;1;3.5" dur="0.35s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}

        {/* Sparkle particles when all done */}
        {allDone && Array.from({ length: 8 }).map((_, i) => {
          const r = sr(i * 97 + 33);
          const x = 30 + r() * 340;
          const y = 130 + r() * 100;
          return (
            <circle key={`sp${i}`} cx={x} cy={y} r={1 + r() * 1.5} fill="#FFD700" opacity="0.4">
              <animate attributeName="opacity" values={`0.2;${0.5 + r() * 0.4};0.2`} dur={`${1.5 + r() * 2}s`} repeatCount="indefinite" />
              <animate attributeName="cy" values={`${y};${y - 5};${y}`} dur={`${2 + r() * 2}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* ═══ Seasonal particles ═══ */}

        {/* Winter: snowflakes */}
        {season === "winter" && Array.from({ length: 12 + Math.floor(pct * 10) }).map((_, i) => {
          const r = sr(i * 41 + 99);
          const x = r() * 400;
          const startY = -10 - r() * 60;
          return (
            <circle key={`sn${i}`} cx={x} cy={startY} r={1 + r() * 2} fill="white" opacity={0.5 + r() * 0.4}>
              <animate attributeName="cy" values={`${startY};320`} dur={`${4 + r() * 6}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${x};${x + 15 - r() * 30};${x}`} dur={`${3 + r() * 4}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* Spring: falling petals */}
        {season === "spring" && Array.from({ length: 8 + Math.floor(pct * 8) }).map((_, i) => {
          const r = sr(i * 53 + 77);
          const x = r() * 400;
          const startY = -10 - r() * 40;
          return (
            <g key={`pt${i}`} opacity={0.5 + r() * 0.3}>
              <ellipse cx={x} cy={startY} rx={2 + r() * 2} ry={1.5 + r()}
                fill={sn.flowerColors[Math.floor(r() * 5)]}
                transform={`rotate(${r() * 360} ${x} ${startY})`}>
                <animate attributeName="cy" values={`${startY};320`} dur={`${5 + r() * 7}s`} repeatCount="indefinite" />
                <animate attributeName="cx" values={`${x};${x + 20 - r() * 40};${x}`} dur={`${4 + r() * 5}s`} repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate"
                  values={`0 ${x} ${startY};360 ${x} ${startY}`} dur={`${3 + r() * 3}s`} repeatCount="indefinite" />
              </ellipse>
            </g>
          );
        })}

        {/* Autumn: falling leaves */}
        {season === "autumn" && Array.from({ length: 8 + Math.floor(pct * 8) }).map((_, i) => {
          const r = sr(i * 67 + 31);
          const x = r() * 400;
          const startY = -10 - r() * 50;
          const lc = ["#E85D2C", "#D4741C", "#F0A030", "#C44B1A", "#8B4513"][Math.floor(r() * 5)];
          return (
            <g key={`lf${i}`} opacity={0.5 + r() * 0.3}>
              <path d={`M${x} ${startY} Q${x + 3} ${startY - 3} ${x + 2} ${startY - 6} Q${x - 1} ${startY - 3} ${x} ${startY}Z`} fill={lc}>
                <animate attributeName="cy" values={`${startY};320`} dur={`${5 + r() * 6}s`} repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="rotate"
                  values={`0 ${x} ${startY};${180 + r() * 360} ${x} ${startY}`} dur={`${4 + r() * 4}s`} repeatCount="indefinite" />
              </path>
            </g>
          );
        })}

        {/* Summer: fireflies */}
        {season === "summer" && half && Array.from({ length: 5 + Math.floor(pct * 5) }).map((_, i) => {
          const r = sr(i * 89 + 17);
          const x = 30 + r() * 340;
          const y = 100 + r() * 140;
          return (
            <circle key={`ff${i}`} cx={x} cy={y} r={1.5 + r()} fill="#FFFACD" opacity="0">
              <animate attributeName="opacity" values="0;0.7;0" dur={`${2 + r() * 3}s`} repeatCount="indefinite" begin={`${r() * 3}s`} />
            </circle>
          );
        })}
      </svg>

      {/* Creatures */}
      {habits.length > 0 ? (
        <div
          style={{
            position: "absolute", bottom: "12%", left: 0, right: 0,
            display: "flex",
            justifyContent: habits.length <= 3 ? "center" : "space-around",
            alignItems: "flex-end", padding: "0 24px",
            gap: habits.length <= 3 ? 32 : 8,
          }}
        >
          {habits.map((h, i) => {
            const st = getStage(h.id);
            const hp = isHappy(h.id);
            const r = sr(h.id.charCodeAt(0) * 100 + i);
            const mx = habits.length > 6 ? 38 : habits.length > 4 ? 46 : habits.length > 3 ? 54 : 62;
            const sz = Math.min(44 + st * 5, mx);
            const isBouncing = bouncingId === h.id;
            return (
              <div key={h.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                animation: isBouncing ? "none" : `bob ${2.2 + r() * 1.5}s ease-in-out infinite`,
                animationDelay: `${r() * 2}s`,
                filter: hp ? "drop-shadow(0 2px 6px rgba(0,0,0,0.1))" : "none",
              }}>
                <Creature stage={st} color={h.color} happy={hp} size={sz} bounce={isBouncing} />
                <span style={{
                  fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: -1,
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)", maxWidth: 56, textAlign: "center",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{h.name}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Sparkles size={20} color="rgba(255,255,255,0.4)" />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            tap + to hatch your first creature
          </span>
        </div>
      )}

      {/* Glass overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 22,
        background: `linear-gradient(160deg, ${darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"} 0%, transparent 30%)`,
        pointerEvents: "none",
      }} />

      {/* All done banner */}
      {allDone && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)", borderRadius: 100,
          padding: "4px 14px", fontSize: 10, fontWeight: 700, color: "#2d7a3a",
          display: "flex", alignItems: "center", gap: 4, animation: "fadeDown 0.4s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <Sparkles size={11} /> All habits complete!
        </div>
      )}
    </div>
  );
}
