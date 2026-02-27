"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Plus, X, Flame, ChevronLeft, Coins, Sparkles,
  Pencil, Shield, Sun, Moon, LayoutGrid,
  Users, RefreshCw, Wind, DollarSign,
  Sunrise, SunMedium, MoonStar, Menu, Store, Snowflake,
} from "lucide-react";
import { Creature } from "@/components/creature";
import { TerrariumScene } from "@/components/terrarium-scene";
import { Heatmap } from "@/components/heatmap";
import { Confetti } from "@/components/confetti";
import { UndoToast, CoinToast } from "@/components/toast";
import { Gallery } from "@/components/gallery";
import { WelcomeBack } from "@/components/welcome-back";
import { Constellation } from "@/components/constellation";
import { BreathingTimer } from "@/components/breathing-timer";
import { HealingTimeline } from "@/components/healing-timeline";
import { UrgeTrend } from "@/components/urge-trend";
import { RelapseModal } from "@/components/relapse-modal";
import { ReasonEditor } from "@/components/reason-editor";
import { Shop } from "@/components/shop";
import { UrgeSupport } from "@/components/urge-support";
import { BloomPlusScreen, BloomPlusMiniPrompt, SevenDayCelebration } from "@/components/bloom-plus-screen";
import { Onboarding } from "@/components/onboarding";
import { MultiHabitHeatmap } from "@/components/multi-habit-heatmap";
import { MilestoneCoin, MilestoneCelebration, CoinBadge, CoinRow, MILESTONE_COINS } from "@/components/milestone-coin";
import type { CoinTier } from "@/components/milestone-coin";
import { getStage, getIcon, today, daysAgo, daysBetween, fmtDuration, fmtMoney, fmtQuitDate, haptic, getGreeting, formatLiveTimer } from "@/lib/utils";
import {
  MILESTONES, STAGE_LABELS, STAGE_THRESHOLDS,
  PRESETS, PRESET_CATEGORIES, HABIT_COLORS, FREE_HABIT_LIMIT,
  SEASONS, getSeason, THEME, BOUNCE_BACK,
  QUIT_PRESETS, SHOP_ITEMS,
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
  const [frozenHabits, setFrozenHabits] = useState<Record<string, boolean>>({});
  const [earnedMilestoneCoins, setEarnedMilestoneCoins] = useState<Record<string, string[]>>({});
  const [milestoneCelebration, setMilestoneCelebration] = useState<{ tier: CoinTier; habitName: string; coinReward: number } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [season, setSeason] = useState<SeasonKey>(getSeason());
  const th = THEME[darkMode ? "dark" : "light"];
  const [page, setPage] = useState<"main" | "detail" | "add" | "gallery" | "constellation" | "social" | "shop">("main");
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
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [daysAwayCnt, setDaysAwayCnt] = useState(0);
  const [bounceBackDay, setBounceBackDay] = useState(0);
  const [quitDataMap, setQuitDataMap] = useState<Record<string, QuitData>>({});
  const [breathingHabit, setBreathingHabit] = useState<HabitWithStats | null>(null);
  const [relapseHabit, setRelapseHabit] = useState<HabitWithStats | null>(null);
  const [urgeSupportHabit, setUrgeSupportHabit] = useState<HabitWithStats | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const terRef = useRef<HTMLDivElement>(null);

  // ── Bloom+ tier state ──
  const [isPro, setIsPro] = useState(false);
  const [proExpiry, setProExpiry] = useState<string | null>(null);
  const [lastBonusDate, setLastBonusDate] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [sevenDayCelebration, setSevenDayCelebration] = useState<{ habitName: string; moneySaved: number; urgeCount: number } | null>(null);
  const logoTapRef = useRef<{ count: number; timer: ReturnType<typeof setTimeout> | null }>({ count: 0, timer: null });

  // ── Onboarding state ──
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // ── All-done celebration state ──
  const [showAurora, setShowAurora] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState(false);
  const [celebrationBannerFading, setCelebrationBannerFading] = useState(false);
  const [shootingStar, setShootingStar] = useState(false);
  const [creatureBounce, setCreatureBounce] = useState(false);
  const prevAllDoneRef = useRef(false);

  // ── Live timer for quit detail ──
  const [liveNow, setLiveNow] = useState(Date.now());

  const isBloomPlus = useCallback((): boolean => {
    if (!isPro) return false;
    if (proExpiry && new Date(proExpiry) < new Date()) {
      setIsPro(false);
      setProExpiry(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("bloom_pro");
        localStorage.removeItem("bloom_pro_expiry");
      }
      return false;
    }
    return true;
  }, [isPro, proExpiry]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);

    // Hydrate localStorage-dependent state after mount
    const savedDark = localStorage.getItem("bloom_dark");
    if (savedDark === "1") setDarkMode(true);
    const savedSeason = localStorage.getItem("bloom_season") as SeasonKey | null;
    if (savedSeason && savedSeason in SEASONS) setSeason(savedSeason);

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

      // Load owned shop items
      try {
        const rawItems = localStorage.getItem("bloom_owned_items");
        if (rawItems) setOwnedItems(JSON.parse(rawItems));
      } catch { /* ignore */ }

      // Load frozen habits
      try {
        const rawFrozen = localStorage.getItem("bloom_frozen_habits");
        if (rawFrozen) setFrozenHabits(JSON.parse(rawFrozen));
      } catch { /* ignore */ }

      // Load earned milestone coins
      try {
        const rawMC = localStorage.getItem("bloom_milestone_coins");
        if (rawMC) setEarnedMilestoneCoins(JSON.parse(rawMC));
      } catch { /* ignore */ }

      // Load Bloom+ state
      const savedPro = localStorage.getItem("bloom_pro");
      if (savedPro === "1") setIsPro(true);
      const savedExpiry = localStorage.getItem("bloom_pro_expiry");
      if (savedExpiry) setProExpiry(savedExpiry);
      const savedBonus = localStorage.getItem("bloom_last_bonus");
      if (savedBonus) setLastBonusDate(savedBonus);

      // Check onboarding
      const onboardingDone = localStorage.getItem("bloom_onboarding_complete");
      if (!onboardingDone && initialHabits.length === 0) {
        setShowOnboarding(true);
      }

      setAppLoading(false);
    }
  }, []);

  // Live timer — updates every 60s for quit detail pages
  useEffect(() => {
    const interval = setInterval(() => setLiveNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist quit data with verification
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(quitDataMap).length > 0) {
      const data = JSON.stringify(quitDataMap);
      localStorage.setItem("bloom_quit_data", data);
      if (process.env.NODE_ENV === "development") {
        const readBack = localStorage.getItem("bloom_quit_data");
        if (!readBack) console.error("SAVE FAILED: quit data not persisted");
      }
    }
  }, [quitDataMap]);

  // Persist owned items with verification
  useEffect(() => {
    if (typeof window !== "undefined" && ownedItems.length > 0) {
      const data = JSON.stringify(ownedItems);
      localStorage.setItem("bloom_owned_items", data);
      if (process.env.NODE_ENV === "development") {
        const readBack = localStorage.getItem("bloom_owned_items");
        if (!readBack) console.error("SAVE FAILED: owned items not persisted");
      }
    }
  }, [ownedItems]);

  // Persist frozen habits
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(frozenHabits).length > 0) {
      localStorage.setItem("bloom_frozen_habits", JSON.stringify(frozenHabits));
    }
  }, [frozenHabits]);

  // Persist milestone coins
  useEffect(() => {
    if (typeof window !== "undefined" && Object.keys(earnedMilestoneCoins).length > 0) {
      localStorage.setItem("bloom_milestone_coins", JSON.stringify(earnedMilestoneCoins));
    }
  }, [earnedMilestoneCoins]);

  // Persist dark mode & season
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("bloom_dark", darkMode ? "1" : "0");
  }, [darkMode]);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("bloom_season", season);
  }, [season]);

  // Persist Bloom+ state
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bloom_pro", isPro ? "1" : "0");
      if (proExpiry) localStorage.setItem("bloom_pro_expiry", proExpiry);
      else localStorage.removeItem("bloom_pro_expiry");
    }
  }, [isPro, proExpiry]);

  // Daily bonus coins for Bloom+ users
  useEffect(() => {
    if (!mounted) return;
    const todayVal = today();
    if (isBloomPlus() && lastBonusDate !== todayVal) {
      setCoins((c) => c + 5);
      setLastBonusDate(todayVal);
      localStorage.setItem("bloom_last_bonus", todayVal);
      setCoinToast({ msg: "+5 daily Bloom+ coins", icon: Coins });
      fetch("/api/coins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coins: coins + 5 }) }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isPro]);

  // Dev toggle: tap logo 5x
  const onLogoTap = useCallback(() => {
    const ref = logoTapRef.current;
    ref.count++;
    if (ref.timer) clearTimeout(ref.timer);
    ref.timer = setTimeout(() => { ref.count = 0; }, 2000);
    if (ref.count >= 5) {
      ref.count = 0;
      const newPro = !isPro;
      setIsPro(newPro);
      setProExpiry(newPro ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null);
      setCoinToast({ msg: newPro ? "Bloom+ enabled (dev)" : "Bloom+ disabled (dev)", icon: Sparkles });
    }
  }, [isPro]);

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
      // Save bestStreak before resetting
      const qd = quitDataMap[hId];
      const currentClean = getCleanDays(hId);
      const prevBest = qd?.bestStreak ?? 0;
      const newBest = Math.max(currentClean, prevBest);
      // Store exact ISO timestamp so "Started today at 6:04 PM" works
      updateQuitData(hId, { quitDate: new Date().toISOString(), bestStreak: newBest });
    },
    [updateQuitData, quitDataMap, getCleanDays]
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
      // Quit habits: streak = clean days
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        return getCleanDays(hId);
      }
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
    [isComplete, streakFreezes, habits, getCleanDays]
  );

  const getTotal = useCallback(
    (hId: string) => {
      // Quit habits: total = clean days (same as streak)
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        return getCleanDays(hId);
      }
      return h?.logs.length ?? 0;
    },
    [habits, getCleanDays]
  );

  const isHappy = useCallback(
    (hId: string) => {
      // Quit habits are "done" every day they remain clean
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        const qd = quitDataMap[hId];
        return !!(qd?.quitDate && qd.quitDate <= todayStr);
      }
      return isComplete(hId, todayStr);
    },
    [isComplete, todayStr, habits, quitDataMap]
  );

  const getStageForId = useCallback(
    (hId: string) => {
      // Quit habits evolve based on best streak (survives relapse), not current streak alone
      const h = habits.find((x) => x.id === hId);
      if (h?.category === "quit") {
        const qd = quitDataMap[hId];
        if (!qd?.quitDate) return 0;
        const cleanDays = daysBetween(qd.quitDate, todayStr);
        const best = Math.max(cleanDays, qd.bestStreak ?? 0);
        return getStage(best);
      }
      return getStage(getTotal(hId));
    },
    [getTotal, habits, quitDataMap, todayStr]
  );

  const buildHabits = habits.filter((h) => h.category !== "quit");
  const quitHabits = habits.filter((h) => h.category === "quit");
  const totalToday = habits.filter((h) => isHappy(h.id)).length;
  const todayPct = habits.length ? totalToday / habits.length : 0;
  const allDone = todayPct >= 1 && habits.length > 0;

  // All-done celebration + aurora
  useEffect(() => {
    setShowAurora(allDone);
    if (allDone && !prevAllDoneRef.current) {
      // Trigger one-time celebration sequence
      haptic("success");
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
      // Creature bounce at 300ms
      setTimeout(() => { setCreatureBounce(true); setTimeout(() => setCreatureBounce(false), 500); }, 300);
      // Shooting star at 500ms
      setTimeout(() => { setShootingStar(true); setTimeout(() => setShootingStar(false), 900); }, 500);
      // Banner at 800ms
      setTimeout(() => {
        setCelebrationBanner(true);
        // Auto-dismiss after 4s
        setTimeout(() => {
          setCelebrationBannerFading(true);
          setTimeout(() => { setCelebrationBanner(false); setCelebrationBannerFading(false); }, 300);
        }, 4000);
      }, 800);
      // +10 coins at 1200ms
      setTimeout(() => {
        setCoins((p) => {
          const nv = p + 10;
          fetch("/api/coins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coins: nv }) }).catch(() => {});
          return nv;
        });
        setCoinToast({ msg: "+10 all habits done!", icon: Sparkles });
      }, 1200);
    }
    prevAllDoneRef.current = allDone;
  }, [allDone]);

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
      haptic("medium");
      setCoins((prev) => {
        const newCoins = prev + nc;
        fetch("/api/coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coins: newCoins }),
        }).catch(() => {});
        return newCoins;
      });
      setEarned(ne);
    }
  };

  // Check AA-style milestone coins
  const checkMilestoneCoins = useCallback((habitId: string, habitName: string, isQuitHabit: boolean, days: number, hours?: number) => {
    const current = earnedMilestoneCoins[habitId] || [];
    const coinsToCheck = isQuitHabit
      ? MILESTONE_COINS
      : MILESTONE_COINS.filter((c) => c.days > 0);

    let newlyEarned: CoinTier | null = null;
    const updated = [...current];

    for (const coin of coinsToCheck) {
      if (current.includes(coin.key)) continue;
      const earned = isQuitHabit
        ? (hours !== undefined ? hours >= coin.hours : days >= coin.days)
        : days >= coin.days;
      if (earned) {
        updated.push(coin.key);
        newlyEarned = coin; // keep track of latest new coin for celebration
      }
    }

    if (updated.length > current.length) {
      setEarnedMilestoneCoins((prev) => ({ ...prev, [habitId]: updated }));
      // Show celebration for the highest newly earned coin
      if (newlyEarned) {
        // Map coin tier to a coin reward (use the existing MILESTONES coin value if matching, otherwise 0)
        const matchingMilestone = MILESTONES.find((m) => m.days === newlyEarned!.days);
        setMilestoneCelebration({
          tier: newlyEarned,
          habitName,
          coinReward: matchingMilestone?.coins || 0,
        });
        haptic("success");
      }
    }
  }, [earnedMilestoneCoins]);

  // Check milestone coins for quit habits (passive time growth)
  useEffect(() => {
    if (!mounted) return;
    habits.filter((h) => h.category === "quit").forEach((h) => {
      const qd = getQuitData(h.id);
      if (!qd?.quitDate) return;
      const cleanDays = getCleanDays(h.id);
      const hoursSinceQuit = Math.floor((Date.now() - new Date(qd.quitDate).getTime()) / (1000 * 60 * 60));
      checkMilestoneCoins(h.id, h.name, true, cleanDays, hoursSinceQuit);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, todayStr]);

  // Check milestones for quit habits (their streaks grow passively with time)
  useEffect(() => {
    if (!mounted) return;
    habits.filter((h) => h.category === "quit").forEach((h) => {
      const cleanDays = getCleanDays(h.id);
      if (cleanDays > 0) checkMilestones(h.id, cleanDays);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, todayStr]);

  // First-day celebration toasts for quit habits (24h, 72h, 7d)
  useEffect(() => {
    if (!mounted) return;
    const fired = JSON.parse(localStorage.getItem("bloom_quit_celebrations") || "{}") as Record<string, number[]>;
    let changed = false;
    habits.filter((h) => h.category === "quit").forEach((h) => {
      const cd = getCleanDays(h.id);
      const prev = fired[h.id] || [];
      const celebrations = [
        { day: 1, msg: "24 hours clean. Your body is already healing.", bonus: 5 },
        { day: 3, msg: "72 hours. The hardest part is behind you.", bonus: 10 },
        { day: 7, msg: "One week. You\u2019re rewriting your story.", bonus: 25 },
      ];
      for (const c of celebrations) {
        if (cd >= c.day && !prev.includes(c.day)) {
          prev.push(c.day);
          changed = true;
          setCoinToast({ msg: `${c.msg} +${c.bonus}`, icon: Sparkles });
          setCoins((p) => {
            const nv = p + c.bonus;
            fetch("/api/coins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coins: nv }) }).catch(() => {});
            return nv;
          });
        }
      }
      fired[h.id] = prev;
    });
    if (changed) localStorage.setItem("bloom_quit_celebrations", JSON.stringify(fired));

    // 7-day Bloom+ nudge — show SevenDayCelebration once per quit habit
    if (!isBloomPlus()) {
      const shown7 = JSON.parse(localStorage.getItem("bloom_7day_shown") || "{}") as Record<string, boolean>;
      for (const h of habits.filter((h) => h.category === "quit")) {
        const cd = getCleanDays(h.id);
        if (cd >= 7 && !shown7[h.id]) {
          shown7[h.id] = true;
          localStorage.setItem("bloom_7day_shown", JSON.stringify(shown7));
          const qd = quitDataMap[h.id];
          const cost = qd?.dailyCost ?? 0;
          const urgeCount = (qd?.urges ?? []).length;
          setSevenDayCelebration({ habitName: h.name, moneySaved: Math.round(cost * cd * 100) / 100, urgeCount });
          break; // only show one at a time
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, todayStr]);

  const toggleCompletion = async (hId: string) => {
    const wasComplete = isHappy(hId);

    haptic("light");
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
        // Check AA-style milestone coins for build habits
        const habit = habits.find((h) => h.id === hId);
        if (habit && habit.category !== "quit") {
          setTimeout(() => checkMilestoneCoins(hId, habit.name, false, streak), 200);
        }
      }
    } catch {
      router.refresh();
    }
  };

  const [addError, setAddError] = useState("");

  const addHabit = async (name: string, color: string, iconName: string, cat: string = "general", dailyCost: number = 0) => {
    setAddError("");
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
          updateQuitData(newHabit.id, { quitDate: new Date().toISOString(), dailyCost, reason: "", urges: [], bestStreak: 0 });
        }
        setPage("main");
        setCName("");
      } else {
        const err = await res.json().catch(() => null);
        setAddError(err?.error || "Failed to add habit. Please try again.");
      }
    } catch {
      setAddError("Network error. Please try again.");
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
    const newFreezes = { ...streakFreezes, [hId]: (streakFreezes[hId] || 0) + 1 };
    setStreakFreezes(newFreezes);
    setCoinToast({ msg: "Streak freeze activated!", icon: Shield });
    setCoins((prev) => {
      const newCoins = prev - 50;
      fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: newCoins, streakFreezes: newFreezes }),
      }).catch(() => router.refresh());
      return newCoins;
    });
  };

  const toggleFreeze = (hId: string) => {
    const isFrozen = !!frozenHabits[hId];
    setFrozenHabits((prev) => ({ ...prev, [hId]: !isFrozen }));
    haptic("light");
    if (!isFrozen) {
      setCoinToast({ msg: "Habit frozen. Streak preserved while paused.", icon: Snowflake });
    } else {
      setCoinToast({ msg: "Habit unfrozen. Welcome back!", icon: Snowflake });
    }
  };

  const buyItem = (itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item || ownedItems.includes(itemId)) return;
    if (coins < item.price) return;
    setOwnedItems((prev) => [...prev, itemId]);
    haptic("light");
    setCoinToast({ msg: `${item.name} placed on your planet!`, icon: Store });
    setCoins((prev) => {
      const newCoins = prev - item.price;
      fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: newCoins }),
      }).catch(() => router.refresh());
      return newCoins;
    });
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

  // ── Onboarding completion handler ──
  const handleOnboardingComplete = async (
    quitPick: { name: string; color: string; iconName: string; cost: number } | null,
    buildPick: { name: string; color: string; iconName: string } | null,
  ) => {
    // Set 250 starting coins
    setCoins(250);
    fetch("/api/coins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coins: 250 }) }).catch(() => {});

    // Create quit habit
    if (quitPick) {
      await addHabit(quitPick.name, quitPick.color, quitPick.iconName, "quit", quitPick.cost);
    }
    // Create build habit
    if (buildPick) {
      await addHabit(buildPick.name, buildPick.color, buildPick.iconName);
    }

    // Mark onboarding complete
    localStorage.setItem("bloom_onboarding_complete", "1");
    setShowOnboarding(false);
  };

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
      {/* Onboarding flow */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Loading splash */}
      {appLoading && (
        <div style={{
          position: "fixed", inset: 0, background: "#0a0e18", zIndex: 9998,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 700, color: "white" }}>
            b<span style={{ color: "#4ade80" }}>.</span>
          </span>
        </div>
      )}

      <Confetti active={confetti} />
      {coinToast && <CoinToast {...coinToast} onDone={() => setCoinToast(null)} />}
      {undoToast && <UndoToast {...undoToast} onDone={() => setUndoToast(null)} />}

      {/* Breathing timer overlay */}
      {breathingHabit && (
        <BreathingTimer
          habit={breathingHabit}
          onComplete={() => { setBreathingHabit(null); setCoinToast({ msg: "Urge surfed!", icon: Wind }); }}
          onClose={() => setBreathingHabit(null)}
          th={th}
        />
      )}

      {/* Urge support full screen */}
      {urgeSupportHabit && (
        <UrgeSupport
          habit={urgeSupportHabit}
          urgesToday={
            Object.values(quitDataMap).reduce((sum, qd) => sum + (qd.urges || []).filter((d) => d === todayStr).length, 0)
          }
          onComplete={(data) => {
            haptic("success");
            logUrge(urgeSupportHabit.id);
            setCoins((p) => {
              const nv = p + 3;
              fetch("/api/coins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ coins: nv }) }).catch(() => {});
              return nv;
            });
            setUrgeSupportHabit(null);
          }}
          onClose={() => setUrgeSupportHabit(null)}
          th={th}
        />
      )}

      {/* Relapse modal */}
      {relapseHabit && (
        <RelapseModal
          habit={relapseHabit}
          cleanDays={getCleanDays(relapseHabit.id)}
          onConfirm={() => { resetQuit(relapseHabit.id); setRelapseHabit(null); setCoinToast({ msg: "Counter reset. You've got this.", icon: RefreshCw }); }}
          onClose={() => setRelapseHabit(null)}
          th={th}
        />
      )}

      {/* Bloom+ paywall screen */}
      {showPaywall && (
        <BloomPlusScreen
          onClose={() => setShowPaywall(false)}
          onSubscribe={(plan) => {
            // For now (dev/testing), just enable Bloom+
            setIsPro(true);
            setProExpiry(new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString());
            setShowPaywall(false);
            setCoinToast({ msg: "Welcome to Bloom+!", icon: Sparkles });
          }}
        />
      )}

      {/* Premium shop item mini-prompt */}
      {showPremiumPrompt && (
        <BloomPlusMiniPrompt
          onSeeBloomPlus={() => { setShowPremiumPrompt(false); setShowPaywall(true); }}
          onDismiss={() => setShowPremiumPrompt(false)}
        />
      )}

      {/* 7-day celebration */}
      {sevenDayCelebration && (
        <SevenDayCelebration
          habitName={sevenDayCelebration.habitName}
          moneySaved={sevenDayCelebration.moneySaved}
          urgeCount={sevenDayCelebration.urgeCount}
          onTryBloomPlus={() => { setSevenDayCelebration(null); setShowPaywall(true); }}
          onKeepGoingFree={() => setSevenDayCelebration(null)}
        />
      )}

      {/* AA-style milestone coin celebration */}
      {milestoneCelebration && (
        <MilestoneCelebration
          tier={milestoneCelebration.tier}
          habitName={milestoneCelebration.habitName}
          coinReward={milestoneCelebration.coinReward}
          onDismiss={() => setMilestoneCelebration(null)}
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
            <h1
              onClick={onLogoTap}
              style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: th.text, cursor: "default", userSelect: "none" }}
            >
              bloom<span style={{ color: "#4caf50" }}>.</span>
              {isBloomPlus() && <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", marginLeft: 3, verticalAlign: "super" }}>+</span>}
            </h1>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {page === "main" && habits.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: allDone ? "#4caf50" : th.textMuted,
                background: allDone ? "rgba(76,175,80,.08)" : th.progressBg,
                padding: "3px 10px", borderRadius: 100,
                display: "flex", alignItems: "center", gap: 3, transition: "all .3s",
              }}>
                <Flame size={11} />{totalToday}/{habits.length}
              </span>
            )}
            <div
              onClick={() => { setPage("shop"); }}
              style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "3px 10px", borderRadius: 100,
              background: th.coinBg, color: "#d97706",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
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
            <button
              onClick={() => setMenuOpen(true)}
              title="Menu"
              style={{
                background: th.progressBg, border: "none", borderRadius: 8,
                padding: 5, cursor: "pointer", display: "flex", color: th.textSub,
                transition: "all .15s",
              }}
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* SLIDE-OUT MENU */}
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{
              position: "fixed", inset: 0, background: th.overlayBg,
              zIndex: 90, animation: "fi .15s ease",
            }} />
            <div style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: 280,
              background: th.modalBg, zIndex: 91, padding: "24px 20px",
              animation: "slideFromRight .25s cubic-bezier(.16,1,.3,1)",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: th.text }}>Menu</span>
                <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: th.textSub, display: "flex" }}>
                  <X size={18} />
                </button>
              </div>
              {[
                { label: "Collection", Icon: LayoutGrid, color: th.textSub, action: () => { setPage("gallery"); setMenuOpen(false); } },
                { label: "Insights", Icon: Sparkles, color: "#8B5CF6", action: () => { setPage("constellation"); setMenuOpen(false); } },
                { label: "Bloom Together", Icon: Users, color: "#4caf50", action: () => { setPage("social"); setMenuOpen(false); } },
                { label: "World Shop", Icon: Store, color: "#f59e0b", action: () => { setPage("shop"); setMenuOpen(false); } },
                { label: darkMode ? "Light Mode" : "Dark Mode", Icon: darkMode ? Sun : Moon, color: th.textSub, action: () => { setDarkMode((d) => !d); setMenuOpen(false); } },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 8px",
                  background: "none", border: "none", borderRadius: 12,
                  cursor: "pointer", fontFamily: "inherit", fontSize: 14,
                  fontWeight: 500, color: th.text, width: "100%", textAlign: "left",
                }}>
                  <item.Icon size={18} color={item.color} />
                  {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: th.cardBorder, margin: "8px 0" }} />
              <div style={{ padding: "8px" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: th.textMuted }}>Season</span>
                <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                  {(["spring", "summer", "autumn", "winter"] as SeasonKey[]).map((s) => (
                    <button key={s} onClick={() => setSeason(s)} style={{
                      padding: "5px 10px", borderRadius: 8, border: "none",
                      background: season === s ? (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)") : "transparent",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                      color: season === s ? th.text : th.textMuted, fontFamily: "inherit",
                      transition: "all .15s",
                    }}>
                      {SEASONS[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══ MAIN ═══ */}
        {page === "main" && (
          <div style={fs}>
            <div ref={terRef} style={{ position: "relative" }}>
              <TerrariumScene
                habits={habits} getStage={getStageForId} isHappy={isHappy}
                pct={todayPct} bouncingId={bouncingId} season={season} darkMode={darkMode}
                ownedItems={ownedItems}
                onCreatureTap={(hId) => { setDetailId(hId); setPage("detail"); }}
              />
              {/* Aurora effect — visible when all habits done */}
              {showAurora && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 80,
                  pointerEvents: "none", zIndex: 4,
                  opacity: showAurora ? 1 : 0, transition: "opacity 0.3s ease",
                }}>
                  <div style={{
                    position: "absolute", top: 10, left: "10%", right: "10%", height: 20,
                    borderRadius: "50%", background: "rgba(74, 222, 128, 0.15)",
                    filter: "blur(8px)", animation: "auroraWave 3s ease-in-out infinite",
                  }} />
                  <div style={{
                    position: "absolute", top: 20, left: "15%", right: "15%", height: 16,
                    borderRadius: "50%", background: "rgba(147, 130, 255, 0.12)",
                    filter: "blur(6px)", animation: "auroraWave 3s ease-in-out infinite 0.3s",
                  }} />
                  <div style={{
                    position: "absolute", top: 30, left: "20%", right: "20%", height: 12,
                    borderRadius: "50%", background: "rgba(255, 200, 100, 0.10)",
                    filter: "blur(5px)", animation: "auroraWave 3s ease-in-out infinite 0.6s",
                  }} />
                </div>
              )}
              {/* Shooting star */}
              {shootingStar && (
                <div style={{
                  position: "absolute", top: 20, left: 0, right: 0, height: 40,
                  pointerEvents: "none", zIndex: 4, overflow: "hidden",
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "white", boxShadow: "0 0 8px white, -12px 3px 12px rgba(255,255,255,0.3)",
                    animation: "shootingStar 0.8s linear forwards",
                  }} />
                </div>
              )}
              {/* Celebration banner */}
              {celebrationBanner && (
                <div style={{
                  position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                  zIndex: 10, animation: celebrationBannerFading ? "bannerFadeOut 0.3s ease forwards" : "bannerSlideDown 0.4s ease",
                  background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.2)",
                  borderRadius: 10, padding: "8px 16px", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                    <path d="M12 3l1.5 5.5L19 10l-4.5 2.5L16 18l-4-3-4 3 1.5-5.5L5 10l5.5-1.5z" />
                  </svg>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>All habits complete today</span>
                </div>
              )}
              {/* Mood indicator — minimal pill with SVG icon */}
              {habits.length > 0 && (() => {
                const status = allDone ? { label: "Thriving", color: "#66FFAA", glow: true } :
                  todayPct >= 0.5 ? { label: "Growing", color: "rgba(255,255,255,0.5)", glow: false } :
                  todayPct > 0 ? { label: "Waking up", color: "rgba(255,255,255,0.35)", glow: false } :
                  { label: "Resting", color: "rgba(255,255,255,0.2)", glow: false };
                return (
                <div style={{
                  position: "absolute", bottom: 8, left: 8,
                  background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", borderRadius: 8,
                  padding: "3px 10px", fontSize: 9, fontWeight: 600, color: status.color,
                  display: "flex", alignItems: "center", gap: 4, zIndex: 5, letterSpacing: 0.3,
                  boxShadow: status.glow ? "0 0 8px rgba(102,255,170,0.15)" : "none",
                }}>
                  {allDone ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#66FFAA" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ) : todayPct >= 0.5 ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  ) : todayPct > 0 ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"><path d="M12 22c-4-4-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-4 8-8 12z"/><line x1="12" y1="10" x2="12" y2="14"/></svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.2)"/></svg>
                  )}
                  {status.label}
                </div>
                );
              })()}
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
                    transition: "width 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    ...(allDone ? {
                      boxShadow: "0 0 12px rgba(74, 222, 128, 0.4)",
                      animation: "progressGlow 1.5s ease-in-out",
                    } : {}),
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
            {buildHabits.length > 0 && buildHabits.filter((h) => isHappy(h.id)).length === 0 && (() => {
              const hr = new Date().getHours();
              const nudge = hr >= 5 && hr < 12
                ? { Icon: Sunrise, msg: "Good morning! A small step forward today?" }
                : hr >= 12 && hr < 17
                  ? { Icon: SunMedium, msg: "Afternoon check-in — any habits to bloom?" }
                  : hr >= 17 && hr < 21
                    ? { Icon: MoonStar, msg: "Evening wind-down — still time to grow today" }
                    : { Icon: MoonStar, msg: "Late night. Be gentle with yourself." };
              return (
                <div style={{
                  margin: "8px 2px 0", padding: "10px 14px", borderRadius: 12,
                  background: th.card, border: `1px solid ${th.cardBorder}`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <nudge.Icon size={18} color={th.textSub} />
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
              {/* Compassionate welcome message */}
              {habits.length > 0 && (
                  <div style={{ padding: "0 14px 8px", textAlign: "center" }}>
                    <span style={{ fontSize: 12, fontStyle: "italic", color: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}>{getGreeting()}</span>
                  </div>
              )}
              {habits.length === 0 ? (
                <div style={{ padding: "36px 20px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: th.textMuted }}>Tap + to add your first habit</p>
                </div>
              ) : (
                habits.map((h, idx) => {
                  const quit = isQuit(h);
                  const done = !quit && isHappy(h.id);
                  const streak = quit ? 0 : getStreak(h.id);
                  const hasFz = !quit && (streakFreezes[h.id] || 0) > 0;
                  const isFrozen = !quit && !!frozenHabits[h.id];
                  const cleanDays = quit ? getCleanDays(h.id) : 0;
                  const qd = quit ? getQuitData(h.id) : undefined;
                  const moneySaved = quit && qd ? (qd.dailyCost || 0) * cleanDays : 0;
                  const isLast = idx === habits.length - 1;
                  return (
                    <div key={h.id} className="rw" style={{
                      background: th.card, animation: "fadeUp 0.3s ease",
                      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                      borderRadius: isLast ? undefined : 0,
                    }}>
                        {quit ? (
                          /* Quit habit: green shield indicator */
                          <div
                            style={{
                              width: 26, height: 26, borderRadius: 8,
                              background: `${h.color}18`,
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}
                            onClick={() => { setDetailId(h.id); setPage("detail"); }}
                          >
                            <svg viewBox="0 0 20 20" fill="#4ade80" width="20" height="20">
                              <path d="M10 1L3 4.5V9.5C3 14.2 6 17.5 10 19C14 17.5 17 14.2 17 9.5V4.5L10 1Z"/>
                            </svg>
                          </div>
                        ) : (
                          <div
                            className={`ck ${done ? "d" : ""}`}
                            style={{
                              background: done ? h.color : "transparent",
                              borderColor: done ? "transparent" : th.checkBorder,
                              opacity: isFrozen ? 0.3 : 1,
                              pointerEvents: isFrozen ? "none" : "auto",
                            }}
                            onClick={(e) => { e.stopPropagation(); if (!isFrozen) toggleCompletion(h.id); }}
                          >
                            {isFrozen ? <Snowflake size={14} color={th.textMuted} strokeWidth={2} /> : <Check size={14} color="white" strokeWidth={3} />}
                          </div>
                        )}
                        <div
                          style={{ flex: 1, cursor: "pointer" }}
                          onClick={() => { setDetailId(h.id); setPage("detail"); }}
                        >
                          <span style={{
                            fontSize: 15, fontWeight: 500,
                            textDecoration: !quit && done ? "line-through" : "none",
                            color: isFrozen ? th.textMuted : (!quit && done ? th.textMuted : th.text),
                            transition: "all 0.2s",
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}>
                            {h.name}
                            {isFrozen && <Snowflake size={12} color="#60a5fa" strokeWidth={2} />}
                          </span>
                          {quit && qd?.quitDate && (
                            <div style={{ fontSize: 11, color: darkMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)", fontWeight: 500, marginTop: 1 }}>
                              {cleanDays === 0 ? "Just started" : cleanDays === 1 ? "1 day clean" : `${fmtDuration(cleanDays)} clean`}{moneySaved > 0 && <span style={{ color: "#4caf50", marginLeft: 4 }}>{"\u00b7"} {fmtMoney(moneySaved)} saved</span>}
                            </div>
                          )}
                          {isFrozen && (
                            <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 500, marginTop: 1 }}>
                              Frozen {"\u00b7"} streak preserved
                            </div>
                          )}
                          {!quit && !isFrozen && streak > 0 && (
                            <div style={{ fontSize: 11, color: th.textSub, fontWeight: 500, marginTop: 1 }}>
                              {streak}d streak{hasFz ? " \u00b7 freeze active" : ""}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          {/* Milestone coin badge */}
                          {(earnedMilestoneCoins[h.id] || []).length > 0 && (
                            <CoinBadge earnedCoins={earnedMilestoneCoins[h.id]} isQuit={quit} />
                          )}
                          {quit ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setUrgeSupportHabit(h); }}
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
                              {streak >= 7 && (
                                <span style={{
                                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                                  background: th.streakActiveBg, color: "#d97706",
                                  display: "inline-flex", alignItems: "center", gap: 2,
                                }}>
                                  <Flame size={9} />{streak}d
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {/* Gray × delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(h.id); }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                            color: "rgba(255,255,255,0.15)", fontSize: 14, fontWeight: 400,
                            flexShrink: 0, padding: 0, marginLeft: 2, lineHeight: 1,
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.15)")}
                          aria-label={`Remove ${h.name}`}
                        >
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
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Next evolution preview */}
            {habits.length > 0 && (() => {
              const closest = habits
                .map((h) => ({ h, stage: getStageForId(h.id), total: getTotal(h.id) }))
                .filter((c) => c.stage < 4)
                .map((c) => ({ ...c, next: STAGE_THRESHOLDS[c.stage + 1], remaining: STAGE_THRESHOLDS[c.stage + 1] - c.total }))
                .sort((a, b) => a.remaining - b.remaining)[0];
              if (!closest || closest.remaining > 10) return null;
              return (
                <div
                  onClick={() => { setDetailId(closest.h.id); setPage("detail"); }}
                  style={{
                  marginTop: 8, padding: "10px 14px", borderRadius: 12,
                  background: `linear-gradient(135deg,${closest.h.color}06,rgba(255,215,0,0.03))`,
                  border: `1px solid ${closest.h.color}15`,
                  display: "flex", alignItems: "center", gap: 10,
                  cursor: "pointer",
                }}>
                  <div style={{ position: "relative" }}>
                    <Creature stage={closest.stage} color={closest.h.color} happy={true} size={32} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: th.text }}>
                      {closest.h.name} evolves in <span style={{ color: closest.h.color }}>{closest.remaining} {closest.remaining === 1 ? "day" : "days"}</span>
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
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, padding: "0 4px 8px", color: "rgba(255,255,255,0.25)" }}>Activity</div>
                <Heatmap getData={overallHeatData} weeks={12} color="#4caf50" heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
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
                padding: "28px 22px 22px", textAlign: "center", marginBottom: 10,
                background: th.card,
                borderColor: th.cardBorder, boxShadow: th.cardShadow,
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Vignette glow behind creature */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 200,
                background: `radial-gradient(circle at 50% 40%, ${detailHabit.color}22 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Single hero creature — 140px, centered */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {dq ? (
                  <Creature stage={Math.min(4, Math.floor(cleanD / 7))} color={detailHabit.color} happy={cleanD > 0} size={140} />
                ) : (
                  <Creature stage={getStageForId(detailHabit.id)} color={detailHabit.color} happy={isHappy(detailHabit.id)} size={140} />
                )}
              </div>

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
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {HABIT_COLORS.map((c) => (
                      <div key={c} className={`ct ${editColor === c ? "sl" : ""}`} style={{ background: c }} onClick={() => setEditColor(c)} />
                    ))}
                    {isBloomPlus() ? (
                      <label style={{ position: "relative", cursor: "pointer" }}>
                        <div className={`ct ${!HABIT_COLORS.includes(editColor) ? "sl" : ""}`} style={{
                          background: HABIT_COLORS.includes(editColor) ? "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)" : editColor,
                          position: "relative",
                        }} />
                        <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)}
                          style={{ position: "absolute", opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
                      </label>
                    ) : (
                      <div
                        onClick={() => setShowPaywall(true)}
                        className="ct"
                        title="Custom colors with Bloom+"
                        style={{ background: "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)", opacity: 0.4, cursor: "pointer", position: "relative" }}
                      >
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>+</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button className="btn-s" onClick={() => setEditMode(false)} style={{ background: th.progressBg, color: th.textSub }}>Cancel</button>
                    <button className="btn-s" onClick={saveEdit} style={{ background: darkMode ? "#4caf50" : "#1a1a2e", color: "white" }}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
                    <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 19, fontWeight: 600, color: th.text }}>{detailHabit.name}</h2>
                    <button
                      onClick={() => { setEditMode(true); setEditName(detailHabit.name); setEditColor(detailHabit.color); }}
                      style={{ background: th.progressBg, border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}
                    >
                      <Pencil size={12} color={th.textSub} />
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: th.textSub, marginTop: 2 }}>
                    {dq ? `Quitting · ${STAGE_LABELS[getStageForId(detailHabit.id)]}` : `Building · ${STAGE_LABELS[getStageForId(detailHabit.id)]}`}
                  </p>
                  {dq && dqd?.quitDate && (
                    <p style={{ fontSize: 10, color: th.textFaint, marginTop: 1 }}>
                      {fmtQuitDate(dqd.quitDate)}
                    </p>
                  )}
                </>
              )}

              {/* Quit hero numbers + live timer */}
              {dq && !editMode && (() => {
                const timer = dqd?.quitDate ? formatLiveTimer(dqd.quitDate, liveNow) : null;
                return (
                <div style={{ marginTop: 14 }}>
                  {cleanD === 0 && timer && timer.totalHours < 24 ? (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 700, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>
                        {timer.totalHours}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>
                        {timer.totalHours === 1 ? "hour clean" : "hours clean"}
                      </div>
                      <div style={{
                        fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4,
                        animation: "livePulse 4s ease infinite",
                      }}>
                        {timer.totalHours}h {timer.minutes}m
                      </div>
                      {dqd?.quitDate && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
                          {fmtQuitDate(dqd.quitDate)}
                        </div>
                      )}
                    </>
                  ) : cleanD === 0 ? (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 600, color: detailHabit.color, lineHeight: 1.2 }}>
                        Just started
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4 }}>
                        you got this
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 56, fontWeight: 700, color: "white", letterSpacing: "-1px", lineHeight: 1 }}>
                        {cleanD}
                      </div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginTop: 2 }}>
                        {cleanD === 1 ? "day clean" : "days clean"}
                      </div>
                      {timer && (
                        <div style={{
                          fontSize: 14, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 4,
                          animation: "livePulse 4s ease infinite",
                        }}>
                          {timer.totalHours.toLocaleString()} hours · {timer.minutes} minutes
                        </div>
                      )}
                    </>
                  )}
                  {dqd && (dqd.dailyCost || 0) > 0 && cleanD > 0 && (
                    <div style={{ fontSize: 14, color: "#4caf50", fontWeight: 600, marginTop: 6 }}>
                      {fmtMoney((dqd.dailyCost || 0) * cleanD)} saved
                    </div>
                  )}
                </div>
                );
              })()}

              {/* Stats — build habits only (before evolution bar) */}
              {!editMode && !dq && (
                <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 18 }}>
                  {[
                    { l: "Streak", v: `${getStreak(detailHabit.id)}d` },
                    { l: "Total", v: getTotal(detailHabit.id) },
                    { l: "Best", v: `${getStreak(detailHabit.id)}d` },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces',serif", color: th.text }}>{s.v}</div>
                      <div className="lb" style={{ marginTop: 2, color: th.label }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Evolution progress */}
              {!editMode && getStageForId(detailHabit.id) < 4 &&
                (() => {
                  const st = getStageForId(detailHabit.id);
                  const tot = getTotal(detailHabit.id);
                  const nx = STAGE_THRESHOLDS[st + 1];
                  const pv = STAGE_THRESHOLDS[st];
                  const pct = Math.min(((tot - pv) / (nx - pv)) * 100, 100);
                  const remaining = nx - tot;
                  return (
                    <div style={{ maxWidth: 240, margin: "14px auto 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: th.textMuted, marginBottom: 3 }}>
                        <span>{STAGE_LABELS[st]}</span><span>{STAGE_LABELS[st + 1]} in {remaining} {remaining === 1 ? "day" : "days"}</span>
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
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text }}>Breathe</div>
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
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text }}>Reset</div>
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

                {/* Activity heatmap — compact 12 weeks */}
                <div className="cd" style={{
                  padding: "12px 10px", marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, padding: "0 4px 8px", color: "rgba(255,255,255,0.25)" }}>Activity</div>
                  <Heatmap getData={detailHeatData} color={detailHabit.color} weeks={12} heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
                </div>

                {/* Healing timeline */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <HealingTimeline habit={detailHabit} cleanDays={cleanD} th={th} />
                </div>

                {/* AA-style milestone coins */}
                {(earnedMilestoneCoins[detailHabit.id] || []).length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestone Coins</div>
                    <CoinRow habitId={detailHabit.id} earnedCoins={earnedMilestoneCoins[detailHabit.id] || []} isQuit />
                  </div>
                )}

                {/* Milestones */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestones</div>
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

                {/* Urge trend */}
                {urges.length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <UrgeTrend urgeLog={urges} color={detailHabit.color} th={th} />
                  </div>
                )}

                {/* Delete this habit — muted red text */}
                <button
                  onClick={() => setConfirmDeleteId(detailHabit.id)}
                  style={{
                    width: "100%", padding: 16, borderRadius: 12,
                    border: "none", background: "transparent",
                    color: "rgba(255,100,100,0.6)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.12s",
                    textAlign: "center",
                  }}
                >
                  Delete this habit
                </button>
              </>
            )}

            {/* ── Build-specific sections ── */}
            {!dq && (
              <>
                {/* Streak freeze */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield size={16} color="#42b4d6" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text }}>Streak Freeze</div>
                      <div style={{ fontSize: 10, color: th.textSub }}>
                        {frozenHabits[detailHabit.id]
                          ? "Habit is paused — streak preserved"
                          : (streakFreezes[detailHabit.id] || 0) > 0
                            ? `${streakFreezes[detailHabit.id]} freeze${(streakFreezes[detailHabit.id] || 0) > 1 ? "s" : ""} active`
                            : "Protect your streak from one missed day"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      className="btn-s"
                      onClick={() => toggleFreeze(detailHabit.id)}
                      style={{
                        background: frozenHabits[detailHabit.id] ? "#60a5fa" : th.freezeBtnBg,
                        color: frozenHabits[detailHabit.id] ? "#fff" : "#42b4d6",
                        whiteSpace: "nowrap",
                        display: "inline-flex", alignItems: "center", gap: 3,
                      }}
                    >
                      <Snowflake size={11} /> {frozenHabits[detailHabit.id] ? "Unfreeze" : "Freeze"}
                    </button>
                    {!frozenHabits[detailHabit.id] && (
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
                    )}
                  </div>
                </div>

                {/* Activity heatmap — compact 12 weeks */}
                <div className="cd" style={{
                  padding: "12px 10px", marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, padding: "0 4px 8px", color: "rgba(255,255,255,0.25)" }}>Activity</div>
                  <Heatmap getData={detailHeatData} color={detailHabit.color} weeks={12} heatEmpty={th.heatEmpty} labelColor={th.label} legendColor={th.textFaint} />
                </div>

                {/* AA-style milestone coins */}
                {(earnedMilestoneCoins[detailHabit.id] || []).length > 0 && (
                  <div className="cd" style={{
                    padding: 14, marginBottom: 10,
                    background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestone Coins</div>
                    <CoinRow habitId={detailHabit.id} earnedCoins={earnedMilestoneCoins[detailHabit.id] || []} isQuit={false} />
                  </div>
                )}

                {/* Milestones */}
                <div className="cd" style={{
                  padding: 14, marginBottom: 10,
                  background: th.card, borderColor: th.cardBorder, boxShadow: th.cardShadow,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 8, color: "rgba(255,255,255,0.25)" }}>Milestones</div>
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

                {/* Delete this habit — muted red text */}
                <button
                  onClick={() => setConfirmDeleteId(detailHabit.id)}
                  style={{
                    width: "100%", padding: 16, borderRadius: 12,
                    border: "none", background: "transparent",
                    color: "rgba(255,100,100,0.6)", fontSize: 12, fontWeight: 500, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.12s",
                    textAlign: "center",
                  }}
                >
                  Delete this habit
                </button>
              </>
            )}
          </div>
          );
        })()}

        {/* ═══ GALLERY ═══ */}
        {page === "gallery" && (
          <Gallery habits={habits} getStage={getStageForId} getTotal={getTotal} isHappy={isHappy} th={th}
            onCreatureTap={(hId) => { setDetailId(hId); setPage("detail"); }}
            earnedMilestoneCoins={earnedMilestoneCoins}
          />
        )}

        {/* ═══ CONSTELLATION ═══ */}
        {page === "constellation" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            {/* Multi-habit heatmap — first section */}
            {habits.length > 0 && (
              <MultiHabitHeatmap habits={habits} isDone={isComplete} getCleanDays={getCleanDays} th={th} />
            )}
            <Constellation habits={habits} isDone={isComplete} getStreak={getStreak} getTotal={getTotal} getCleanDays={getCleanDays} th={th} isPro={isBloomPlus()} onUpgrade={() => setShowPaywall(true)} />
          </div>
        )}

        {/* ═══ SOCIAL ═══ */}
        {page === "social" && (
          <div style={{ animation: "fadeUp 0.28s ease", textAlign: "center", padding: "60px 20px" }}>
            <Users size={32} color="#4caf50" style={{ marginBottom: 12, opacity: 0.5 }} />
            <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text, marginBottom: 6 }}>Bloom Together</h2>
            <p style={{ fontSize: 13, color: th.textSub }}>Coming Soon</p>
          </div>
        )}

        {/* ═══ SHOP ═══ */}
        {page === "shop" && (
          <Shop coins={coins} ownedItems={ownedItems} onBuy={buyItem} th={th}
            isPro={isBloomPlus()}
            onPremiumTap={() => setShowPremiumPrompt(true)}
            onOwnedTap={() => { setPage("main"); setTimeout(() => terRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }}
          />
        )}
      </div>

      {/* FAB */}
      {page === "main" && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50 }}>
          <button className="fab" onClick={() => {
            if (habits.length >= FREE_HABIT_LIMIT && !isBloomPlus()) {
              setShowPaywall(true);
              return;
            }
            setPage("add");
          }}>
            <Plus size={22} />
          </button>
        </div>
      )}

      {/* ADD */}
      {page === "add" && (
        <div className="mbg" style={{ background: th.overlayBg }} onClick={(e) => { if (e.target === e.currentTarget) setPage("main"); }}>
          <div className="ml" style={{ background: th.modalBg }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700, color: th.text }}>Add habit</h2>
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
                  <div className="lb" style={{ marginBottom: 2, color: th.label, display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={10} /> Quit a habit
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2, marginBottom: 8 }}>
                    Tap to add. You can rename any habit.
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
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                {HABIT_COLORS.map((c) => (
                  <div key={c} className={`ct ${cColor === c ? "sl" : ""}`} style={{ background: c }} onClick={() => setCColor(c)} />
                ))}
                {isBloomPlus() ? (
                  <label style={{ position: "relative", cursor: "pointer" }}>
                    <div className={`ct ${!HABIT_COLORS.includes(cColor) ? "sl" : ""}`} style={{
                      background: HABIT_COLORS.includes(cColor) ? "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)" : cColor,
                      position: "relative",
                    }} />
                    <input type="color" value={cColor} onChange={(e) => setCColor(e.target.value)}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0, top: 0, left: 0 }} />
                  </label>
                ) : (
                  <div
                    onClick={() => setShowPaywall(true)}
                    className="ct"
                    title="Custom colors with Bloom+"
                    style={{ background: "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)", opacity: 0.4, cursor: "pointer", position: "relative" }}
                  >
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "white", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>+</span>
                  </div>
                )}
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
              {addError && (
                <div style={{ marginTop: 8, color: "#ef4444", fontSize: 12, fontWeight: 500 }}>{addError}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Back modal */}
      {showWelcomeBack && (
        <WelcomeBack daysAway={daysAwayCnt} onClose={() => setShowWelcomeBack(false)} th={th} />
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (() => {
        const habit = habits.find(h => h.id === confirmDeleteId);
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 32,
          }} onClick={() => setConfirmDeleteId(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: th.card, borderRadius: 16, padding: "24px 20px", maxWidth: 320,
              width: "100%", textAlign: "center",
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: th.text, marginBottom: 4 }}>
                Remove &ldquo;{habit?.name}&rdquo;?
              </div>
              <div style={{ fontSize: 13, color: th.textSub, lineHeight: 1.5, marginBottom: 20 }}>
                Your creature and all progress for this habit will be permanently deleted.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmDeleteId(null)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                  background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                  color: th.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>Cancel</button>
                <button onClick={() => { removeHabit(confirmDeleteId); setConfirmDeleteId(null); }} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                  background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Remove</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
