"use client";

import { useState } from "react";
import { Store, Check, Coins } from "lucide-react";
import { SHOP_CATEGORIES, SHOP_ITEMS } from "@/lib/constants";
import { getShopSprite } from "@/lib/sprites";
import type { ThemeColors } from "@/lib/constants";
import type { ShopCategory } from "@/types";

interface ShopProps {
  coins: number;
  ownedItems: string[];
  onBuy: (itemId: string) => void;
  onOwnedTap?: (itemId: string) => void;
  isPro?: boolean;
  onPremiumTap?: () => void;
  th: ThemeColors;
}

export function Shop({ coins, ownedItems, onBuy, onOwnedTap, isPro, onPremiumTap, th }: ShopProps) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("landscape");

  const items = SHOP_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div style={{ animation: "fadeUp .28s ease" }}>
      {/* Header */}
      <div
        className="cd"
        style={{
          padding: 18, marginBottom: 10, textAlign: "center",
          background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: "50%", margin: "0 auto 10px",
          background: "linear-gradient(135deg,#4caf50,#66FFAA)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Store size={20} color="white" />
        </div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>
          World Shop
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          Customize your planet with items earned from streaks
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10,
          background: th.coinBg, padding: "5px 12px", borderRadius: 20,
          fontSize: 13, fontWeight: 700, color: "#f59e0b",
        }}>
          <Coins size={13} />{coins}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
        {SHOP_CATEGORIES.map((cat) => {
          const active = activeCategory === cat.key;
          const count = SHOP_ITEMS.filter((i) => i.category === cat.key).length;
          const owned = SHOP_ITEMS.filter((i) => i.category === cat.key && ownedItems.includes(i.id)).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: "7px 14px", borderRadius: 10, border: "none",
                fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
                background: active ? "#4caf50" : th.card,
                color: active ? "white" : th.textSub,
                transition: "all 0.12s",
              }}
            >
              {cat.label} {owned > 0 && <span style={{ opacity: 0.7 }}>({owned}/{count})</span>}
            </button>
          );
        })}
      </div>

      {/* Items grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {items.map((item) => {
          const owned = ownedItems.includes(item.id);
          const canAfford = coins >= item.price;
          const locked = !!(item.premium && !isPro && !owned);
          return (
            <div
              key={item.id}
              className="cd"
              style={{
                padding: 16, textAlign: "center", position: "relative",
                background: th.card, borderColor: owned ? "rgba(76,175,80,0.2)" : th.cardBorder,
                boxShadow: th.cardShadow,
                opacity: !owned && !canAfford ? 0.55 : 1,
                transition: "all 0.15s",
              }}
            >
              {/* Bloom+ badge for premium items */}
              {locked && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  padding: "2px 7px", borderRadius: 10,
                  background: "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  fontSize: 9, fontWeight: 700, color: "#4ade80",
                  letterSpacing: "0.3px",
                }}>
                  Bloom+
                </div>
              )}
              {/* Sprite preview — 64px, pixelated */}
              <div style={{
                width: 64, height: 64, margin: "0 auto 8px",
                background: th.progressBg, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {getShopSprite(item.id) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getShopSprite(item.id)!}
                    alt={item.name}
                    width={52}
                    height={52}
                    draggable={false}
                    style={{
                      imageRendering: "pixelated",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <svg width="44" height="44" viewBox="-15 -20 30 25">
                    <ItemPreview id={item.id} />
                  </svg>
                )}
              </div>

              <div style={{ fontWeight: 600, fontSize: 12.5, color: th.text }}>{item.name}</div>
              <div style={{ fontSize: 10, color: th.textSub, marginTop: 2, lineHeight: 1.3 }}>{item.description}</div>

              {owned ? (
                <div
                  onClick={() => onOwnedTap?.(item.id)}
                  style={{
                  marginTop: 8, padding: "6px 0", borderRadius: 8,
                  background: "rgba(76,175,80,0.08)", color: "#4caf50",
                  fontSize: 11, fontWeight: 600, display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  cursor: onOwnedTap ? "pointer" : "default",
                }}>
                  <Check size={11} /> Owned
                </div>
              ) : locked ? (
                <button
                  onClick={() => onPremiumTap?.()}
                  style={{
                    marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8,
                    border: "1px solid rgba(74,222,128,0.15)", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                    background: "rgba(74,222,128,0.06)",
                    color: "#4ade80",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                    transition: "all 0.12s",
                  }}
                >
                  <Coins size={10} />{item.price}
                </button>
              ) : (
                <button
                  onClick={() => canAfford && onBuy(item.id)}
                  disabled={!canAfford}
                  style={{
                    marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 8,
                    border: "none", cursor: canAfford ? "pointer" : "default",
                    fontFamily: "inherit", fontSize: 11, fontWeight: 600,
                    background: canAfford ? "linear-gradient(135deg,#4caf50,#2e7d32)" : th.progressBg,
                    color: canAfford ? "white" : th.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                    transition: "all 0.12s",
                  }}
                >
                  <Coins size={10} />{item.price}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      {coins === 0 ? (
        <div style={{
          marginTop: 12, padding: 16, borderRadius: 12,
          background: th.coinBg, textAlign: "center",
          fontSize: 12, color: th.text, lineHeight: 1.6, fontWeight: 500,
        }}>
          Earn coins by completing habits, building streaks, and hitting milestones.
          <br /><span style={{ fontSize: 10, color: th.textSub, fontWeight: 400 }}>Every check-in counts!</span>
        </div>
      ) : (
        <div style={{
          marginTop: 12, padding: 12, borderRadius: 12,
          background: th.coinBg, textAlign: "center",
          fontSize: 10, color: th.textSub, lineHeight: 1.5,
        }}>
          Earn coins by building streaks and hitting milestones.
          Purchased items appear on your planet!
        </div>
      )}
    </div>
  );
}

/** Inline preview renderer — reuses planet-items shapes but simplified for the card */
function ItemPreview({ id }: { id: string }) {
  // Import the same shapes from planet-items but render them directly
  // We duplicate the render logic here for the smaller preview context
  switch (id) {
    case "pond":
      return <><ellipse cx="0" cy="0" rx="10" ry="5" fill="#5BA4D9" opacity="0.7" /><ellipse cx="-2" cy="-1.5" rx="3" ry="1.2" fill="white" opacity="0.25" /></>;
    case "bridge":
      return <><rect x="-8" y="-2" width="16" height="3" rx="1" fill="#A0804E" /><rect x="-7" y="-5" width="1.5" height="4" rx="0.5" fill="#7B5D38" /><rect x="5.5" y="-5" width="1.5" height="4" rx="0.5" fill="#7B5D38" /><rect x="-8" y="-5.5" width="16" height="1" rx="0.5" fill="#6B5030" /></>;
    case "bench":
      return <><rect x="-6" y="-1" width="12" height="2" rx="0.8" fill="#A0804E" /><rect x="-6" y="-4" width="12" height="1.5" rx="0.8" fill="#8B6D42" /><rect x="-5" y="-1" width="1" height="3" fill="#6B5030" /><rect x="4" y="-1" width="1" height="3" fill="#6B5030" /></>;
    case "fence":
      return <>{[-6, -2, 2, 6].map((fx, i) => <rect key={i} x={fx - 0.6} y="-7" width="1.2" height="7" rx="0.4" fill="#D4C4A0" />)}<rect x="-7" y="-5.5" width="14" height="1" rx="0.3" fill="#C8B890" /></>;
    case "stone-path":
      return <><ellipse cx="-4" cy="0" rx="2.5" ry="1.8" fill="#A0A090" opacity="0.7" /><ellipse cx="0" cy="-2" rx="3" ry="2" fill="#909080" opacity="0.65" /><ellipse cx="4" cy="0.5" rx="2.2" ry="1.5" fill="#B0B0A0" opacity="0.6" /></>;
    case "sakura":
      return <><rect x="-1" y="-6" width="2" height="6" rx="0.8" fill="#6B5344" /><ellipse cx="0" cy="-10" rx="7" ry="5" fill="#FFB6C1" opacity="0.8" /><ellipse cx="-2" cy="-11" rx="4" ry="3" fill="#FF85A2" opacity="0.6" /></>;
    case "pine":
      return <><rect x="-0.8" y="-4" width="1.6" height="4" rx="0.6" fill="#5D4E37" /><polygon points="0,-14 -5,-8 5,-8" fill="#2E7D32" /><polygon points="0,-11 -4,-6 4,-6" fill="#388E3C" /><polygon points="0,-8 -3,-4 3,-4" fill="#43A047" /></>;
    case "willow":
      return <><rect x="-1" y="-8" width="2" height="8" rx="0.8" fill="#6B5344" /><ellipse cx="0" cy="-10" rx="6" ry="4" fill="#66BB6A" opacity="0.6" /><path d="M-4,-8 Q-6,-3 -7,2" stroke="#4CAF50" strokeWidth="0.7" fill="none" opacity="0.7" /><path d="M4,-8 Q6,-3 7,2" stroke="#4CAF50" strokeWidth="0.7" fill="none" opacity="0.7" /></>;
    case "oak":
      return <><rect x="-1.5" y="-8" width="3" height="8" rx="1.2" fill="#5D4E37" /><ellipse cx="0" cy="-12" rx="9" ry="6" fill="#558B2F" /><ellipse cx="-3" cy="-13" rx="5" ry="4" fill="#689F38" opacity="0.7" /></>;
    case "tulips":
      return <>{[[-3, "#E53935"], [0, "#FDD835"], [3, "#AB47BC"]].map(([fx, c], i) => <g key={i}><line x1={Number(fx)} y1="0" x2={Number(fx)} y2="-5" stroke="#4CAF50" strokeWidth="0.7" /><ellipse cx={Number(fx)} cy={-6} rx="1.5" ry="2" fill={c as string} /></g>)}</>;
    case "sunflowers":
      return <><line x1="0" y1="0" x2="0" y2="-8" stroke="#4CAF50" strokeWidth="1" /><circle cx="0" cy="-10" r="3.5" fill="#FDD835" /><circle cx="0" cy="-10" r="1.8" fill="#795548" /></>;
    case "roses":
      return <>{[[-2, -5], [1.5, -6]].map(([fx, fy], i) => <g key={i}><line x1={fx} y1="0" x2={fx} y2={fy} stroke="#388E3C" strokeWidth="0.6" /><circle cx={fx} cy={fy! - 1} r="1.8" fill="#E53935" /></g>)}</>;
    case "lavender":
      return <>{[-2, 0, 2].map((fx, i) => <g key={i}><line x1={fx} y1="0" x2={fx} y2="-6" stroke="#66BB6A" strokeWidth="0.5" />{[-6, -5, -4].map((fy, j) => <ellipse key={j} cx={fx} cy={fy} rx="0.8" ry="0.5" fill="#9C27B0" opacity={0.6 + j * 0.1} />)}</g>)}</>;
    case "lantern":
      return <><rect x="-0.4" y="-8" width="0.8" height="8" fill="#6B5344" /><rect x="-2" y="-12" width="4" height="4" rx="0.8" fill="#FFF8E1" opacity="0.9" /><rect x="-2" y="-12" width="4" height="4" rx="0.8" fill="#FFD54F" opacity="0.4" /></>;
    case "mushrooms":
      return <><rect x="-0.6" y="-3" width="1.2" height="3" rx="0.4" fill="#F5F5DC" /><ellipse cx="0" cy="-4" rx="3.5" ry="2" fill="#E53935" /><circle cx="-1" cy="-4.5" r="0.6" fill="white" opacity="0.7" /><circle cx="1" cy="-3.8" r="0.5" fill="white" opacity="0.6" /></>;
    case "rock-garden":
      return <><ellipse cx="-2" cy="-1" rx="3" ry="2.5" fill="#9E9E9E" /><ellipse cx="-2" cy="-2" rx="2" ry="1.5" fill="#BDBDBD" opacity="0.5" /><ellipse cx="3" cy="0" rx="2" ry="1.8" fill="#8D8D8D" /></>;
    case "birdhouse":
      return <><rect x="-0.4" y="-10" width="0.8" height="10" fill="#6B5344" /><rect x="-3" y="-14" width="6" height="4.5" rx="0.6" fill="#FFCC80" /><polygon points="0,-16 -4,-14 4,-14" fill="#E57373" /><circle cx="0" cy="-12.5" r="1" fill="#5D4037" /></>;
    default:
      return <circle cx="0" cy="-3" r="3" fill="#ccc" opacity="0.5" />;
  }
}
