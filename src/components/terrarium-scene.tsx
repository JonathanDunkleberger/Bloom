"use client";

import { Sparkles } from "lucide-react";
import { seed } from "@/lib/utils";
import { SEASONS } from "@/lib/constants";
import { PlanetItem } from "@/components/planet-items";
import { getDragonSprite, deriveDragonFromId, CREATURE_SIZES } from "@/lib/sprites";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getAnimationTier, getTierConfig } from "@/lib/animation-tiers";
import type { TierConfig } from "@/lib/animation-tiers";
import type { HabitWithStats } from "@/types";
import type { SeasonKey } from "@/lib/constants";

interface TerrariumSceneProps {
  habits: HabitWithStats[];
  getStage: (id: string) => number;
  isHappy: (id: string) => boolean;
  getStreak?: (id: string) => number;
  pct: number;
  bouncingId: string | null;
  season?: SeasonKey;
  darkMode?: boolean;
  ownedItems?: string[];
  onCreatureTap?: (habitId: string) => void;
}

/** Determine creature mood based on time, completion, and streak */
type CreatureMood = "healthy" | "neglected" | "thriving" | "sleeping";
function getCreatureMood(isHappy: boolean, streak: number): CreatureMood {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) return "sleeping";
  if (!isHappy && hour >= 15) return "neglected";
  if (streak >= 7) return "thriving";
  return "healthy";
}

export function TerrariumScene({
  habits, getStage, isHappy, getStreak, pct, bouncingId,
  season = "summer", darkMode = false, ownedItems = [],
  onCreatureTap,
}: TerrariumSceneProps) {
  const allDone = pct >= 1 && habits.length > 0;
  const half = pct >= 0.5;
  const sn = SEASONS[season] || SEASONS.summer;
  const sr = seed;

  // ── Animation tier system ──
  const prefersReducedMotion = useReducedMotion();
  const tier = getAnimationTier(prefersReducedMotion);
  const tc: TierConfig = getTierConfig(tier);

  // Planet center & radius — scales with habit count and progress
  const cx = 200, cy = 200;
  const baseRadius = 110;
  const habitBonus = Math.min(habits.length * 3, 20);
  const progressBonus = pct * 8;
  const pr = baseRadius + habitBonus + progressBonus;

  // ── CREATURE PLACEMENT: spread creatures around more of the planet ──
  // Uses predefined arcs — wider spread for small counts to use the space
  const N = habits.length;
  const creatureAngles = habits.map((h, i) => {
    // Base angles (degrees from top, 0 = top center)
    // Wider arcs for small counts so they're not all clustered at top
    let baseAngle: number;
    if (N === 1) baseAngle = -15; // slightly off-center for visual interest
    else if (N === 2) baseAngle = [-55, 55][i];
    else if (N === 3) baseAngle = [-80, 15, 80][i]; // wide triangle, one near top
    else if (N === 4) baseAngle = [-100, -30, 40, 110][i];
    else if (N === 5) baseAngle = [-110, -55, 0, 55, 110][i];
    else baseAngle = -130 + (260 / (N - 1)) * i; // 6+: evenly from -130 to +130

    // Seeded jitter: ±5° angle, ±3px radial
    const hashVal = h.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const jitterAngle = ((hashVal * 7 + 13) % 100) / 100 * 10 - 5; // ±5°
    const angleDeg = baseAngle + jitterAngle;
    return -90 + angleDeg; // convert to math angle (top = -90°)
  });
  // Per-creature radial jitter
  const creatureRadialJitter = habits.map((h) => {
    const hashVal = h.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return ((hashVal * 11 + 29) % 100) / 100 * 6 - 3; // ±3px
  });

  // ── DECORATION PLACEMENT: seeded random across planet surface ──
  const decoPositions = ownedItems.map((itemId) => {
    const hashVal = itemId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    // Trees go to edge, small items can be more interior
    const isTall = ["sakura", "pine", "willow", "oak"].includes(itemId);
    const angleDeg = (hashVal * 37 + 17) % 360; // 0-360 seeded angle
    const radiusPercent = isTall
      ? 0.95 + ((hashVal * 13) % 6) / 100 // 0.95-1.00
      : 0.80 + ((hashVal * 11 + 7) % 20) / 100; // 0.80-0.99
    const angleRad = (-90 + angleDeg) * Math.PI / 180;
    return {
      angle: -90 + angleDeg,
      x: cx + Math.cos(angleRad) * (pr * radiusPercent),
      y: cy + Math.sin(angleRad) * (pr * radiusPercent),
      rotation: angleDeg, // perpendicular to surface
    };
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
      aspectRatio: "1 / 1",
      maxHeight: 380,
      borderRadius: 22, overflow: "visible",
      background: `radial-gradient(ellipse at 50% 60%, ${sky[2]} 0%, ${sky[1]} 40%, ${sky[0]} 100%)`,
      transition: "background 1.5s ease",
      boxShadow: "0 2px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
      clipPath: "inset(-2px round 22px)",
    }}>
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0 }}>
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
        {Array.from({ length: Math.min(tc.maxStars, 40 + Math.floor(pct * 30)) }).map((_, i) => {
          const r = sr(i * 37 + 7);
          const sx = r() * 400, sy = r() * 400;
          const sz = 0.4 + r() * (pct > 0.5 ? 1.4 : 0.8);
          return (
            <circle key={`s${i}`} cx={sx} cy={sy} r={sz} fill="white" opacity={0.15 + r() * 0.45}>
              {tc.starTwinkle && (
                <animate attributeName="opacity" values={`${0.1 + r() * 0.2};${0.4 + r() * 0.4};${0.1 + r() * 0.2}`} dur={`${2 + r() * 4}s`} repeatCount="indefinite" />
              )}
            </circle>
          );
        })}

        {/* ── DISTANT NEBULA (visible when progress > 30%) ── */}
        {tc.showNebula && pct > 0.3 && (
          <>
            <ellipse cx="340" cy="60" rx={30 + pct * 15} ry={18 + pct * 8} fill={pc.accent} opacity={0.03 + pct * 0.04} filter="url(#lp-soft)" />
            <ellipse cx="60" cy="260" rx={20 + pct * 10} ry={15 + pct * 6} fill="#8B5CF6" opacity={0.02 + pct * 0.03} filter="url(#lp-soft)" />
          </>
        )}

        {/* ── SHOOTING STARS (all done) ── */}
        {tc.showShootingStars && allDone && Array.from({ length: 3 }).map((_, i) => {
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
          {/* Moon glow — pulsing */}
          <circle cx="340" cy="55" r={half ? 24 : 16} fill="#FFFDE8" opacity={half ? 0.06 : 0.02}>
            <animate attributeName="opacity" values={half ? "0.04;0.1;0.04" : "0.02;0.05;0.02"} dur="8s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ── SUBTLE CLOUDS ── */}
        {tc.showClouds && pct > 0.2 && (
          <>
            <ellipse cx="70" cy="90" rx="28" ry="6" fill="white" opacity="0" filter="url(#lp-soft)">
              <animate attributeName="opacity" values="0;0.03;0.03;0" dur="18s" repeatCount="indefinite" />
              <animateTransform attributeName="transform" type="translate" values="-12,0;12,0;-12,0" dur="18s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="280" cy="120" rx="22" ry="5" fill="white" opacity="0" filter="url(#lp-soft)">
              <animate attributeName="opacity" values="0;0.025;0.025;0" dur="22s" repeatCount="indefinite" begin="6s" />
              <animateTransform attributeName="transform" type="translate" values="-10,0;10,0;-10,0" dur="22s" repeatCount="indefinite" begin="6s" />
            </ellipse>
            <ellipse cx="160" cy="65" rx="18" ry="4" fill="white" opacity="0" filter="url(#lp-soft)">
              <animate attributeName="opacity" values="0;0.02;0.02;0" dur="25s" repeatCount="indefinite" begin="12s" />
              <animateTransform attributeName="transform" type="translate" values="-8,0;8,0;-8,0" dur="25s" repeatCount="indefinite" begin="12s" />
            </ellipse>
          </>
        )}

        {/* ── ORBITAL RING ── */}
        {tc.showOrbitalRing && (
          <>
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
          </>
        )}

        {/* ── PLANET GLOW ── */}
        <circle cx={cx} cy={cy} r={pr + 25} fill="url(#lp-glow)" />

        {/* ── PLANET BODY ── */}
        <circle cx={cx} cy={cy} r={pr} fill="url(#lp-planet)" />

        {/* Subtle surface texture — 4 darker patches for depth */}
        <circle cx={cx - pr * 0.25} cy={cy - pr * 0.2} r={pr * 0.25} fill="rgba(0,80,0,0.07)" />
        <circle cx={cx + pr * 0.3} cy={cy + pr * 0.15} r={pr * 0.2} fill="rgba(0,80,0,0.05)" />
        <circle cx={cx - pr * 0.1} cy={cy + pr * 0.35} r={pr * 0.18} fill="rgba(0,80,0,0.06)" />
        <circle cx={cx + pr * 0.15} cy={cy - pr * 0.35} r={pr * 0.15} fill="rgba(0,60,0,0.04)" />

        {/* ── SURFACE DETAILS: always-present default vegetation ── */}
        {/* Default grass tufts — 7 always present, plus up to 4 more with progress */}
        {Array.from({ length: Math.min(11, 7 + Math.floor(pct * 4)) }).map((_, i) => {
          const r = sr(i * 47 + 33);
          const angle = (-140 + r() * 280) * Math.PI / 180;
          const sx = cx + Math.cos(angle) * (pr - 1), sy = cy + Math.sin(angle) * (pr - 1);
          const h = 3 + r() * 4 + pct * 2;
          return (
            <line key={`gr${i}`} x1={sx} y1={sy}
              x2={sx + Math.cos(angle - Math.PI / 2 + (r() - 0.5) * 0.3) * h}
              y2={sy + Math.sin(angle - Math.PI / 2 + (r() - 0.5) * 0.3) * h}
              stroke={`hsl(${season === "autumn" ? 40 + r() * 30 : 90 + r() * 40}, ${40 + r() * 25 + pct * 15}%, ${season === "winter" ? 50 + r() * 20 : 28 + r() * 18}%)`}
              strokeWidth={0.8 + r() * 0.6} strokeLinecap="round" opacity={0.3 + r() * 0.2 + pct * 0.15} />
          );
        })}

        {/* Default flowers — 4 always present */}
        {Array.from({ length: Math.min(6, 4 + Math.floor(pct * 2)) }).map((_, i) => {
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

        {/* ── DEFAULT SMALL TREE — always present, gives planet character ── */}
        {(() => {
          const tr = sr(777);
          const tAngle = (-35 + tr() * 10) * Math.PI / 180; // upper-left area
          const tx = cx + Math.cos(tAngle) * (pr + 1);
          const ty = cy + Math.sin(tAngle) * (pr + 1);
          const trunkH = 8;
          const trunkX = tx + Math.cos(tAngle - Math.PI / 2) * 2;
          const trunkY = ty + Math.sin(tAngle - Math.PI / 2) * 2;
          const crownX = tx + Math.cos(tAngle - Math.PI / 2) * (trunkH + 4);
          const crownY = ty + Math.sin(tAngle - Math.PI / 2) * (trunkH + 4);
          const isAutumn = season === "autumn";
          const isWinter = season === "winter";
          const crownColor = isAutumn ? "#D4741C" : isWinter ? "#8BA88B" : "#4a9e4a";
          return (
            <g key="default-tree">
              {/* Trunk */}
              <line x1={tx} y1={ty} x2={trunkX} y2={trunkY}
                stroke="#6B4226" strokeWidth={2} strokeLinecap="round" />
              <line x1={trunkX} y1={trunkY}
                x2={trunkX + Math.cos(tAngle - Math.PI / 2) * 3}
                y2={trunkY + Math.sin(tAngle - Math.PI / 2) * 3}
                stroke="#6B4226" strokeWidth={1.5} strokeLinecap="round" />
              {/* Crown */}
              <circle cx={crownX} cy={crownY} r={5} fill={crownColor} opacity={0.85} />
              <circle cx={crownX - 2} cy={crownY - 1} r={3.5} fill={crownColor} opacity={0.7} />
              <circle cx={crownX + 2} cy={crownY + 0.5} r={3} fill={crownColor} opacity={0.6} />
              {/* Highlight */}
              <circle cx={crownX - 1} cy={crownY - 2} r={1.5} fill="white" opacity={0.08} />
            </g>
          );
        })()}

        {/* ── OWNED SHOP ITEMS on planet surface — LOWER hemisphere ── */}
        {ownedItems.map((itemId, i) => {
          const deco = decoPositions[i];
          if (!deco) return null;
          const ix = deco.x;
          const iy = deco.y;
          const rotDeg = deco.rotation + 90;
          return (
            <g key={itemId}>
              {/* Subtle shadow to ground the decoration */}
              <ellipse cx={ix} cy={iy + 2} rx={8} ry={3} fill="rgba(0,0,0,0.08)" />
              <PlanetItem key={itemId} id={itemId} x={ix} y={iy} rotation={rotDeg} scale={0.65} />
            </g>
          );
        })}

        {/* ── ATMOSPHERE RIM — subtle edge glow ── */}
        <circle cx={cx} cy={cy} r={pr} fill="url(#lp-atmo)" />
        <circle cx={cx} cy={cy} r={pr + 1} fill="none" stroke="rgba(100,200,100,0.12)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={pr + 3} fill="none" stroke="rgba(100,200,100,0.06)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={pr + 6} fill="none" stroke="rgba(100,200,100,0.03)" strokeWidth="0.5" />

        {/* ── CREATURES walking on planet surface ── */}
        {/* Each creature is ONE sprite, properly sized, with horizontal label */}
        {habits.map((h, i) => {
          const st = getStage(h.id);
          const hp = isHappy(h.id);
          const streak = getStreak ? getStreak(h.id) : 0;
          const mood = getCreatureMood(hp, streak);
          const isBouncing = bouncingId === h.id;
          const isQuitHabit = h.category === "quit";
          const r = sr(h.id.charCodeAt(0) * 100 + i);

          const angleDeg = creatureAngles[i] ?? -90;
          const angleRad = angleDeg * Math.PI / 180;
          const rJitter = creatureRadialJitter[i] || 0;
          const px = cx + Math.cos(angleRad) * (pr + 2 + rJitter);
          const py = cy + Math.sin(angleRad) * (pr + 2 + rJitter);
          const rotDeg = angleDeg + 90;

          // Sprite display size based on stage
          const sz = CREATURE_SIZES[st] || 48;
          // Scale UP for few habits (lots of space), scale DOWN for many
          const scaledSz = N >= 8 ? Math.max(36, sz * 0.65)
                         : N >= 6 ? Math.max(40, sz * 0.75)
                         : N >= 4 ? Math.max(44, sz * 0.85)
                         : N <= 2 ? Math.max(56, sz * 1.3)
                         : Math.max(50, sz * 1.15); // 3 habits
          const species = h.creature_type || deriveDragonFromId(h.id);
          const spritePath = getDragonSprite(st, species);

          // Animation: mood-aware (disabled in minimal tier)
          const anim = !tc.animateCreatures
            ? "none"
            : isBouncing
              ? "completionBounce 0.5s cubic-bezier(0.34,1.56,0.64,1)"
              : mood === "sleeping"
                ? `creatureIdleFloat 4s ease-in-out infinite`
                : mood === "neglected"
                  ? `neglectedWobble 3s ease-in-out infinite`
                  : mood === "thriving"
                    ? `bob ${1.8 + r() * 0.8}s ease-in-out infinite`
                    : isQuitHabit
                      ? `creatureIdleFloat 3s ease-in-out infinite`
                      : `bob ${2.2 + r() * 1.5}s ease-in-out infinite`;

          // Mood-based filter
          const moodFilter = mood === "sleeping"
            ? "saturate(0.4) brightness(0.7)"
            : mood === "neglected"
              ? "saturate(0.55) brightness(0.8) opacity(0.85)"
              : mood === "thriving"
                ? "saturate(1.1) brightness(1.05)"
                : hp ? "none" : "saturate(0.5) brightness(0.8)";

          // Mood-based scale
          const moodScale = mood === "thriving" ? "scale(1.05)" : "";

          return (
            <g key={h.id} transform={`translate(${px}, ${py}) rotate(${rotDeg})`}
              style={{ cursor: onCreatureTap ? "pointer" : "default" }}
              onClick={() => onCreatureTap?.(h.id)}
            >
              {/* Soft glow circle underneath creature — thriving gets bigger glow */}
              <circle cx="0" cy={0} r={scaledSz * (mood === "thriving" ? 0.55 : 0.4)}
                fill={h.color} opacity={mood === "thriving" ? 0.25 : hp ? 0.18 : 0.08} />
              <g style={{ animation: anim, animationDelay: `${r() * 2}s`, transform: moodScale }}>
                {/* Creature sprite via native SVG image — reliable on mobile Safari */}
                <image
                  href={spritePath}
                  x={-scaledSz / 2} y={-scaledSz}
                  width={scaledSz} height={scaledSz}
                  transform={`rotate(${-rotDeg})`}
                  style={{
                    filter: moodFilter,
                    transition: "filter 0.5s ease, transform 0.3s ease",
                    animation: tc.showCreatureMoodFx && (mood === "healthy" || mood === "thriving")
                      ? `creatureBlink 4s ease-in-out infinite ${1 + r() * 3}s`
                      : undefined,
                  }}
                />
                {/* Name label — always horizontal (counter-rotate), below sprite */}
                {/* Hide labels entirely for 8+ habits, shrink for 6-7 */}
                {N < 8 && (
                <foreignObject
                  x={N >= 6 ? -30 : -40} y={4}
                  width={N >= 6 ? 60 : 80} height={16}
                  transform={`rotate(${-rotDeg})`}
                  style={{ overflow: "visible" }}
                >
                  <div style={{
                    textAlign: "center",
                    fontSize: N >= 6 ? 8 : 10,
                    fontWeight: 600,
                    color: mood === "sleeping" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: N >= 6 ? 60 : 80,
                    lineHeight: "14px",
                    fontFamily: "inherit",
                  }}>{h.creature_name || h.name}</div>
                </foreignObject>
                )}

                {/* ZZZ for sleeping creatures */}
                {tc.showCreatureMoodFx && mood === "sleeping" && (
                  <foreignObject
                    x={scaledSz * 0.1} y={-scaledSz * 0.9}
                    width={30} height={20}
                    transform={`rotate(${-rotDeg})`}
                    style={{ overflow: "visible" }}
                  >
                    <div style={{ position: "relative" }}>
                      {["z", "z", "z"].map((z, zi) => (
                        <span key={zi} style={{
                          position: "absolute",
                          left: zi * 5,
                          top: -zi * 4,
                          fontSize: 7 + zi * 2,
                          fontWeight: 700,
                          color: "rgba(180,200,255,0.5)",
                          animation: `zzzFloat 2.5s ease-in-out infinite`,
                          animationDelay: `${zi * 0.6}s`,
                        }}>{z}</span>
                      ))}
                    </div>
                  </foreignObject>
                )}

                {/* Sparkles for thriving creatures */}
                {tc.showCreatureMoodFx && mood === "thriving" && !isBouncing && (
                  <>
                    {[0, 1, 2].map((si) => {
                      const sa = (si * 120 + 30) * Math.PI / 180;
                      const sd = scaledSz * 0.5;
                      return (
                        <circle key={`ts${si}`}
                          cx={Math.cos(sa) * sd}
                          cy={-scaledSz / 2 + Math.sin(sa) * sd}
                          r="1.5" fill="white" opacity="0"
                        >
                          <animate attributeName="opacity" values="0;0.7;0" dur={`${1.5 + si * 0.4}s`} repeatCount="indefinite" begin={`${si * 0.5}s`} />
                          <animate attributeName="r" values="0.5;2;0.5" dur={`${1.5 + si * 0.4}s`} repeatCount="indefinite" begin={`${si * 0.5}s`} />
                        </circle>
                      );
                    })}
                  </>
                )}

                {/* Hearts floating up for thriving creatures */}
                {tc.showCreatureMoodFx && mood === "thriving" && !isBouncing && (
                  <g transform={`rotate(${-rotDeg})`}>
                    {[0, 1].map((hi) => (
                      <text
                        key={`h${hi}`}
                        x={-4 + hi * 12}
                        y={-scaledSz * 0.7}
                        fontSize="7"
                        fill="#ff6b9d"
                        opacity="0"
                      >
                        ♥
                        <animate attributeName="opacity" values="0;0.6;0" dur={`${2.5 + hi * 0.8}s`} repeatCount="indefinite" begin={`${hi * 1.2}s`} />
                        <animate attributeName="y" values={`${-scaledSz * 0.7};${-scaledSz * 1.1}`} dur={`${2.5 + hi * 0.8}s`} repeatCount="indefinite" begin={`${hi * 1.2}s`} />
                      </text>
                    ))}
                  </g>
                )}

                {/* Neglected: sweat drop */}
                {tc.showCreatureMoodFx && mood === "neglected" && (
                  <g transform={`rotate(${-rotDeg})`}>
                    <text
                      x={scaledSz * 0.2}
                      y={-scaledSz * 0.6}
                      fontSize="8"
                      opacity="0"
                    >
                      💧
                      <animate attributeName="opacity" values="0;0.5;0.5;0" dur="3s" repeatCount="indefinite" />
                    </text>
                  </g>
                )}
              </g>

              {/* Sparkle particles on completion bounce */}
              {tc.showBounceSparkles && isBouncing && [0, 1, 2, 3].map((si) => {
                const angle = (si * 90 + 45) * Math.PI / 180;
                const dist = scaledSz * 0.6;
                return (
                  <circle key={si} cx={Math.cos(angle) * dist} cy={-scaledSz / 2 + Math.sin(angle) * dist}
                    r="2" fill="white" opacity="0">
                    <animate attributeName="opacity" values="0;1;0" dur="0.4s" fill="freeze" />
                    <animate attributeName="r" values="1;3;1" dur="0.4s" fill="freeze" />
                  </circle>
                );
              })}
            </g>
          );
        })}

        {/* ── SEASONAL PARTICLES in space around planet ── */}
        {tc.showSeasonalParticles && season === "winter" && Array.from({ length: Math.min(tc.maxSeasonalParticles, 15 + Math.floor(pct * 10)) }).map((_, i) => {
          const r = sr(i * 41 + 99);
          const x = r() * 400, startY = -10 - r() * 60;
          return (
            <circle key={`sn${i}`} cx={x} cy={startY} r={1 + r() * 1.5} fill="white" opacity={0.3 + r() * 0.3}>
              <animate attributeName="cy" values={`${startY};350`} dur={`${5 + r() * 7}s`} repeatCount="indefinite" />
              <animate attributeName="cx" values={`${x};${x + 10 - r() * 20};${x}`} dur={`${4 + r() * 5}s`} repeatCount="indefinite" />
            </circle>
          );
        })}
        {tc.showSeasonalParticles && season === "spring" && Array.from({ length: Math.min(tc.maxSeasonalParticles, 10 + Math.floor(pct * 8)) }).map((_, i) => {
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
        {tc.showSeasonalParticles && season === "autumn" && Array.from({ length: Math.min(tc.maxSeasonalParticles, 10 + Math.floor(pct * 8)) }).map((_, i) => {
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
        {tc.showSeasonalParticles && season === "summer" && half && Array.from({ length: Math.min(tc.maxSeasonalParticles, 6 + Math.floor(pct * 6)) }).map((_, i) => {
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
        {tc.showAurora && allDone && (
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
