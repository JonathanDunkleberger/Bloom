"use client";

import { X, Infinity, Coins, TrendingUp, TreePine, Palette, Sparkles } from "lucide-react";

interface BloomPlusScreenProps {
  onClose: () => void;
  onSubscribe: (plan: "annual" | "monthly") => void;
}

export function BloomPlusScreen({ onClose, onSubscribe }: BloomPlusScreenProps) {
  const features = [
    {
      Icon: Infinity,
      title: "Unlimited habits",
      desc: "Track everything that matters to your recovery",
    },
    {
      Icon: Coins,
      title: "+5 daily coins",
      desc: "Bonus coins every time you open the app",
    },
    {
      Icon: TrendingUp,
      title: "Full insights",
      desc: "Trigger patterns, synergies, and streak analysis",
    },
    {
      Icon: TreePine,
      title: "Premium decorations",
      desc: "Unlock all trees, lanterns, and seasonal items",
    },
    {
      Icon: Palette,
      title: "Custom colors",
      desc: "Pick any color for your habits and creatures",
    },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#0a0e18",
        overflowY: "auto", WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Subtle green glow at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 300,
        background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Close button — always visible */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 10,
          background: "none", border: "none", cursor: "pointer",
          padding: 8, display: "flex",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <X size={22} />
      </button>

      <div style={{ maxWidth: 400, margin: "0 auto", padding: "60px 24px 40px", position: "relative" }}>
        {/* Sprout icon */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ display: "inline-block" }}>
            <path d="M24 42V26" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M24 26C24 26 18 22 18 16C18 10 24 8 24 8C24 8 30 10 30 16C30 22 24 26 24 26Z" fill="#4ade80" opacity="0.8" />
            <path d="M24 30C24 30 16 28 12 22C8 16 12 10 12 10C12 10 18 12 22 18C26 24 24 30 24 30Z" fill="#22c55e" opacity="0.6" />
          </svg>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600,
          color: "white", textAlign: "center", lineHeight: 1.3, marginBottom: 32,
        }}>
          You&rsquo;ve been showing up.<br />
          <span style={{ color: "#4ade80" }}>Bloom+</span> helps you keep going.
        </h1>

        {/* Feature cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: 16, borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <f.Icon size={20} color="#4ade80" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{f.title}</div>
                <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Annual pricing — primary */}
        <div style={{
          padding: 20, borderRadius: 16,
          background: "rgba(74,222,128,0.12)",
          border: "1px solid rgba(74,222,128,0.2)",
          textAlign: "center", marginBottom: 12,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>$29.99 / year</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>That&rsquo;s $2.50/month</div>
          <button
            onClick={() => onSubscribe("annual")}
            style={{
              marginTop: 14, width: "100%", padding: "14px 0",
              borderRadius: 16, border: "none",
              background: "#4ade80", color: "white",
              fontSize: 16, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Start Bloom+
          </button>
        </div>

        {/* Monthly — secondary */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            onClick={() => onSubscribe("monthly")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, color: "rgba(255,255,255,0.4)",
              fontFamily: "inherit", padding: "8px 16px",
            }}
          >
            $4.99 / month
          </button>
        </div>

        {/* Bottom note */}
        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.3)",
          textAlign: "center", lineHeight: 1.5, marginBottom: 12,
        }}>
          Bloom+ supports continued development of free<br />
          recovery tools for everyone.
        </p>

        {/* Restore purchase */}
        <div style={{ textAlign: "center" }}>
          <button
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "rgba(255,255,255,0.3)",
              fontFamily: "inherit", textDecoration: "underline",
              padding: "8px 16px",
            }}
          >
            Restore purchase
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mini prompt for premium shop items — bottom sheet style */
export function BloomPlusMiniPrompt({
  onSeeBloomPlus,
  onDismiss,
}: {
  onSeeBloomPlus: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 180,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, padding: "24px 24px 32px",
          borderRadius: "20px 20px 0 0",
          background: "#1a1e2e",
          animation: "slideUp .25s ease",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: "white", textAlign: "center", marginBottom: 8 }}>
          This item is part of Bloom+.
        </p>
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.5)",
          textAlign: "center", lineHeight: 1.5, marginBottom: 20,
        }}>
          Unlock all premium decorations, unlimited habits,<br />
          and bonus daily coins.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSeeBloomPlus}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12,
              border: "none", background: "#4ade80", color: "white",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            See Bloom+
          </button>
          <button
            onClick={onDismiss}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/** 7-day milestone celebration with gentle Bloom+ nudge */
export function SevenDayCelebration({
  habitName,
  moneySaved,
  urgeCount,
  onTryBloomPlus,
  onKeepGoingFree,
}: {
  habitName: string;
  moneySaved: number;
  urgeCount: number;
  onTryBloomPlus: () => void;
  onKeepGoingFree: () => void;
}) {
  return (
    <div
      onClick={onKeepGoingFree}
      style={{
        position: "fixed", inset: 0, zIndex: 180,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 360, padding: "32px 24px",
          borderRadius: 20, background: "#1a1e2e",
          textAlign: "center",
          animation: "fadeUp .3s ease",
        }}
      >
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
          <Sparkles size={40} color="#FFD93D" strokeWidth={1.5} />
        </div>
        <h2 style={{
          fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600,
          color: "white", marginBottom: 8,
        }}>
          7 days clean. You&rsquo;re incredible.
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 6 }}>
          Your creature is growing. Your planet is thriving.
        </p>
        {(moneySaved > 0 || urgeCount > 0) && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 20 }}>
            {moneySaved > 0 && `You've saved $${Math.round(moneySaved)}`}
            {moneySaved > 0 && urgeCount > 0 && " and "}
            {urgeCount > 0 && `beaten ${urgeCount} urge${urgeCount !== 1 ? "s" : ""}`}
            .
          </p>
        )}
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 24 }}>
          Want to go deeper? <span style={{ color: "#4ade80" }}>Bloom+</span> gives you unlimited
          habits, premium decorations, and full insights into your patterns.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onTryBloomPlus}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12,
              border: "none", background: "#4ade80", color: "white",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Try Bloom+
          </button>
          <button
            onClick={onKeepGoingFree}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Keep going free
          </button>
        </div>
      </div>
    </div>
  );
}
