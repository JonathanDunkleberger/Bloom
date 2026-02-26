"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Plus, X, Flame, ChevronLeft, ChevronRight, Coins, Sparkles,
  Pencil, Shield, Sun, Moon, LayoutGrid, Download, Snowflake, Flower, Leaf, SunDim,
  Users, Share2, Calendar, RefreshCw, Wind, DollarSign,
} from "lucide-react";
import { Creature } from "@/components/creature";
import { TerrariumScene } from "@/components/terrarium-scene";
import { Heatmap } from "@/components/heatmap";
import { Confetti } from "@/components/confetti";
import { UndoToast, CoinToast } from "@/components/toast";
import { Gallery } from "@/components/gallery";
import { WelcomeBack } from "@/components/welcome-back";
import { Constellation } from "@/components/constellation";
import { WeeklyCard } from "@/components/weekly-card";
import { BloomTogether } from "@/components/bloom-together";
import { BreathingTimer } from "@/components/breathing-timer";
import { HealingTimeline } from "@/components/healing-timeline";
import { UrgeTrend } from "@/components/urge-trend";
import { RelapseModal } from "@/components/relapse-modal";
import { ReasonEditor } from "@/components/reason-editor";
import { getStage, getIcon, today, daysAgo, daysBetween, fmtDuration, fmtMoney } from "@/lib/utils";
import {
  MILESTONES, STAGE_LABELS, STAGE_THRESHOLDS,
  PRESETS, PRESET_CATEGORIES, HABIT_COLORS,
  SEASONS, getSeason, THEME, BOUNCE_BACK,
  QUIT_PRESETS,
} from "@/lib/constants";
import type { HabitWithStats, EarnedMilestones, QuitData } from "@/types";
import type { LucideIcon } from "lucide-react";
import type { SeasonKey } from "@/lib/constants";

interface BloomAppProps {
  initialHabits: HabitWithStats[];
  initialCoins: number;
  initialEarned: EarnedMilestones;
  initialStreakFreezes: Record<string, number>;
}

export function BloomApp({ initialHabits, initialCoins, initialEarned, initialStreakFreezes }: BloomAppProps) {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitWithStats[]>(initialHabits);
  const [coins, setCoins] = useState(initialCoins);
  const [earned, setEarned] = useState<EarnedMilestones>(initialEarned);
  const [streakFreezes, setStreakFreezes] = useState<Record<string, number>>(initialStreakFreezes);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bloom_dark") === "1";
    }
    return false;
  });
  const [season, setSeason] = useState<SeasonKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bloom_season") as SeasonKey | null;
      if (saved && saved in SEASONS) return saved;
    }
    return getSeason();
  });
  const th = THEME[darkMode ? "dark" : "light"];
  const sn = SEASONS[season];
  const [page, setPage] = useState<"main" | "detail" | "add" | "gallery" | "constellation" | "social">("main");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [coinToast, setCoinToast] = useState<{ msg: string; icon: LucideIcon } | null>(null);
  const [undoToast, setUndoToast] = useState<{ msg: string; onUndo: () => void } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [cName, setCName] = useState("");
  const [cColor, setCColor] = useState("#6366f1");
  const [mounted, setMounted] = useState(false);
  const [prevAllDone, setPrevAllDone] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [daysAwayCnt, setDaysAwayCnt] = useState(0);
  const [showWeekly, setShowWeekly] = useState(false);
  const [bounceBackDay, setBounceBackDay] = useState(0);
  const [bloomCode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bloom_code");
      if (saved) return saved;
      const code = `BLOOM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      localStorage.setItem("bloom_code", code);
      return code;
    }
    return "BLOOM-XXXX";
  });
  const [friends] = useState<{ name: string; streak: number; lastActive: string }[]>([]);
  const [quitDataMap, setQuitDataMap] = useState<Record<string, QuitData>>({});
  const [breathingHabit, setBreathingHabit] = useState<HabitWithStats | null>(null);
  const [relapseHabit, setRelapseHabit] = useState<HabitWithStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const terRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    // Welcome back detection
    if (typeof window !== "undefined") {
      const lastVisit = localStorage.getItem("bloom_last_visit");
      const now = today();
      if (lastVisit && lastVisit !== now) {
        const diff = Math.round((new Date(now + "T12:00:00").getTime() - new Date(lastVisit + "T12:00:00").getTime()) / 86400000);
        if (diff >= 2) {
          setDaysAwayCnt(diff);
          setShowWelcomeBack(true);
          setBounceBackDay(1);
        }
      }
      localStorage.setItem("bloom_last_visit", now);

      // Load quit data
      try {
        const raw = localStorage.getItem("bloom_quit_data");
        if (raw) setQuitDataMap(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  }, []);

  // Persist quit data
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(quitDataMap).length > 0) {
      localStorage.setItem("bloom_quit_data", JSON.stringify(quitDataMap));
    }
  }, [quitDataMap]);

  // Persist dark mode & season
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("bloom_dark", darkMode ? "1" : "0");
  }, [darkMode]);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("bloom_season", season);
  }, [season]);

  const todayStr = today();

  // Build completions map from habits logs
  const completions: Record<string, boolean> = {};
  habits.forEach((h) => {
    h.logs.forEach((l) => {
      completions[`${h.id}:${l.log_date}`] = true;
    });
  });

  // ── Quit-habit helpers ──────────────────────────────
  const isQuit = useCallback((h: HabitWithStats) => h.category === "quit", []);

  const getQuitData = useCallback(
    (hId: string): QuitData | undefined => quitDataMap[hId],
    [quitDataMap]
  );

  const getCleanDays = useCallback(
    (hId: string): number => {
      const qd = quitDataMap[hId];
      if (!qd?.quitDate) return 0;
      return daysBetween(qd.quitDate, todayStr);
    },
    [quitDataMap, todayStr]
  );

  const updateQuitData = useCallback(
    (hId: string, patch: Partial<QuitData>) => {
      setQuitDataMap((prev) => ({
        ...prev,
        [hId]: { ...prev[hId], ...patch } as QuitData,
      }));
    },
    []
  );

  const logUrge = useCallback(
    (hId: string) => {
      setQuitDataMap((prev) => {
        const cur = prev[hId];
        if (!cur) return prev;
        const urges = [...(cur.urges || []), todayStr];
        return { ...prev, [hId]: { ...cur, urges } };
      });
    },
    [todayStr]
  );

  const resetQuit = useCallback(
    (hId: string) => {
      updateQuitData(hId, { quitDate: todayStr });
    },
    [updateQuitData, todayStr]
  );

  const updateReason = useCallback(
    (hId: string, text: string) => {
      updateQuitData(hId, { reason: text });
    },
    [updateQuitData]
  );

  const totalSaved = useMemo(() => {
    return habits
      .filter((h) => h.category === "quit")
      .reduce((sum, h) => {
        const qd = quitDataMap[h.id];
        if (!qd?.quitDate) return sum;
        return sum + (qd.dailyCost || 0) * daysBetween(qd.quitDate, todayStr);
      }, 0);
  }, [habits, quitDataMap, todayStr]);

  const isComplete = useCallback(
    (hId: string, date: string) => !!completions[`${hId}:${date}`],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completions]
  );

  // Streak with freeze support
  const getStreak = useCallback(
    (hId: string) => {
      let s = 0;
      let d = 0;
      let gaps = 0;
      const maxGaps = streakFreezes[hId] || 0;
      while (true) {
        if (isComplete(hId, daysAgo(d))) {
          s++;
          d++;
        } else if (d > 0 && gaps < maxGaps) {
          gaps++;
          d++;
        } else {
          break;
        }
      }
      return s;
    },
    [isComplete, streakFreezes]
  );

  const getTotal = useCallback(
    (hId: string) => {
      const h = habits.find((x) => x.id === hId);
      return h?.logs.length ?? 0;
    },
    [habits]
  );

  const getStageForId = useCallback(
    (hId: string) => getStage(getTotal(hId)),
    [getTotal]
  );

  const isHappy = useCallback(
    (hId: string) => isComplete(hId, todayStr),
    [isComplete, todayStr]
  );

  const buildHabits = habits.filter((h) => h.category !== "quit");
  const quitHabits = habits.filter((h) => h.category === "quit");
  const totalToday = buildHabits.filter((h) => isHappy(h.id)).length;
  const todayPct = buildHabits.length ? totalToday / buildHabits.length : 0;
  const allDone = todayPct >= 1 && buildHabits.length > 0;

  // Confetti trigger
  useEffect(() => {
    if (allDone && !prevAllDone) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
    setPrevAllDone(allDone);
  }, [allDone, prevAllDone]);

  // Share terrarium as PNG
  const shareTerr = useCallback(() => {
    const el = terRef.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const data = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 800, 640);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("bloom.", 780, 625);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `bloom-terrarium-${todayStr}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setCoinToast({ msg: "Terrarium saved!", icon: Download });
      }, "image/png");
    };
    img.src = url;
  }, [todayStr]);

  const checkMilestones = (habitId: string, streak: number) => {
    let nc = 0;
    const ne = { ...earned };
    for (const m of MILESTONES) {
      const key = `${habitId}:${m.days}`;
      if (streak >= m.days && !ne[key]) {
        ne[key] = true;
        nc += m.coins;
        const Ic = getIcon(m.iconName);
        setCoinToast({ msg: `${m.label} +${m.coins}`, icon: Ic });
      }
    }
    if (nc > 0) {
      setCoins((p) => p + nc);
      setEarned(ne);
      fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: coins + nc, earned: ne }),
      }).catch(() => {});
    }
  };

  const toggleCompletion = async (hId: string) => {
    const wasComplete = isHappy(hId);

    setBouncingId(hId);
    setTimeout(() => setBouncingId(null), 600);

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== hId) return h;
        if (wasComplete) {
          return {
            ...h,
            completedToday: false,
            totalDays: h.totalDays - 1,
            logs: h.logs.filter((l) => l.log_date !== todayStr),
          };
        } else {
          return {
            ...h,
            completedToday: true,
            totalDays: h.totalDays + 1,
            logs: [...h.logs, { id: "temp", habit_id: hId, log_date: todayStr, value: 1, created_at: new Date().toISOString() }],
          };
        }
      })
    );

    try {
      const res = await fetch(`/api/habits/${hId}/log`, { method: "POST" });
      const data = await res.json();
      if (!wasComplete && data.action === "logged") {
        const streak = getStreak(hId) + 1;
        setTimeout(() => checkMilestones(hId, streak), 100);
      }
    } catch {
      router.refresh();
    }
  };

  const addHabit = async (name: string, color: string, iconName: string, cat: string = "general", dailyCost: number = 0) => {
    setPage("main");
    setCName("");
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon_name: iconName, category: cat }),
      });
      if (res.ok) {
        const newHabit = await res.json();
        setHabits((prev) => [
          ...prev,
          { ...newHabit, currentStreak: 0, totalDays: 0, completedToday: false, stage: 0, logs: [] },
        ]);
        // Initialise quit data for quit habits
        if (cat === "quit") {
          updateQuitData(newHabit.id, { quitDate: todayStr, dailyCost, reason: "", urges: [] });
        }
      }
    } catch {
      router.refresh();
    }
  };

  const removeHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    const habitLogs = habit?.logs || [];

    setHabits((p) => p.filter((h) => h.id !== id));
    if (detailId === id) {
      setDetailId(null);
      setPage("main");
    }

    setUndoToast({
      msg: `Removed "${habit?.name}"`,
      onUndo: () => {
        if (habit) setHabits((p) => [...p, { ...habit, logs: habitLogs }]);
        setUndoToast(null);
      },
    });

    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
    } catch {
      router.refresh();
    }
  };

  const saveEdit = async () => {
    if (!editName.trim() || !detailId) return;
    setHabits((p) =>
      p.map((h) => (h.id === detailId ? { ...h, name: editName.trim(), color: editColor } : h))
    );
    setEditMode(false);
    try {
      await fetch(`/api/habits/${detailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
    } catch {
      router.refresh();
    }
  };

  const buyFreeze = async (hId: string) => {
    if (coins < 50) return;
    setCoins((p) => p - 50);
    setStreakFreezes((p) => ({ ...p, [hId]: (p[hId] || 0) + 1 }));
    setCoinToast({ msg: "Streak freeze activated!", icon: Shield });
    try {
      await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coins: coins - 50,
          earned,
          streakFreezes: { ...streakFreezes, [hId]: (streakFreezes[hId] || 0) + 1 },
        }),
      });
    } catch {
      router.refresh();
    }
  };

  // Bounce-back recovery: check once per day when any habit is completed
  useEffect(() => {
    if (!mounted || !habits.length || bounceBackDay < 0) return;
    const anyDoneToday = habits.some((h) => isHappy(h.id));
    if (anyDoneToday && bounceBackDay >= 0) {
      const lastBBDate = typeof window !== "undefined" ? localStorage.getItem("bb_date") || "" : "";
      if (lastBBDate !== todayStr) {
        try { localStorage.setItem("bb_date", todayStr); } catch { /* noop */ }
        const newBB = bounceBackDay + 1;
        setBounceBackDay(newBB);
        const recovery = BOUNCE_BACK.find((b) => b.d === newBB);
        if (recovery) {
          setCoins((p) => p + recovery.c);
          setCoinToast({ msg: recovery.msg, icon: RefreshCw });
          fetch("/api/coins", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coins: coins + recovery.c, earned }),
          }).catch(() => {});
        }
        if (newBB >= 7) setBounceBackDay(-1); // Recovery complete
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, mounted, todayStr]);

  useEffect(() => {
    if (page === "add" && inputRef.current) setTimeout(() => inputRef.current?.focus(), 120);
  }, [page]);

  useEffect(() => {
    if (editMode && editRef.current) setTimeout(() => editRef.current?.focus(), 120);
  }, [editMode]);

  const detailHabit = habits.find((h) => h.id === detailId);
  const fs = mounted
    ? { opacity: 1, transform: "translateY(0)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }
    : { opacity: 0, transform: "translateY(5px)" };

  const overallHeatData = useCallback(
    (date: string) => {
      if (!habits.length) return 0;
      return habits.filter((h) => isComplete(h.id, date)).length / habits.length;
    },
    [habits, isComplete]
  );

  const detailHeatData = useCallback(
    (date: string) => {
      if (!detailId) return 0;
      return isComplete(detailId, date) ? 1 : 0;
    },
    [detailId, isComplete]
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: th.bg,
      fontFamily: "'DM Sans',-apple-system,sans-serif",
      color: th.text,
      transition: "background .4s, color .4s",
    }}>
      <Confetti active={confetti} />
      {coinToast && <CoinToast {...coinToast} onDone={() => setCoinToast(null)} />}
      {undoToast && <UndoToast {...undoToast} onDone={() => setUndoToast(null)} />}

      {/* Breathing timer overlay */}
      {breathingHabit && (
        <BreathingTimer
          habit={breathingHabit}
          onComplete={() => { setBreathingHabit(null); setCoinToast({ msg: "Urge surfed! 🌊", icon: Wind }); }}
          onClose={() => setBreathingHabit(null)}
          th={th}
        />
      )}

      {/* Relapse modal */}
      {relapseHabit && (
        <RelapseModal
          habit={relapseHabit}
          cleanDays={getCleanDays(relapseHabit.id)}
          onConfirm={() => { resetQuit(relapseHabit.id); setRelapseHabit(null); setCoinToast({ msg: "Counter reset. You've got this 💚", icon: RefreshCw }); }}
          onClose={() => setRelapseHabit(null)}
          th={th}
        />
      )}

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 14px 90px" }}>
        {/* HEADER */}
        <div style={{ ...fs, padding: "14px 2px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {page !== "main" ? (
            <button
              onClick={() => { setPage("main"); setDetailId(null); setEditMode(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 3, background: "none",
                border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                color: th.textSub, fontFamily: "inherit",
              }}
            >
              <ChevronLeft size={16} />Back
            </button>
          ) : (
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", color: th.text }}>
              bloom<span style={{ color: "#4caf50" }}>.</span>
            </h1>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {page === "main" && (
              <>
                {buildHabits.length > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: allDone ? "#4caf50" : th.textMuted,
                    background: allDone ? "rgba(76,175,80,.08)" : th.progressBg,
                    padding: "3px 10px", borderRadius: 100,
                    display: "flex", alignItems: "center", gap: 3, transition: "all .3s",
                  }}>
                    <Flame size={11} />{totalToday}/{buildHabits.length}
                  </span>
                )}
                <button
                  onClick={() => setPage("gallery")}
                  title="Collection"
                  style={{
                    background: th.progressBg, border: "none", borderRadius: 8,
                    padding: 5, cursor: "pointer", display: "flex", color: th.textSub,
                    transition: "all .15s",
                  }}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setPage("constellation")}
                  title="Constellation"
                  style={{
                    background: th.progressBg, border: "none", borderRadius: 8,
                    padding: 5, cursor: "pointer", display: "flex", color: "#8B5CF6",
                    transition: "all .15s",
                  }}
                >
                  <Sparkles size={14} />
                </button>
                <button
                  onClick={() => setPage("social")}
                  title="Bloom Together"
                  style={{
                    background: th.progressBg, border: "none", borderRadius: 8,
                    padding: 5, cursor: "pointer", display: "flex", color: "#4caf50",
                    transition: "all .15s",
                  }}
                >
                  <Users size={14} />
                </button>
                <button
                  onClick={() => setShowWeekly(true)}
                  title="Weekly Summary"
                  style={{
                    background: th.progressBg, border: "none", borderRadius: 8,
                    padding: 5, cursor: "pointer", display: "flex", color: th.textSub,
                    transition: "all .15s",
                  }}
                >
                  <Calendar size={14} />
                </button>
                <button
                  onClick={() => {
                    const ss: SeasonKey[] = ["spring", "summer", "autumn", "winter"];
                    setSeason(ss[(ss.indexOf(season) + 1) % 4]);
                  }}
                  title={`Season: ${sn.label}`}
                  style={{
                    background: th.progressBg, border: "none", borderRadius: 8,
                    padding: 5, cursor: "pointer", display: "flex",
                    color: season === "winter" ? "#6EA8D4" : season === "autumn" ? "#D4741C" : season === "spring" ? "#E8A0BF" : "#F0C040",
                    transition: "all .15s",
                  }}
                >
                  {season === "winter" ? <Snowflake size={14} /> : season === "autumn" ? <Leaf size={14} /> : season === "spring" ? <Flower size={14} /> : <SunDim size={14} />}
                </button>
              </>
            )}
            <button
              onClick={() => setDarkMode((d) => !d)}
              title={darkMode ? "Light mode" : "Dark mode"}
              style={{
                background: th.progressBg, border: "none", borderRadius: 8,
                padding: 5, cursor: "pointer", display: "flex", color: th.textSub,
                transition: "all .15s",
              }}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "3px 10px", borderRadius: 100,
              background: th.coinBg, color: "#d97706",
              fontSize: 11, fontWeight: 700,
            }}>
              <Coins size={11} />{coins}
            </div>
            {totalSaved > 0 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "3px 10px", borderRadius: 100,
                background: "rgba(76,175,80,0.08)", color: "#4caf50",
                fontSize: 11, fontWeight: 700,
              }}>
                <DollarSign size={11} />{fmtMoney(totalSaved)} saved
              </div>
            )}
          </div>
        </div>

        {/* ═══ MAIN ═══ */}
        {page === "main" && (
          <div style={fs}>
            <div ref={terRef} style={{ position: "relative" }}>
              <TerrariumScene
                habits={buildHabits} getStage={getStageForId} isHappy={isHappy}
                pct={todayPct} bouncingId={bouncingId} season={season} darkMode={darkMode}
              />
              {habits.length > 0 && (
                <button
                  onClick={shareTerr}
                  title="Save terrarium image"
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)",
                    border: "none", borderRadius: 8, padding: 5, cursor: "pointer",
                    display: "flex", color: "rgba(0,0,0,.35)",
                    transition: "all .15s", zIndex: 5,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  <Download size={13} />
                </button>
              )}
              {/* Mood indicator */}
              {habits.length > 0 && (
                <div style={{
                  position: "absolute", bottom: 8, left: 8,
                  background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", borderRadius: 8,
                  padding: "3px 8px", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.7)",
                  display: "flex", alignItems: "center", gap: 4, zIndex: 5,
                }}>
                  <span>{allDone ? "🌟" : todayPct >= 0.5 ? "😊" : todayPct > 0 ? "🌱" : "😴"}</span>
                  {allDone ? "Thriving" : todayPct >= 0.5 ? "Happy" : todayPct > 0 ? "Waking up" : "Sleepy"}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {habits.length > 0 && (
              <div style={{ padding: "10px 2px 4px" }}>
                <div style={{ height: 4, borderRadius: 2, background: th.progressBg, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: allDone
                      ? "linear-gradient(90deg,#66bb6a,#43a047)"
                      : "linear-gradient(90deg,#81c784,#4caf50)",
                    width: `${todayPct * 100}%`,
                    transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
                  }} />
                </div>
              </div>
            )}

            {/* Bounce-back recovery banner */}
            {bounceBackDay > 0 && bounceBackDay <= 7 && !allDone && (
              <div style={{
                margin: "8px 2px 0", padding: "10px 14px", borderRadius: 12,
                background: "linear-gradient(135deg,rgba(76,175,80,0.08),rgba(102,255,170,0.05))",
                border: "1px solid rgba(76,175,80,0.15)", display: "flex", alignItems: "center", gap: 10,
              }}>
                <RefreshCw size={16} color="#4caf50" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: th.text }}>
                    {bounceBackDay === 1 ? "You showed up. That's everything." : bounceBackDay <= 3 ? "Building momentum — keep it rolling!" : "You're back in the groove. Your creatures are so happy!"}
                  </div>
                  <div style={{ fontSize: 10, color: th.textSub }}>
                    {7 - bounceBackDay}d to full recovery • +{BOUNCE_BACK.find((b) => b.d === bounceBackDay)?.c ?? 0} coins earned today
                  </div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#4caf50",
                  background: "rgba(76,175,80,0.1)", borderRadius: 8, padding: "3px 8px",
                }}>
                  Day {bounceBackDay}/7
                </div>
              </div>
            )}

            {/* Gentle time-of-day nudge */}
            {totalToday === 0 && buildHabits.length > 0 && (() => {
              const hr = new Date().getHours();
              const nudge = hr < 12
                ? { emoji: "🌅", msg: "Good morning! A small step forward today?" }
                : hr < 17
                  ? { emoji: "☀️", msg: "Afternoon check-in — any habits to bloom?" }
                  : { emoji: "🌙", msg: "Evening wind-down — still time to grow today" };
              return (
                <div style={{
                  margin: "8px 2px 0", padding: "10px 14px", borderRadius: 12,
                  background: th.card, border: `1px solid ${th.cardBorder}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>{nudge.emoji}</span>
                  <span style={{ fontSize: 12, color: th.textSub, fontWeight: 500 }}>{nudge.msg}</span>
                </div>
              );
            })()}

            {/* Today's habits */}
            <div className="cd" style={{
              padding: "8px 4px", marginTop: 8,
              background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
            }}>
              <div style={{ padding: "4px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="lb" style={{ color: th.label }}>Today</span>
                <span style={{ fontSize: 10, color: th.textMuted, fontWeight: 500 }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </span>
              </div>
              {habits.length === 0 ? (
                <div style={{ padding: "36px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: th.textMuted }}>Tap + to add your first habit</p>
                </div>
              ) : (
                habits.map((h) => {
                  const quit = isQuit(h);
                  const done = !quit && isHappy(h.id);
                  const streak = quit ? 0 : getStreak(h.id);
                  const hasFz = !quit && (streakFreezes[h.id] || 0) > 0;
                  const Icon = getIcon(h.icon_name);
                  const cleanDays = quit ? getCleanDays(h.id) : 0;
                  const qd = quit ? getQuitData(h.id) : undefined;
                  const moneySaved = quit && qd ? (qd.dailyCost || 0) * cleanDays : 0;
                  return (
                    <div key={h.id} className="rw" style={{
                      animation: "fadeUp 0.3s ease",
                      background: "transparent",
                    }}>
                      {quit ? (
                        /* Quit habit: shield icon instead of checkbox */
                        <div
                          style={{
                            width: 26, height: 26, borderRadius: 8,
                            background: `${h.color}18`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}
                          onClick={() => { setDetailId(h.id); setPage("detail"); }}
                        >
                          <Shield size={14} color={h.color} />
                        </div>
                      ) : (
                        <div
                          className={`ck ${done ? "d" : ""}`}
                          style={{
                            background: done ? h.color : "transparent",
                            borderColor: done ? "transparent" : th.checkBorder,
                          }}
                          onClick={(e) => { e.stopPropagation(); toggleCompletion(h.id); }}
                        >
                          <Check size={14} color="white" strokeWidth={3} />
                        </div>
                      )}
                      <div
                        style={{
                          width: 24, height: 24, borderRadius: 7,
                          background: `${h.color}${darkMode ? "18" : "0d"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}
                        onClick={() => { setDetailId(h.id); setPage("detail"); }}
                      >
                        <Icon size={13} color={h.color} />
                      </div>
                      <div
                        style={{ flex: 1, cursor: "pointer" }}
                        onClick={() => { setDetailId(h.id); setPage("detail"); }}
                      >
                        <span
                          style={{
                            fontSize: 14, fontWeight: 500,
                            textDecoration: !quit && done ? "line-through" : "none",
                            color: !quit && done ? th.textMuted : th.text,
                            transition: "all 0.2s",
                          }}
                        >
                          {h.name}
                        </span>
                        {quit && cleanDays > 0 && (
                          <div style={{ fontSize: 10, color: th.textSub, fontWeight: 500, marginTop: 1 }}>
                            {fmtDuration(cleanDays)} clean{moneySaved > 0 && <span style={{ color: "#4caf50", marginLeft: 4 }}>• {fmtMoney(moneySaved)} saved</span>}
                          </div>
                        )}
                      </div>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 5 }}
                        onClick={() => { setDetailId(h.id); setPage("detail"); }}
                      >
                        {quit ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); logUrge(h.id); setCoinToast({ msg: "Urge resisted 💪", icon: Wind }); }}
                            style={{
                              fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 100,
                              background: `${h.color}12`, color: h.color,
                              border: "none", cursor: "pointer", fontFamily: "inherit",
                              display: "inline-flex", alignItems: "center", gap: 3,
                            }}
                          >
                            <Wind size={9} /> Urge
                          </button>
                        ) : (
                          <>
                            {hasFz && <Shield size={10} color="#42b4d6" style={{ opacity: 0.5 }} />}
                            {streak > 0 && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                                background: streak >= 7 ? th.streakActiveBg : th.streakBg,
                                color: streak >= 7 ? "#d97706" : th.textMuted,
                                display: "inline-flex", alignItems: "center", gap: 2,
                              }}>
                                <Flame size={9} />{streak}d
                              </span>
                            )}
                          </>
                        )}
                        <ChevronRight size={14} color={th.textFaint} />
                      </div>
                      <button className="dl" style={{ color: th.textFaint }} onClick={(e) => { e.stopPropagation(); removeHabit(h.id); }}>
                        <X size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* All activity heatmap */}
            {buildHabits.length > 0 && (() => {
              // Streak-at-risk alerts
              const atRisk = buildHabits.filter((h) => !isHappy(h.id) && getStreak(h.id) >= 3);
              return atRisk.length > 0 ? (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {atRisk.slice(0, 2).map((h) => (
                    <div key={h.id} onClick={() => toggleCompletion(h.id)} style={{
                      padding: "8px 12px", borderRadius: 10, cursor: "pointer",
                      background: `linear-gradient(90deg,${h.color}08,${h.color}03)`,
                      border: `1px solid ${h.color}18`,
                      display: "flex", alignItems: "center", gap: 8, transition: "all .15s",
                    }}>
                      <Flame size={12} color={h.color} />
                      <span style={{ flex: 1, fontSize: 11, color: th.text }}>
                        <b>{h.name}</b> — tap to protect your <span style={{ color: h.color, fontWeight: 700 }}>{getStreak(h.id)}d streak</span>
                      </span>
                      <ChevronRight size={12} color={th.textFaint} />
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Next evolution preview */}
            {buildHabits.length > 0 && (() => {
              const closest = buildHabits
                .map((h) => ({ h, stage: getStageForId(h.id), total: getTotal(h.id) }))
                .filter((c) => c.stage < 4)
                .map((c) => ({ ...c, next: STAGE_THRESHOLDS[c.stage + 1], remaining: STAGE_THRESHOLDS[c.stage + 1] - c.total }))
                .sort((a, b) => a.remaining - b.remaining)[0];
              if (!closest || closest.remaining > 10) return null;
              return (
                <div style={{
                  marginTop: 8, padding: "10px 14px", borderRadius: 12,
                  background: `linear-gradient(135deg,${closest.h.color}06,rgba(255,215,0,0.03))`,
                  border: `1px solid ${closest.h.color}15`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ position: "relative" }}>
                    <Creature stage={closest.stage} color={closest.h.color} happy={true} size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: th.text }}>
                      {closest.h.name} evolves in <span style={{ color: closest.h.color }}>{closest.remaining} days</span>
                    </div>
                    <div style={{ fontSize: 10, color: th.textSub }}>
                      {STAGE_LABELS[closest.stage]} → {STAGE_LABELS[closest.stage + 1]}
                    </div>
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    border: `2px dashed ${closest.h.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.4,
                  }}>
                    <span style={{ fontSize: 10 }}>?</span>
                  </div>
                </div>
              );
            })()}

            {habits.length > 0 && (
              <div className="cd" style={{
                padding: "12px 10px", marginTop: 10,
                background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
              }}>
                <div className="lb" style={{ padding: "0 4px 8px", color: th.label }}>Activity</div>
                <Heatmap getData={overallHeatData} color="#4caf50" heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
              </div>
            )}
          </div>
        )}

        {/* ═══ DETAIL ═══ */}
        {page === "detail" && detailHabit && (() => {
          const dq = isQuit(detailHabit);
          const cleanD = dq ? getCleanDays(detailHabit.id) : 0;
          const dqd = dq ? getQuitData(detailHabit.id) : undefined;
          const urges = dqd?.urges || [];
          return (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            <div
              className="cd"
              style={{
                padding: 22, textAlign: "center", marginBottom: 10,
                background: `linear-gradient(180deg, ${detailHabit.color}08 0%, ${th.card} 50%)`,
                borderColor: th.cardBorder, boxShadow: th.cardShadow,
              }}
            >
              {dq ? (
                /* ── Quit habit hero: big clean counter ── */
                <>
                  <Creature stage={Math.min(4, Math.floor(cleanD / 7))} color={detailHabit.color} happy={cleanD > 0} size={88} />
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 42, fontWeight: 700, color: detailHabit.color, marginTop: 8 }}>
                    {fmtDuration(cleanD)}
                  </div>
                  <div style={{ fontSize: 12, color: th.textSub, fontWeight: 500 }}>clean</div>
                </>
              ) : (
                <Creature stage={getStageForId(detailHabit.id)} color={detailHabit.color} happy={isHappy(detailHabit.id)} size={88} />
              )}

              {editMode ? (
                <div style={{ marginTop: 8, maxWidth: 260, margin: "8px auto 0" }}>
                  <input
                    ref={editRef} className="inp" value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); }}
                    style={{
                      textAlign: "center", marginBottom: 8,
                      background: th.inputBg, borderColor: th.inputBorder, color: th.text,
                    }}
                  />
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10 }}>
                    {HABIT_COLORS.map((c) => (
                      <div key={c} className={`ct ${editColor === c ? "sl" : ""}`} style={{ background: c }} onClick={() => setEditColor(c)} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button className="btn-s" onClick={() => setEditMode(false)} style={{ background: th.progressBg, color: th.textSub }}>Cancel</button>
                    <button className="btn-s" onClick={saveEdit} style={{ background: darkMode ? "#4caf50" : "#1a1a2e", color: "white" }}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 500, color: th.text }}>{detailHabit.name}</h2>
                    <button
                      onClick={() => { setEditMode(true); setEditName(detailHabit.name); setEditColor(detailHabit.color); }}
                      style={{ background: th.progressBg, border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}
                    >
                      <Pencil size={12} color={th.textSub} />
                    </button>
                  </div>
                  <p style={{ fontSize: 10, color: th.textSub, marginTop: 2 }}>
                    {dq ? "Quit journey" : `${STAGE_LABELS[getStageForId(detailHabit.id)]} creature`}
                  </p>
                </>
              )}

              {/* Evolution progress – build habits only */}
              {!editMode && !dq && getStageForId(detailHabit.id) < 4 &&
                (() => {
                  const st = getStageForId(detailHabit.id);
                  const tot = getTotal(detailHabit.id);
                  const nx = STAGE_THRESHOLDS[st + 1];
                  const pv = STAGE_THRESHOLDS[st];
                  const pct = Math.min(((tot - pv) / (nx - pv)) * 100, 100);
                  return (
                    <div style={{ maxWidth: 240, margin: "14px auto 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: th.textMuted, marginBottom: 3 }}>
                        <span>{tot} days</span><span>{nx} to evolve</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: th.progressBg, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3, width: `${pct}%`,
                          background: `linear-gradient(90deg,${detailHabit.color}88,${detailHabit.color})`,
                          transition: "width 0.4s",
                        }} />
                      </div>
                    </div>
                  );
                })()}

              {/* Stats */}
              {!editMode && (
                <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 18 }}>
                  {dq ? (
                    [
                      { l: "Clean", v: cleanD > 0 ? `${cleanD}d` : "—" },
                      { l: "Urges beaten", v: urges.length },
                      { l: "Saved", v: dqd ? fmtMoney((dqd.dailyCost || 0) * cleanD) : "$0" },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>{s.v}</div>
                        <div className="lb" style={{ marginTop: 2, color: th.label }}>{s.l}</div>
                      </div>
                    ))
                  ) : (
                    [
                      { l: "Streak", v: `${getStreak(detailHabit.id)}d` },
                      { l: "Total", v: getTotal(detailHabit.id) },
                      { l: "Stage", v: STAGE_LABELS[getStageForId(detailHabit.id)] },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>{s.v}</div>
                        <div className="lb" style={{ marginTop: 2, color: th.label }}>{s.l}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ── Quit-specific sections ── */}
            {dq && (
              <>
                {/* Breathing + Reset buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button
                    onClick={() => setBreathingHabit(detailHabit)}
                    className="cd"
                    style={{
                      flex: 1, padding: "14px 10px", textAlign: "center", cursor: "pointer",
                      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Wind size={16} color={detailHabit.color} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: th.text }}>Breathe</div>
                      <div style={{ fontSize: 10, color: th.textSub }}>Urge surfing</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setRelapseHabit(detailHabit)}
                    className="cd"
                    style={{
                      flex: 1, padding: "14px 10px", textAlign: "center", cursor: "pointer",
                      background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <RefreshCw size={16} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: th.text }}>Reset</div>
                      <div style={{ fontSize: 10, color: th.textSub }}>Start over</div>
                    </div>
                  </button>
                </div>

                {/* Reason editor */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <ReasonEditor
                    value={dqd?.reason}
                    onSave={(text) => updateReason(detailHabit.id, text)}
                    color={detailHabit.color}
                    th={th}
                  />
                </div>

                {/* Healing timeline */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <HealingTimeline habit={detailHabit} cleanDays={cleanD} th={th} />
                </div>

                {/* Urge trend */}
                {urges.length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <UrgeTrend urgeLog={urges} color={detailHabit.color} th={th} />
                  </div>
                )}
              </>
            )}

            {/* Streak freeze – build habits only */}
            {!dq && (
            <div className="cd" style={{
              padding: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between",
              background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={16} color="#42b4d6" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: th.text }}>Streak Freeze</div>
                  <div style={{ fontSize: 10, color: th.textSub }}>
                    {(streakFreezes[detailHabit.id] || 0) > 0
                      ? `${streakFreezes[detailHabit.id]} freeze${(streakFreezes[detailHabit.id] || 0) > 1 ? "s" : ""} active`
                      : "Protect your streak from one missed day"}
                  </div>
                </div>
              </div>
              <button
                className="btn-s"
                onClick={() => buyFreeze(detailHabit.id)}
                style={{
                  background: coins >= 50 ? th.freezeBtnBg : th.freezeBtnOff,
                  color: coins >= 50 ? "#42b4d6" : th.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                <Coins size={11} /> 50
              </button>
            </div>
            )}

            {/* Activity heatmap */}
            <div className="cd" style={{
              padding: "12px 10px", marginBottom: 10,
              background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
            }}>
              <div className="lb" style={{ padding: "0 4px 8px", color: th.label }}>Activity</div>
              <Heatmap getData={detailHeatData} color={detailHabit.color} weeks={20} heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
            </div>

            {/* Milestones */}
            <div className="cd" style={{
              padding: 14, marginBottom: 10,
              background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
            }}>
              <div className="lb" style={{ marginBottom: 8, color: th.label }}>Milestones</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {MILESTONES.map((m) => {
                  const e = !!earned[`${detailHabit.id}:${m.days}`];
                  const Ic = getIcon(m.iconName);
                  return (
                    <div key={m.days} style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                      borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: e ? th.streakActiveBg : th.hoverBg,
                      color: e ? "#d97706" : th.textMuted,
                      border: `1px solid ${e ? "rgba(245,158,11,.1)" : th.cardBorder}`,
                      transition: "all 0.2s",
                    }}>
                      <Ic size={12} />{m.label}{e && <span style={{ opacity: 0.5 }}>+{m.coins}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeHabit(detailHabit.id)}
              style={{
                width: "100%", padding: 12, borderRadius: 12,
                border: `1px solid ${th.dangerBorder}`, background: th.dangerBg,
                color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.12s",
              }}
            >
              Remove habit
            </button>
          </div>
          );
        })()}

        {/* ═══ GALLERY ═══ */}
        {page === "gallery" && (
          <Gallery habits={habits} getStage={getStageForId} getTotal={getTotal} isHappy={isHappy} th={th} />
        )}

        {/* ═══ CONSTELLATION ═══ */}
        {page === "constellation" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            <Constellation habits={habits} isDone={isComplete} getStreak={getStreak} getTotal={getTotal} th={th} />
          </div>
        )}

        {/* ═══ SOCIAL ═══ */}
        {page === "social" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            <BloomTogether
              habits={habits} getStage={getStageForId} isHappy={isHappy}
              getStreak={getStreak} getTotal={getTotal}
              bloomCode={bloomCode} friends={friends}
              onInvite={() => {
                if (navigator.share) {
                  navigator.share({ title: "Bloom Together", text: `Join me on bloom! My planet code: ${bloomCode}` }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(bloomCode);
                  setCoinToast({ msg: "Code copied!", icon: Share2 });
                }
              }}
              th={th}
            />
          </div>
        )}
      </div>

      {/* FAB */}
      {page === "main" && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50 }}>
          <button className="fab" onClick={() => setPage("add")}>
            <Plus size={22} />
          </button>
        </div>
      )}

      {/* ADD */}
      {page === "add" && (
        <div className="mbg" style={{ background: th.overlayBg }} onClick={(e) => { if (e.target === e.currentTarget) setPage("main"); }}>
          <div className="ml" style={{ background: th.modalBg }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 500, color: th.text }}>Add habit</h2>
              <button
                onClick={() => setPage("main")}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", color: th.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Quit presets ── */}
            {(() => {
              const quits = QUIT_PRESETS.filter((p) => !habits.find((h) => h.name === p.name));
              if (!quits.length) return null;
              return (
                <div style={{ marginBottom: 12 }}>
                  <div className="lb" style={{ marginBottom: 5, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={10} /> Quit a habit
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {quits.map((p) => {
                      const Ic = getIcon(p.iconName);
                      return (
                        <button key={p.name} className="pb" style={{
                          background: th.card, borderColor: th.cardBorder, color: th.text,
                        }} onClick={() => addHabit(p.name, p.color, p.iconName, "quit", p.cost)}>
                          <Ic size={14} color={p.color} />{p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── Build presets ── */}
            {PRESET_CATEGORIES.map((gr) => {
              const its = PRESETS.filter(
                (p) => p.cat === gr.cat && !habits.find((h) => h.name === p.name)
              );
              if (!its.length) return null;
              return (
                <div key={gr.cat} style={{ marginBottom: 12 }}>
                  <div className="lb" style={{ marginBottom: 5, color: th.label }}>{gr.label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {its.map((p) => {
                      const Ic = getIcon(p.iconName);
                      return (
                        <button key={p.name} className="pb" style={{
                          background: th.card, borderColor: th.cardBorder, color: th.text,
                        }} onClick={() => addHabit(p.name, p.color, p.iconName)}>
                          <Ic size={14} color={p.color} />{p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 6 }}>
              <div className="lb" style={{ marginBottom: 5, color: th.label }}>Custom</div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                {HABIT_COLORS.map((c) => (
                  <div key={c} className={`ct ${cColor === c ? "sl" : ""}`} style={{ background: c }} onClick={() => setCColor(c)} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <input
                  ref={inputRef} className="inp" placeholder="Habit name..." value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && cName.trim()) addHabit(cName.trim(), cColor, "Target"); }}
                  style={{ background: th.inputBg, borderColor: th.inputBorder, color: th.text }}
                />
                <button
                  onClick={() => { if (cName.trim()) addHabit(cName.trim(), cColor, "Target"); }}
                  style={{
                    padding: "0 18px", borderRadius: 12,
                    background: cName.trim() ? "linear-gradient(135deg,#4caf50,#2e7d32)" : th.progressBg,
                    color: cName.trim() ? "white" : th.textMuted,
                    border: "none", fontSize: 13, fontWeight: 600,
                    cursor: cName.trim() ? "pointer" : "default",
                    fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Back modal */}
      {showWelcomeBack && (
        <WelcomeBack daysAway={daysAwayCnt} onClose={() => setShowWelcomeBack(false)} th={th} />
      )}

      {/* Weekly Summary modal */}
      {showWeekly && (
        <WeeklyCard
          habits={habits} isDone={isComplete} getStreak={getStreak}
          getTotal={getTotal} getStage={getStageForId} todayPct={todayPct}
          coins={coins} season={season} th={th} onClose={() => setShowWeekly(false)}
        />
      )}
    </div>
  );
}
