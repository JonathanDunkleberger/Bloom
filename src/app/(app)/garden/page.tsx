import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TendApp } from "@/components/tend-app";
import { today, daysAgo, getStage } from "@/lib/utils";
import type { Habit, HabitLog, HabitWithStats, EarnedMilestones, QuitData, QuitProgressRow } from "@/types";

export default async function GardenPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = await createServerSupabaseClient();

  // Fetch habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true });

  const habitIds = (habits || []).map((h: Habit) => h.id);

  // Fetch logs (last 90 days — sufficient for heatmaps and streak calc)
  const logWindow = daysAgo(90);
  const { data: logs } = habitIds.length > 0
    ? await supabase.from("habit_logs").select("*").in("habit_id", habitIds).gte("log_date", logWindow)
    : { data: [] };

  // Fetch profile for coins + streak_freezes + tier (Tend+ verification)
  // Try with all columns first; fall back gracefully if columns don't exist yet
  let profile: { coins: number; streak_freezes?: Record<string, number>; tier?: string } | null = null;
  {
    const { data, error } = await supabase
      .from("profiles")
      .select("coins, streak_freezes, tier")
      .eq("clerk_id", userId)
      .single();
    if (!error) {
      profile = data;
    } else {
      // streak_freezes or tier column may not exist yet – fetch coins only
      const { data: fallback } = await supabase
        .from("profiles")
        .select("coins")
        .eq("clerk_id", userId)
        .single();
      profile = fallback ? { ...fallback, streak_freezes: {}, tier: "free" } : null;
    }
  }

  // Fetch earned milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .in("habit_id", habitIds.length > 0 ? habitIds : ["__none__"]);

  // Build earned map
  const earned: EarnedMilestones = {};
  (milestones || []).forEach((m: { habit_id: string; value: number }) => {
    earned[`${m.habit_id}:${m.value}`] = true;
  });

  // ── New: fetch quit_progress, user_inventory, user_preferences ──

  // Quit progress → convert DB rows to quitDataMap keyed by habit_id
  let initialQuitData: Record<string, QuitData> = {};
  {
    const { data: qpRows } = await supabase
      .from("quit_progress")
      .select("*")
      .eq("user_id", userId);
    if (qpRows && qpRows.length > 0) {
      for (const row of qpRows as QuitProgressRow[]) {
        initialQuitData[row.habit_id] = {
          quitDate: row.quit_date,
          dailyCost: row.daily_cost,
          reason: row.reason,
          urges: Array.isArray(row.urges) ? row.urges : [],
          bestStreak: row.best_streak,
        };
      }
    }
  }

  // User inventory → string[]
  let initialOwnedItems: string[] = [];
  {
    const { data: invRows } = await supabase
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", userId)
      .order("created_at");
    if (invRows) {
      initialOwnedItems = invRows.map((r: { item_id: string }) => r.item_id);
    }
  }

  // User preferences
  let initialPreferences: {
    darkMode: boolean;
    season: string;
    earnedMilestoneCoins: Record<string, string[]>;
    stageDrops: Record<string, number>;
  } = { darkMode: false, season: "summer", earnedMilestoneCoins: {}, stageDrops: {} };
  {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (prefs) {
      initialPreferences = {
        darkMode: prefs.dark_mode ?? false,
        season: prefs.season ?? "summer",
        earnedMilestoneCoins: (prefs.earned_milestone_coins as Record<string, string[]>) ?? {},
        stageDrops: (prefs.stage_drops as Record<string, number>) ?? {},
      };
    }
  }

  // Build paused habits map from habit.is_paused column
  const initialPausedHabits: Record<string, boolean> = {};
  (habits || []).forEach((h: Habit) => {
    if (h.is_paused) initialPausedHabits[h.id] = true;
  });

  const todayStr = today();

  // Compute stats per habit
  const habitsWithStats: HabitWithStats[] = (habits || []).map((habit: Habit) => {
    const habitLogs = (logs || []).filter((l: HabitLog) => l.habit_id === habit.id);
    const completedToday = habitLogs.some((l: HabitLog) => l.log_date === todayStr);

    // Compute streak
    let currentStreak = 0;
    let d = 0;
    const logDates = new Set(habitLogs.map((l: HabitLog) => l.log_date));
    // If today isn't complete yet, start from yesterday (don't break streak mid-day)
    if (!logDates.has(daysAgo(0))) d = 1;
    while (logDates.has(daysAgo(d))) {
      currentStreak++;
      d++;
    }

    const totalDays = habitLogs.length;

    return {
      ...habit,
      currentStreak,
      totalDays,
      completedToday,
      stage: getStage(totalDays),
      logs: habitLogs as HabitLog[],
    };
  });

  return (
    <TendApp
      initialHabits={habitsWithStats}
      initialCoins={profile?.coins ?? 250}
      initialEarned={earned}
      initialStreakFreezes={(profile?.streak_freezes as Record<string, number>) ?? {}}
      initialIsPro={profile?.tier === "pro"}
      initialQuitData={initialQuitData}
      initialOwnedItems={initialOwnedItems}
      initialPausedHabits={initialPausedHabits}
      initialPreferences={initialPreferences}
    />
  );
}
