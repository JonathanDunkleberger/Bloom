"use client";

import { Sparkles } from "lucide-react";
import { seed } from "@/lib/utils";
import { SEASONS } from "@/lib/constants";
import { PlanetItem } from "@/components/planet-items";
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
  ownedItems?: string[];
}

export function TerrariumScene({
  habits, getStage, isHappy, pct, bouncingId,
  season = "summer", darkMode = false, ownedItems = [],
}: TerrariumSceneProps) {
  const allDone = pct >= 1 && habits.length > 0;
  const half = pct >= 0.5;
  const sn = SEASONS[season] || SEASONS.summer;
  const sr = seed;

  // Planet center & radius — scales with habit count and progress
  const cx = 200, cy = 190;
  const baseRadius = 85;
  const habitBonus = Math.min(habits.length * 3, 25);
  const progressBonus = pct * 10;
  const pr = baseRadius + habitBonus + progressBonus;

  // Distribute creatures evenly around the top arc of planet
  const creatureAngles = habits.map((_, i) => {
    const spread = habits.length <= 3 ? 90
      : habits.length <= 5 ? 150
      : 200;
    const start = -90 - spread / 2;
    return start + (habits.length === 1 ? 0 : i * (spread / (habits.length - 1)));
  });

  // Season-based planet colors
  const planetColors: Record<string, { base: string; mid: string; dark: string; accent: string }> = {
    spring: { base: "#7BC862", mid: "#6AB854", dark: "#4A9038", accent: "#E8A0BF" },
    summer: { base: "#6DBF40", mid: "#5CAF30", dark: "#4A8C28", accent: "#FFD700" },
    autumn: { base: "#B8944E", mid: "#A08340", dark: "#7D6A2A", accent: "#E85D2C" },
    winter: { base: "#A0B8A0", mid: "#8BA88B", dark: "#6E906E", accent: "#B8D4F0" },
  };
  const pc = planetColors[season] || planetColors.summer;

  // Sky gradient based on season
  const skyColors: Record<string, string[]> = {
    spring: ["#1a1030", "#2a1848", "#3a2060"],
    summer: ["#0a1628", "#0f1e3a", "#142850"],
    autumn: ["#1a1018", "#2a1820", "#3a2028"],
    winter: ["#0e1520", "#141e2e", "#1a2838"],
  };
  const sky = skyColors[season] || skyColors.summer;

  return (
    <div style={{
      position: "relative", width: "100%",
      aspectRatio: `4 / ${3 + Math.min(habits.length * 0.05, 0.4)}`,
      borderRadius: 22, overflow: "hidden",
      background: `radial-gradient(ellipse at 50% 60%, ${sky[2]} 0%, ${sky[1]} 40%, ${sky[0]} 100%)`,
      transition: "background 1.5s ease",
      boxShadow: "0 2px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
    }}>
      <svg width="100%" height="100%" viewBox="0 0 400 350" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="lp-planet" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor={pc.base} />
            <stop offset="60%" stopColor={pc.mid} />
            <stop offset="100%" stopColor={pc.dark} />
          </radialGradient>
          <radialGradient id="lp-atmo" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor={pc.accent} stopOpacity={0} />
            <stop offset="100%" stopColor={pc.accent} stopOpacity={0.08 + pct * 0.12} />
          </radialGradient>
          <radialGradient id="lp-glow" cx="50%" cy="55%" r="45%">
            <stop offset="0%" stopColor={pc.base} stopOpacity={0.06 + pct * 0.1} />
            <stop offset="100%" stopColor={pc.base} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="lp-moon" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFDE8" />
            <stop offset="100%" stopColor="#E8E0D0" />
          </radialGradient>
          <filter id="lp-soft"><feGaussianBlur stdDeviation="1.5" /></filter>
        </defs>

        {/* ── STARFIELD ── */}
        {Array.from({ length: 40 + Math.floor(pct * 30) }).map((_, i) => {
          const r = sr(i * 37 + 7);
          const sx = r() * 400, sy = r() * 350;
          const sz = 0.4 + r() * (pct > 0.5 ? 1.4 : 0.8);
          return (
            <circle key={`s${i}`} cx={sx} cy={sy} r={sz} fill="white" opacity={0.15 + r() * 0.45}>
              <animate attributeName="opacity" values={`${0.1 + r() * 0.2};${0.4 + r() * 0.4};${0.1 + r() * 0.2}`} dur={`${2 + r() * 4}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* ── DISTANT NEBULA (visible when progress > 30%) ── */}
        {pct > 0.3 && (
          <>
            <ellipse cx="340" cy="60" rx={30 + pct * 15} ry={18 + pct * 8} fill={pc.accent} opacity={0.03 + pct * 0.04} filter="url(#lp-soft)" />
            <ellipse cx="60" cy="260" rx={20 + pct * 10} ry={15 + pct * 6} fill="#8B5CF6" opacity={0.02 + pct * 0.03} filter="url(#lp-soft)" />
          </>
        )}

        {/* ── SHOOTING STARS (all done) ── */}
        {allDone && Array.from({ length: 3 }).map((_, i) => {
          const r = sr(i * 131 + 55);
          const sx = 50 + r() * 300, sy = 20 + r() * 80;
          return (
            <g key={`sh${i}`} opacity={0}>
              <line x1={sx} y1={sy} x2={sx + 25} y2={sy + 12} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1={sx + 15} y1={sy + 7} x2={sx + 25} y2={sy + 12} stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              <animate attributeName="opacity" values="0;0;0.8;0" dur={`${3 + r() * 2}s`} repeatCount="indefinite" begin={`${r() * 4}s`} />
            </g>
          );
        })}

        {/* ── MOON ── */}
        <g style={{ animation: "float 20s ease-in-out infinite" }}>
          <circle cx="340" cy="55" r={half ? 16 : 12} fill="url(#lp-moon)" opacity={half ? 0.9 : 0.5}>
            <animate attributeName="r" values={half ? "15;17;15" : "11;13;11"} dur="6s" repeatCount="indefinite" />
          </circle>
          {/* Moon craters */}
          <circle cx="335" cy="52" r="2.5" fill="#D4CCC0" opacity="0.35" />
          <circle cx="344" cy="58" r="1.8" fill="#D4CCC0" opacity="0.3" />
          <circle cx="338" cy="60" r="1.2" fill="#D4CCC0" opacity="0.25" />
          {/* Moon glow */}
          <circle cx="340" cy="55" r={half ? 24 : 16} fill="#FFFDE8" opacity={half ? 0.06 : 0.02} />
        </g>

        {/* ── ORBITAL RING ── */}
        <ellipse cx={cx} cy={cy + 10} rx={pr + 38} ry={12 + pct * 4} fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="0.8" strokeDasharray="4 6">
          <animate attributeName="ry" values={`${12 + pct * 4};${14 + pct * 4};${12 + pct * 4}`} dur="8s" repeatCount="indefinite" />
        </ellipse>
        {/* Small orbital dots */}
        {pct > 0.5 && [0, 120, 240].map((deg, i) => (
          <circle key={`od${i}`} cx={cx + Math.cos(deg * Math.PI / 180) * (pr + 36)} cy={cy + 10 + Math.sin(deg * Math.PI / 180) * 12}
            r="1.2" fill="white" opacity="0.15">
            <animateTransform attributeName="transform" type="rotate" from={`${deg} ${cx} ${cy + 10}`} to={`${deg + 360} ${cx} ${cy + 10}`} dur={`${20 + i * 5}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* ── PLANET GLOW ── */}
        <circle cx={cx} cy={cy} r={pr + 25} fill="url(#lp-glow)" />

        {/* ── PLANET BODY ── */}
        <circle cx={cx} cy={cy} r={pr} fill="url(#lp-planet)" />
        {/* Surface texture patches */}
        {Array.from({ length: 5 + Math.floor(pct * 4) }).map((_, i) => {
          const r = sr(i * 53 + 19);
          const angle = r() * 360 * Math.PI / 180;
          const dist = r() * pr * 0.65;
          const px = cx + Math.cos(angle) * dist, py = cy + Math.sin(angle) * dist;
          return <circle key={`pt${i}`} cx={px} cy={py} r={4 + r() * 8} fill={r() > 0.5 ? pc.base : pc.dark} opacity={0.2 + r() * 0.15} />;
        })}

        {/* ── SURFACE DETAILS: grass, flowers along top arc ── */}
        {Array.from({ length: 28 + Math.floor(pct * 24) }).map((_, i) => {
          const r = sr(i * 47 + 33);
          const angle = (-140 + r() * 280) * Math.PI / 180;
          const sx = cx + Math.cos(angle) * (pr - 1), sy = cy + Math.sin(angle) * (pr - 1);
          const h = 3 + r() * 6 + pct * 3;
          return (
            <line key={`gr${i}`} x1={sx} y1={sy}
              x2={sx + Math.cos(angle - Math.PI / 2 + (r() - 0.5) * 0.3) * h}
              y2={sy + Math.sin(angle - Math.PI / 2 + (r() - 0.5) * 0.3) * h}
              stroke={`hsl(${season === "autumn" ? 40 + r() * 30 : 90 + r() * 40}, ${40 + r() * 25 + pct * 15}%, ${season === "winter" ? 50 + r() * 20 : 28 + r() * 18}%)`}
              strokeWidth={0.8 + r() * 1} strokeLinecap="round" opacity={0.4 + r() * 0.3 + pct * 0.2} />
          );
        })}

        {/* Flowers on surface */}
        {Array.from({ length: Math.floor(pct * 16) }).map((_, i) => {
          const r = sr(i * 89 + 51);
          const angle = (-120 + r() * 240) * Math.PI / 180;
          const fx = cx + Math.cos(angle) * (pr + 1), fy = cy + Math.sin(angle) * (pr + 1);
          const fc = sn.flowerColors[Math.floor(r() * sn.flowerColors.length)];
          return (
            <g key={`fl${i}`}>
              <circle cx={fx} cy={fy} r={1.5 + r() * 1.5} fill={fc} opacity={0.7 + r() * 0.2} />
              <circle cx={fx} cy={fy} r={0.6 + r() * 0.4} fill="#FFF8DC" opacity="0.8" />
            </g>
          );
        })}

        {/* ── OWNED SHOP ITEMS on planet surface ── */}
        {ownedItems.map((itemId, i) => {
          const r = sr(itemId.charCodeAt(0) * 17 + i * 73);
          const angle = (-140 + r() * 280) * Math.PI / 180;
          const ix = cx + Math.cos(angle) * (pr + 1);
          const iy = cy + Math.sin(angle) * (pr + 1);
          const rotDeg = (angle * 180 / Math.PI) + 90;
          return (
            <PlanetItem key={itemId} id={itemId} x={ix} y={iy} rotation={rotDeg} scale={0.8} />
          );
        })}

        {/* ── TREE (grows with progress) ── */}
        {pct > 0 && (() => {
          const treeAngle = -90 * Math.PI / 180;
          const tx = cx + Math.cos(treeAngle) * pr;
          const ty = cy + Math.sin(treeAngle) * pr;
          const treeH = 8 + pct * 22;
          const canopyR = 5 + pct * 14;
          return (
            <g>
              {/* Trunk */}
              <rect x={tx - 1.5 - pct} y={ty - treeH} width={3 + pct * 2} height={treeH} rx={1.5} fill="#6B5344" />
              <rect x={tx - 0.8 - pct * 0.5} y={ty - treeH + 2} width={1.6 + pct} height={treeH - 2} rx={1} fill="#7B6354" opacity="0.6" />
              {/* Canopy layers */}
              <ellipse cx={tx} cy={ty - treeH - canopyR * 0.3} rx={canopyR} ry={canopyR * 0.8} fill={pc.mid} />
              <ellipse cx={tx - canopyR * 0.35} cy={ty - treeH - canopyR * 0.55} rx={canopyR * 0.7} ry={canopyR * 0.6} fill={pc.base} />
              <ellipse cx={tx + canopyR * 0.3} cy={ty - treeH - canopyR * 0.2} rx={canopyR * 0.6} ry={canopyR * 0.55} fill={pc.mid} opacity="0.8" />
              {/* Fruit / flowers in tree */}
              {pct > 0.3 && sn.flowerColors.slice(0, 3).map((fc, fi) => {
                const r = sr(fi * 41 + 99);
                const fx = tx + (r() - 0.5) * canopyR * 1.4;
                const fy = ty - treeH - canopyR * 0.3 + (r() - 0.5) * canopyR * 0.8;
                return <circle key={`tf${fi}`} cx={fx} cy={fy} r={1.5 + r() * 1.5} fill={fc} opacity={0.6 + r() * 0.3} />;
              })}
            </g>
          );
        })()}

        {/* ── ATMOSPHERE RIM ── */}
        <circle cx={cx} cy={cy} r={pr} fill="url(#lp-atmo)" />
        <circle cx={cx} cy={cy} r={pr + 1.5} fill="none" stroke={pc.accent} strokeWidth="1" opacity={0.06 + pct * 0.08} />
        <circle cx={cx} cy={cy} r={pr + 3} fill="none" stroke={pc.accent} strokeWidth="0.5" opacity={0.03 + pct * 0.04} />

        {/* ── CREATURES walking on planet surface ── */}
        {habits.map((h, i) => {
          const st = getStage(h.id);
          const hp = isHappy(h.id);
          const isBouncing = bouncingId === h.id;
          const r = sr(h.id.charCodeAt(0) * 100 + i);

          const angleDeg = creatureAngles[i] || -90;
          const angleRad = angleDeg * Math.PI / 180;
          const px = cx + Math.cos(angleRad) * (pr + 2);
          const py = cy + Math.sin(angleRad) * (pr + 2);
          const rotDeg = angleDeg + 90;

          const mx = habits.length > 6 ? 36 : habits.length > 4 ? 42 : habits.length > 3 ? 50 : 58;
          const stageSizes = [26, 26, 30, 34, 40];
          const sz = habits.length >= 8 ? Math.max(20, stageSizes[st] * 0.7) : Math.min(stageSizes[st], mx);
          const scale = sz / 52;

          // Stage 0 = egg
          if (st === 0) {
            const eggW = habits.length >= 8 ? 16 : 22;
            const eggH = habits.length >= 8 ? 20 : 28;
            const eggScale = eggH / 52;
            return (
              <g key={h.id} transform={`translate(${px}, ${py}) rotate(${rotDeg})`}>
                {/* Glow circle */}
                <circle cx="0" cy={-eggH / 2} r={eggH * 0.75} fill={h.color} opacity="0.1" />
                <g style={{
                  animation: `pulse 2.5s ease-in-out infinite`,
                  animationDelay: `${r() * 2}s`,
                }}>
                  <g transform={`translate(0, ${-eggH / 2 - 2}) scale(${eggScale})`}>
                    {/* Egg body */}
                    <ellipse cx="0" cy="0" rx="7" ry="9" fill={h.color} />
                    <ellipse cx="0" cy="-2" rx="5" ry="5.5" fill="white" opacity="0.15" />
                    {/* Egg shine */}
                    <ellipse cx="-2" cy="-3" rx="1.5" ry="2.5" fill="white" opacity="0.25" transform="rotate(-15)" />
                    {/* Subtle crack lines for anticipation */}
                    <path d="M-1.5 3 L0 1 L1.5 3.5" stroke={h.color} strokeWidth="0.6" fill="none" opacity="0.3" filter="url(#lp-soft)" />
                  </g>
                  {/* Name label — horizontal (counter-rotate) */}
                  <text y={eggH / 2 + 8} textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.7)" fontWeight="600"
                    transform={`rotate(${-rotDeg})`}
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{h.name}</text>
                </g>
              </g>
            );
          }

          return (
            <g key={h.id} transform={`translate(${px}, ${py}) rotate(${rotDeg})`}>
              {/* Glow circle underneath */}
              <circle cx="0" cy={-sz / 2} r={sz * 0.75} fill={h.color} opacity="0.1" />
              <g style={{
                animation: isBouncing ? "none" : `bob ${2.2 + r() * 1.5}s ease-in-out infinite`,
                animationDelay: `${r() * 2}s`,
              }}>
                <g transform={`translate(0, ${-sz / 2 - 2}) scale(${scale})`}>
                  {/* Inline mini creature */}
                  <ellipse cx="0" cy="0" rx={6 + st * 2.5} ry={5 + st * 2} fill={h.color} />
                  <ellipse cx="0" cy="-1" rx={(6 + st * 2.5) * 0.85} ry={(5 + st * 2) * 0.7} fill={h.color + "88"} opacity="0.3" />
                  {/* Eyes */}
                  <circle cx={-(3 + st * 0.5)} cy={-(1 + st * 0.2)} r={1.8 + st * 0.2} fill="#1a1a2e" />
                  <circle cx={3 + st * 0.5} cy={-(1 + st * 0.2)} r={1.8 + st * 0.2} fill="#1a1a2e" />
                  <circle cx={-(2.5 + st * 0.4)} cy={-(2 + st * 0.3)} r={0.7} fill="white" />
                  <circle cx={3.5 + st * 0.4} cy={-(2 + st * 0.3)} r={0.7} fill="white" />
                  {/* Blush — visible when happy, hidden when neutral */}
                  <ellipse cx={-(5 + st * 0.5)} cy={1} rx="2" ry="1.2" fill={h.color + "88"} opacity={hp ? 0.4 : 0} />
                  <ellipse cx={5 + st * 0.5} cy={1} rx="2" ry="1.2" fill={h.color + "88"} opacity={hp ? 0.4 : 0} />
                  {/* Mouth */}
                  {hp
                    ? <path d={`M-2 ${2 + st * 0.2} Q0 ${5 + st * 0.3} 2 ${2 + st * 0.2}`} stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    : <ellipse cx="0" cy={3 + st * 0.1} rx="1.2" ry="0.8" fill="#1a1a2e" />}
                  {/* Happy sparkles — only when happy */}
                  {hp && (
                    <>
                      <circle cx={-(8 + st)} cy={-(5 + st)} r="1" fill="#FFD700" opacity="0.5">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={8 + st} cy={-(6 + st)} r="0.8" fill="#FFD700" opacity="0.4">
                        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}
                  {/* Crown for evolved */}
                  {st >= 4 && <path d="M-5,-8 L-3,-14 L0,-10 L3,-14 L5,-8Z" fill="#FFD700" opacity="0.7" />}
                </g>
                {/* Name label — horizontal (counter-rotate) */}
                <text y={sz / 2 + 8} textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.7)" fontWeight="600"
                  transform={`rotate(${-rotDeg})`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{h.name}</text>
              </g>
            </g>
          );
        })}

        {/* ── SEASONAL PARTICLES in space around planet ── */}
        {season === "winter" && Array.from({ length: 15 + Math.floor(pct * 10) }).map((_, i) => {
          const r = sr(i * 41 + 99);
          const x = r() * 400, startY = -10 - r() * 60;
          return (
            <circle key={`sn${i}`} cx={x} cy={startY} r={1 + r() * 1.5} fill="white" opacity={0.3 + r() * 0.3}>
              <animate attributeName="cy" values={`${startY};350`} dur={`${5 + r() * 7}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${x};${x + 10 - r() * 20};${x}`} dur={`${4 + r() * 5}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
        {season === "spring" && Array.from({ length: 10 + Math.floor(pct * 8) }).map((_, i) => {
          const r = sr(i * 53 + 77);
          const x = r() * 400, startY = -10 - r() * 40;
          return (
            <ellipse key={`pt${i}`} cx={x} cy={startY} rx={1.5 + r() * 1.5} ry={1 + r()} fill={sn.flowerColors[Math.floor(r() * 5)]}
              opacity={0.3 + r() * 0.25}>
              <animate attributeName="cy" values={`${startY};350`} dur={`${6 + r() * 8}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${x};${x + 15 - r() * 30};${x}`} dur={`${5 + r() * 5}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate" values={`0 ${x} ${startY};360 ${x} ${startY}`} dur={`${3 + r() * 3}s`} repeatCount="indefinite" />
            </ellipse>
          );
        })}
        {season === "autumn" && Array.from({ length: 10 + Math.floor(pct * 8) }).map((_, i) => {
          const r = sr(i * 67 + 31);
          const x = r() * 400, startY = -10 - r() * 50;
          const lc = sn.flowerColors[Math.floor(r() * 5)];
          return (
            <path key={`lf${i}`} d={`M${x},${startY} q2,-3 1,-5 q-2,1 -1,5z`} fill={lc} opacity={0.3 + r() * 0.25}>
              <animate attributeName="cy" values={`${startY};350`} dur={`${5 + r() * 7}s`} repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="rotate" values={`0 ${x} ${startY};360 ${x} ${startY}`} dur={`${4 + r() * 4}s`} repeatCount="indefinite" />
            </path>
          );
        })}
        {season === "summer" && half && Array.from({ length: 6 + Math.floor(pct * 6) }).map((_, i) => {
          const r = sr(i * 89 + 17);
          const x = 40 + r() * 320, y = 40 + r() * 240;
          return (
            <circle key={`ff${i}`} cx={x} cy={y} r={1 + r() * 1.5} fill="#FFFACD" opacity={0}>
              <animate attributeName="opacity" values="0;0.5;0" dur={`${2 + r() * 3}s`} repeatCount="indefinite" begin={`${r() * 4}s`} />
            </circle>
          );
        })}

        {/* ── PLANET SHADOW (floating effect) ── */}
        <ellipse cx={cx} cy={cy + pr + 35} rx={pr * 0.55} ry={5 + pct * 2} fill="rgba(255,255,255,0.02)">
          <animate attributeName="ry" values={`${5 + pct * 2};${3 + pct * 2};${5 + pct * 2}`} dur="5s" repeatCount="indefinite" />
        </ellipse>

        {/* ── AURORA (all complete) ── */}
        {allDone && (
          <>
            <path d="M60,25 Q130,10 200,20 Q270,30 340,15" fill="none" stroke="#66FFAA" strokeWidth="3" opacity={0} filter="url(#lp-soft)">
              <animate attributeName="opacity" values="0;0.15;0.05;0.12;0" dur="6s" repeatCount="indefinite" />
              <animate attributeName="d" values="M60,25 Q130,10 200,20 Q270,30 340,15;M60,20 Q130,30 200,15 Q270,10 340,25;M60,25 Q130,10 200,20 Q270,30 340,15" dur="8s" repeatCount="indefinite" />
            </path>
            <path d="M80,35 Q150,20 220,30 Q300,15 360,28" fill="none" stroke="#88AAFF" strokeWidth="2" opacity={0} filter="url(#lp-soft)">
              <animate attributeName="opacity" values="0;0.1;0.03;0.08;0" dur="7s" repeatCount="indefinite" begin="1s" />
            </path>
          </>
        )}
      </svg>

      {/* Bottom gradient overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)",
        borderRadius: "0 0 22px 22px", pointerEvents: "none",
      }} />

      {/* Empty state */}
      {habits.length === 0 && (
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

      {/* All done badge */}
      {allDone && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)", borderRadius: 100,
          padding: "4px 14px", fontSize: 10, fontWeight: 700, color: "#66FFAA",
          display: "flex", alignItems: "center", gap: 4, animation: "fadeDown 0.4s ease",
          boxShadow: "0 2px 12px rgba(102,255,170,0.15)", border: "1px solid rgba(102,255,170,0.15)",
        }}>
          <Sparkles size={11} /> All habits complete!
        </div>
      )}
    </div>
  );
}
