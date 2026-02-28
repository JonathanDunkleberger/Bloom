export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  tier: "free" | "pro";
  coins: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon_name: string;
  category: string;
  is_archived: boolean;
  is_paused: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  value: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  habit_id: string;
  milestone_type: string;
  value: number;
  seen: boolean;
  created_at: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  totalDays: number;
  completedToday: boolean;
  stage: number;
  logs: HabitLog[];
}

/** Quit-specific data stored in localStorage per habit */
export interface QuitData {
  quitDate: string;       // ISO date when quit began
  dailyCost: number;      // $ saved per day
  reason: string;         // personal reason
  urges: string[];        // array of ISO dates when urges were logged
  bestStreak: number;     // best clean-day streak achieved (survives relapse resets)
}

/** Quit progress row from Supabase */
export interface QuitProgressRow {
  id: string;
  user_id: string;
  habit_id: string;
  quit_date: string;
  daily_cost: number;
  reason: string;
  urges: string[];
  best_streak: number;
  created_at: string;
  updated_at: string;
}

/** User inventory row from Supabase */
export interface UserInventoryRow {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

/** User preferences row from Supabase */
export interface UserPreferencesRow {
  id: string;
  user_id: string;
  dark_mode: boolean;
  season: string;
  earned_milestone_coins: Record<string, string[]>;
  stage_drops: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface EarnedMilestones {
  [key: string]: boolean; // "habitId:days" -> true
}

export interface AppData {
  habits: HabitWithStats[];
  coins: number;
  earned: EarnedMilestones;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ShopCategory;
  premium?: boolean;
}

export type ShopCategory = "landscape" | "trees" | "flowers" | "decorations";
