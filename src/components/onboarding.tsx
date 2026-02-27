"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { Creature } from "@/components/creature";
import { QUIT_PRESETS } from "@/lib/constants";
import { getIcon } from "@/lib/utils";

const BUILD_PRESETS = [
  { name: "Meditate", iconName: "Brain", color: "#7c5cbf" },
  { name: "Exercise", iconName: "Dumbbell", color: "#e8553a" },
  { name: "Read", iconName: "BookOpen", color: "#3a8fd6" },
  { name: "Journal", iconName: "BookOpen", color: "#d4a03c" },
  { name: "Hydrate", iconName: "Droplets", color: "#42b4d6" },
  { name: "Walk", iconName: "Footprints", color: "#27ae60" },
  { name: "Sleep well", iconName: "Moon", color: "#6b5b95" },
  { name: "Deep work", iconName: "Target", color: "#34495e" },
  { name: "Cook a meal", iconName: "Utensils", color: "#f39c12" },
  { name: "Create", iconName: "Palette", color: "#1abc9c" },
];

interface OnboardingProps {
  onComplete: (quitPick: { name: string; color: string; iconName: string; cost: number } | null, buildPick: { name: string; color: string; iconName: string } | null) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [quitPick, setQuitPick] = useState<{ name: string; color: string; iconName: string; cost: number } | null>(null);
  const [buildPick, setBuildPick] = useState<{ name: string; color: string; iconName: string } | null>(null);
  const [showPlanet, setShowPlanet] = useState(false);
  const [showEggs, setShowEggs] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [mustPick, setMustPick] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
  }, []);

  useEffect(() => {
    if (step === 4) {
      setTimeout(() => setShowPlanet(true), 100);
      setTimeout(() => setShowEggs(true), 900);
      setTimeout(() => setShowText(true), 1200);
      setTimeout(() => setShowButton(true), 1400);
    }
  }, [step]);

  const handleQuitPick = (p: typeof QUIT_PRESETS[number]) => {
    setQuitPick({ name: p.name, color: p.color, iconName: p.iconName, cost: p.cost });
    setMustPick(false);
    setStep(3);
  };

  const handleBuildPick = (p: (typeof BUILD_PRESETS)[number]) => {
    setBuildPick({ name: p.name, color: p.color, iconName: p.iconName });
    setMustPick(false);
    setStep(4);
  };

  const handleSkipQuit = () => {
    setStep(3);
  };

  const handleSkipBuild = () => {
    if (!quitPick) {
      setMustPick(true);
      return;
    }
    setStep(4);
  };

  const handleEnter = () => {
    onComplete(quitPick, buildPick);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0a0e18", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans',-apple-system,sans-serif",
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.4s ease",
    }}>
      {/* Step 1: Welcome */}
      {step === 1 && (
        <div style={{
          textAlign: "center", padding: "0 32px", maxWidth: 400, width: "100%",
          animation: "fadeUp 0.6s ease",
        }}>
          {/* Green radial glow */}
          <div style={{
            position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h1 style={{
            fontFamily: "'Fraunces',serif", fontSize: 32, fontWeight: 700,
            color: "white", position: "relative", zIndex: 1, marginBottom: 12,
          }}>
            bloom<span style={{ color: "#4ade80" }}>.</span>
          </h1>
          <p style={{
            fontSize: 15, fontWeight: 400, color: "rgba(255,255,255,0.5)",
            lineHeight: 1.5, position: "relative", zIndex: 1, marginBottom: 48,
          }}>
            Quit the habits holding you back.<br />
            Build the ones that set you free.
          </p>
          <button
            onClick={() => setStep(2)}
            style={{
              position: "relative", zIndex: 1,
              background: "#4ade80", color: "#0a0e18",
              border: "none", borderRadius: 16, padding: "14px 40px",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", height: 48,
            }}
          >
            Let&apos;s begin
          </button>
        </div>
      )}

      {/* Step 2: Pick quit habit */}
      {step === 2 && (
        <div style={{
          padding: "0 24px", maxWidth: 420, width: "100%",
          animation: "fadeUp 0.4s ease", overflowY: "auto", maxHeight: "100vh",
          paddingTop: 60, paddingBottom: 40,
        }}>
          <h2 style={{
            fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700,
            color: "white", marginBottom: 8,
          }}>
            What do you want to quit?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.5 }}>
            Pick one to start. You can always add more later.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUIT_PRESETS.map((p) => {
              const Ic = getIcon(p.iconName);
              return (
                <button
                  key={p.name}
                  onClick={() => handleQuitPick(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 100,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", fontSize: 13, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  <Ic size={14} color={p.color} />
                  {p.name}
                </button>
              );
            })}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "28px 0 0", justifyContent: "center",
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
          <button
            onClick={handleSkipQuit}
            style={{
              display: "block", margin: "16px auto 0", background: "none",
              border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13,
              fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              padding: "8px 16px",
            }}
          >
            Skip — I&apos;m here to build habits
          </button>
        </div>
      )}

      {/* Step 3: Pick build habit */}
      {step === 3 && (
        <div style={{
          padding: "0 24px", maxWidth: 420, width: "100%",
          animation: "fadeUp 0.4s ease", overflowY: "auto", maxHeight: "100vh",
          paddingTop: 60, paddingBottom: 40,
        }}>
          <h2 style={{
            fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700,
            color: "white", marginBottom: 8,
          }}>
            What do you want to build?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.5 }}>
            Pick a positive habit to grow.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BUILD_PRESETS.map((p) => {
              const Ic = getIcon(p.iconName);
              return (
                <button
                  key={p.name}
                  onClick={() => handleBuildPick(p)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 100,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", fontSize: 13, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  <Ic size={14} color={p.color} />
                  {p.name}
                </button>
              );
            })}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            margin: "28px 0 0", justifyContent: "center",
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>
          <button
            onClick={handleSkipBuild}
            style={{
              display: "block", margin: "16px auto 0", background: "none",
              border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13,
              fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
              padding: "8px 16px",
            }}
          >
            {quitPick ? "Skip — just my quit habit" : "Skip"}
          </button>
          {mustPick && (
            <p style={{
              textAlign: "center", marginTop: 12,
              fontSize: 13, color: "#f59e0b", fontWeight: 500,
              animation: "fadeUp 0.3s ease",
            }}>
              Pick at least one habit to get started.
            </p>
          )}
        </div>
      )}

      {/* Step 4: Planet born */}
      {step === 4 && (
        <div style={{
          textAlign: "center", padding: "0 32px", maxWidth: 400, width: "100%",
        }}>
          {/* Planet + eggs */}
          <div style={{
            opacity: showPlanet ? 1 : 0,
            transform: showPlanet ? "scale(1)" : "scale(0.9)",
            transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            marginBottom: 20, position: "relative",
            display: "flex", justifyContent: "center", alignItems: "center",
            minHeight: 160,
          }}>
            {/* Simple planet circle */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: "radial-gradient(circle at 40% 35%, #2a3a2a, #141e14)",
              boxShadow: "0 0 40px rgba(74,222,128,0.12)",
              position: "relative",
            }}>
              {/* Sparkle burst */}
              {showPlanet && (
                <>
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <div key={i} style={{
                      position: "absolute", top: "50%", left: "50%",
                      width: 4, height: 4, borderRadius: "50%",
                      background: "#4ade80",
                      transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-70px)`,
                      animation: "sparkle 1.5s ease infinite",
                      animationDelay: `${i * 0.1}s`,
                    }} />
                  ))}
                </>
              )}
              {/* Eggs on surface */}
              {showEggs && (
                <div style={{
                  position: "absolute", bottom: 12, left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex", gap: 12,
                }}>
                  {quitPick && (
                    <div style={{
                      animation: "pop 0.3s ease",
                    }}>
                      <Creature stage={0} color={quitPick.color} happy={true} size={28} />
                    </div>
                  )}
                  {buildPick && (
                    <div style={{
                      animation: "pop 0.3s ease",
                      animationDelay: "0.1s",
                    }}>
                      <Creature stage={0} color={buildPick.color} happy={true} size={28} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div style={{
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.5s ease",
          }}>
            <p style={{
              fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 500,
              color: "white", marginBottom: 4,
            }}>
              Your journey starts now.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              One day at a time.
            </p>
          </div>

          {/* Button */}
          <div style={{
            opacity: showButton ? 1 : 0,
            transform: showButton ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.5s ease",
            marginTop: 32,
          }}>
            <button
              onClick={handleEnter}
              style={{
                background: "#4ade80", color: "#0a0e18",
                border: "none", borderRadius: 16, padding: "14px 40px",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", height: 48,
              }}
            >
              Enter Bloom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
