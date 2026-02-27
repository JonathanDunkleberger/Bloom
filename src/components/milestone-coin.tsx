"use client";

import { useEffect, useState } from "react";

/* ═══════════ AA-STYLE MILESTONE COINS ═══════════ */

export interface CoinTier {
  key: string;
  label: string;
  hours: number;       // threshold in hours (for quit habits)
  days: number;        // threshold in days (for build habits)
  color: string;       // main coin color
  rim: string;         // rim / border color
  symbol: string;      // text displayed on coin face
  metallic: string;    // gradient highlight color
}

export const MILESTONE_COINS: CoinTier[] = [
  { key: "2h",   label: "2 Hours",    hours: 2,     days: 0,   color: "#CD7F32", rim: "#a0622a", symbol: "2H",   metallic: "#e8a860" },
  { key: "6h",   label: "6 Hours",    hours: 6,     days: 0,   color: "#CD7F32", rim: "#a0622a", symbol: "6H",   metallic: "#e8a860" },
  { key: "12h",  label: "12 Hours",   hours: 12,    days: 0,   color: "#CD7F32", rim: "#a0622a", symbol: "12H",  metallic: "#e8a860" },
  { key: "24h",  label: "24 Hours",   hours: 24,    days: 1,   color: "#C0C0C0", rim: "#8a8a8a", symbol: "1D",   metallic: "#e0e0e0" },
  { key: "48h",  label: "48 Hours",   hours: 48,    days: 2,   color: "#C0C0C0", rim: "#8a8a8a", symbol: "2D",   metallic: "#e0e0e0" },
  { key: "72h",  label: "72 Hours",   hours: 72,    days: 3,   color: "#C0C0C0", rim: "#8a8a8a", symbol: "3D",   metallic: "#e0e0e0" },
  { key: "7d",   label: "1 Week",     hours: 168,   days: 7,   color: "#FFD700", rim: "#c9a800", symbol: "7D",   metallic: "#fff3a0" },
  { key: "14d",  label: "2 Weeks",    hours: 336,   days: 14,  color: "#FFD700", rim: "#c9a800", symbol: "14D",  metallic: "#fff3a0" },
  { key: "30d",  label: "1 Month",    hours: 720,   days: 30,  color: "#E5C100", rim: "#b8960a", symbol: "30D",  metallic: "#fff070" },
  { key: "60d",  label: "2 Months",   hours: 1440,  days: 60,  color: "#50C878", rim: "#38a05c", symbol: "60D",  metallic: "#80e8a0" },
  { key: "90d",  label: "3 Months",   hours: 2160,  days: 90,  color: "#4169E1", rim: "#2a4fba", symbol: "90D",  metallic: "#7090f0" },
  { key: "180d", label: "6 Months",   hours: 4320,  days: 180, color: "#9B59B6", rim: "#7d3f9a", symbol: "180D", metallic: "#c080e0" },
  { key: "365d", label: "1 Year",     hours: 8760,  days: 365, color: "#E74C3C", rim: "#c0392b", symbol: "1Y",   metallic: "#f08070" },
];

/* ── Single coin SVG ── */
interface MilestoneCoinProps {
  tier: CoinTier;
  size?: number;
  earned?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
}

export function MilestoneCoin({ tier, size = 32, earned = true, glow = false, style }: MilestoneCoinProps) {
  const r = size / 2;
  const fontSize = size < 20 ? 5 : size < 30 ? 7 : size < 44 ? 9 : 12;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        filter: glow ? `drop-shadow(0 0 ${size * 0.2}px ${tier.color}80)` : undefined,
        opacity: earned ? 1 : 0.2,
        animation: glow ? "coinGlow 2s ease-in-out infinite" : undefined,
        ...style,
      }}
    >
      <defs>
        <radialGradient id={`cg-${tier.key}-${size}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={tier.metallic} />
          <stop offset="100%" stopColor={tier.color} />
        </radialGradient>
      </defs>
      {/* Outer rim */}
      <circle cx={r} cy={r} r={r - 1} fill={tier.rim} />
      {/* Inner face with gradient */}
      <circle cx={r} cy={r} r={r - size * 0.1} fill={`url(#cg-${tier.key}-${size})`} />
      {/* Inner ring detail */}
      <circle cx={r} cy={r} r={r - size * 0.18} fill="none" stroke={tier.rim} strokeWidth={0.5} opacity={0.4} />
      {/* Triangle / star notches around rim */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <circle
          key={deg}
          cx={r + (r - size * 0.06) * Math.cos((deg * Math.PI) / 180)}
          cy={r + (r - size * 0.06) * Math.sin((deg * Math.PI) / 180)}
          r={size * 0.02}
          fill={tier.metallic}
          opacity={0.6}
        />
      ))}
      {/* Symbol text */}
      <text
        x={r}
        y={r + fontSize * 0.35}
        textAnchor="middle"
        fill={tier.rim}
        fontSize={fontSize}
        fontWeight={800}
        fontFamily="'Fraunces', serif"
        opacity={0.9}
      >
        {tier.symbol}
      </text>
    </svg>
  );
}

/* ── Coin row for detail page ── */
interface CoinRowProps {
  habitId: string;
  earnedCoins: string[];   // array of coin keys earned (e.g. ["2h", "6h", "24h"])
  isQuit?: boolean;
}

export function CoinRow({ earnedCoins, isQuit }: CoinRowProps) {
  const coins = isQuit
    ? MILESTONE_COINS
    : MILESTONE_COINS.filter((c) => c.days > 0);

  const latestIdx = coins.reduce((maxI, c, i) => earnedCoins.includes(c.key) ? i : maxI, -1);

  return (
    <div style={{
      display: "flex", gap: 4, overflowX: "auto", padding: "2px 0",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
    }}>
      {coins.map((c, i) => {
        const isEarned = earnedCoins.includes(c.key);
        const isLatest = i === latestIdx;
        return (
          <div key={c.key} style={{ position: "relative", flexShrink: 0 }}>
            <MilestoneCoin
              tier={c}
              size={isLatest ? 48 : 40}
              earned={isEarned}
              glow={isLatest}
            />
            {isEarned && (
              <div style={{
                fontSize: 7, textAlign: "center", color: c.color,
                fontWeight: 700, marginTop: 1, opacity: 0.8,
              }}>
                {c.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Tiny coin badge for habit row ── */
interface CoinBadgeProps {
  earnedCoins: string[];
  isQuit?: boolean;
}

export function CoinBadge({ earnedCoins, isQuit }: CoinBadgeProps) {
  const coins = isQuit
    ? MILESTONE_COINS
    : MILESTONE_COINS.filter((c) => c.days > 0);

  // Find latest earned coin
  const latest = [...coins].reverse().find((c) => earnedCoins.includes(c.key));
  if (!latest) return null;

  return <MilestoneCoin tier={latest} size={24} earned glow={false} />;
}

/* ── Celebration overlay ── */
interface MilestoneCelebrationProps {
  tier: CoinTier;
  habitName: string;
  coinReward: number;
  onDismiss: () => void;
}

export function MilestoneCelebration({ tier, habitName, coinReward, onDismiss }: MilestoneCelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ animation: "coinSpin 1s ease-out", marginBottom: 20 }}>
        <MilestoneCoin tier={tier} size={120} earned glow />
      </div>
      <div style={{
        fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 800,
        color: tier.color, marginBottom: 6, textAlign: "center",
        textShadow: `0 0 20px ${tier.color}40`,
      }}>
        {tier.label}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 16, textAlign: "center" }}>
        {habitName}
      </div>
      {coinReward > 0 && (
        <div style={{
          fontSize: 18, fontWeight: 700, color: "#FFD700",
          display: "flex", alignItems: "center", gap: 6,
          animation: "fadeUp 0.5s ease 0.5s both",
        }}>
          +{coinReward} coins
        </div>
      )}
      <div style={{
        fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 24,
        animation: "fadeUp 0.5s ease 1s both",
      }}>
        Tap to dismiss
      </div>
    </div>
  );
}
