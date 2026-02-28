/**
 * One-time migration: moves localStorage data to Supabase.
 * Reads old localStorage keys and POSTs to the new API routes.
 * Sets "tend_data_migrated" flag on completion so it only runs once.
 */
export async function migrateLocalStorageToServer(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("tend_data_migrated") === "1") return false;

  let migrated = false;

  try {
    // 1. Migrate quit data
    const quitRaw = localStorage.getItem("tend_quit_data");
    if (quitRaw) {
      const quitDataMap: Record<string, { quitDate: string; dailyCost: number; reason: string; urges: string[]; bestStreak: number }> = JSON.parse(quitRaw);
      for (const [habitId, qd] of Object.entries(quitDataMap)) {
        await fetch(`/api/quit-progress/${habitId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(qd),
        });
      }
      migrated = true;
    }

    // 2. Migrate owned items
    const itemsRaw = localStorage.getItem("tend_owned_items");
    if (itemsRaw) {
      const items: string[] = JSON.parse(itemsRaw);
      for (const itemId of items) {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId }),
        });
      }
      migrated = true;
    }

    // 3. Migrate preferences (dark mode, season, milestone coins, stage drops)
    const prefs: Record<string, unknown> = {};
    const darkRaw = localStorage.getItem("tend_dark");
    if (darkRaw) prefs.dark_mode = darkRaw === "1";
    const seasonRaw = localStorage.getItem("tend_season");
    if (seasonRaw) prefs.season = seasonRaw;
    const milestoneRaw = localStorage.getItem("tend_milestone_coins");
    if (milestoneRaw) prefs.earned_milestone_coins = JSON.parse(milestoneRaw);
    const stageRaw = localStorage.getItem("tend_stage_drops");
    if (stageRaw) prefs.stage_drops = JSON.parse(stageRaw);

    if (Object.keys(prefs).length > 0) {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      migrated = true;
    }

    // 4. Migrate paused habits
    const pausedRaw = localStorage.getItem("tend_paused_habits");
    if (pausedRaw) {
      const paused: Record<string, boolean> = JSON.parse(pausedRaw);
      for (const [habitId, isPaused] of Object.entries(paused)) {
        if (isPaused) {
          await fetch(`/api/habits/${habitId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_paused: true }),
          });
        }
      }
      migrated = true;
    }

    // Mark migration complete
    localStorage.setItem("tend_data_migrated", "1");

    if (migrated && process.env.NODE_ENV === "development") {
      console.log("[Tend] localStorage → Supabase migration complete");
    }
  } catch (err) {
    // Don't block the app — migration can retry next load
    if (process.env.NODE_ENV === "development") {
      console.error("[Tend] Migration error:", err);
    }
  }

  return migrated;
}
