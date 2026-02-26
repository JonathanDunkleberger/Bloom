export const PRESETS = [
  { name: "Meditate", iconName: "Brain", color: "#7c5cbf", cat: "mind" },
  { name: "Exercise", iconName: "Dumbbell", color: "#e8553a", cat: "body" },
  { name: "Read", iconName: "BookOpen", color: "#3a8fd6", cat: "mind" },
  { name: "Journal", iconName: "BookOpen", color: "#d4a03c", cat: "mind" },
  { name: "Hydrate", iconName: "Droplets", color: "#42b4d6", cat: "body" },
  { name: "Sleep well", iconName: "Moon", color: "#6b5b95", cat: "body" },
  { name: "Walk", iconName: "Footprints", color: "#27ae60", cat: "body" },
  { name: "Cook a meal", iconName: "Utensils", color: "#f39c12", cat: "body" },
  { name: "Create", iconName: "Palette", color: "#1abc9c", cat: "mind" },
  { name: "Deep work", iconName: "Target", color: "#34495e", cat: "focus" },
  { name: "No screens before bed", iconName: "Smartphone", color: "#95a5a6", cat: "reduce" },
  { name: "Alcohol-free day", iconName: "Wine", color: "#8e44ad", cat: "reduce" },
  { name: "Smoke-free day", iconName: "Cigarette", color: "#e74c3c", cat: "reduce" },
  { name: "Caffeine limit", iconName: "Coffee", color: "#795548", cat: "reduce" },
  { name: "No doom scrolling", iconName: "Eye", color: "#607d8b", cat: "reduce" },
  { name: "Screen time limit", iconName: "Clock", color: "#455a64", cat: "reduce" },
] as const;

export const PRESET_CATEGORIES = [
  { cat: "mind", label: "Mind" },
  { cat: "body", label: "Body" },
  { cat: "focus", label: "Focus" },
  { cat: "reduce", label: "Reduce" },
] as const;

export const MILESTONES: { days: number; coins: number; label: string; iconName: string }[] = [
  { days: 1, coins: 1, label: "First step", iconName: "Zap" },
  { days: 3, coins: 5, label: "3 days", iconName: "TrendingUp" },
  { days: 7, coins: 15, label: "One week", iconName: "Star" },
  { days: 14, coins: 30, label: "Two weeks", iconName: "Trophy" },
  { days: 21, coins: 50, label: "Habit formed", iconName: "Brain" },
  { days: 30, coins: 100, label: "One month", iconName: "Sparkles" },
  { days: 60, coins: 200, label: "Two months", iconName: "Heart" },
  { days: 90, coins: 500, label: "Quarter year", iconName: "Flame" },
];

export const STAGE_LABELS = ["Egg", "Hatchling", "Young", "Growing", "Evolved"];
export const STAGE_THRESHOLDS = [0, 1, 5, 12, 25];

export const HABIT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#06b6d4",
];

export const FREE_HABIT_LIMIT = 5;

/* ═══════════ SEASONS ═══════════ */
export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export interface SeasonTheme {
  skyTop: string;
  skyMid: string;
  ground1: string;
  ground2: string;
  ground3: string;
  dirt: string;
  flowerColors: string[];
  particleType: string;
  label: string;
}

export const SEASONS: Record<SeasonKey, SeasonTheme> = {
  spring: {
    skyTop: "#C8E6FF", skyMid: "#E8D5E8", ground1: "#8BC870", ground2: "#7ABF5E", ground3: "#6CB050", dirt: "#9B7653",
    flowerColors: ["#FFB6C1", "#FF85A2", "#DDA0DD", "#E8A0BF", "#F8C8DC"], particleType: "petals", label: "Spring",
  },
  summer: {
    skyTop: "#5AABE0", skyMid: "#93D68A", ground1: "#6DBF40", ground2: "#5CAF30", ground3: "#4B9F22", dirt: "#8B6D42",
    flowerColors: ["#FF6B9D", "#FFB347", "#F9D56E", "#FF5E5B", "#66D9EF"], particleType: "fireflies", label: "Summer",
  },
  autumn: {
    skyTop: "#D4A574", skyMid: "#C9B896", ground1: "#A0944E", ground2: "#8E8340", ground3: "#7D7232", dirt: "#6B5344",
    flowerColors: ["#E85D2C", "#D4741C", "#F0A030", "#C44B1A", "#E8A040"], particleType: "leaves", label: "Autumn",
  },
  winter: {
    skyTop: "#B8C8D8", skyMid: "#D0D8E0", ground1: "#C0D0C0", ground2: "#B0C4B0", ground3: "#A0B8A0", dirt: "#8A8A7A",
    flowerColors: ["#D0E0F0", "#C8D8E8", "#B0C8D8", "#E0E8F0", "#98B8D0"], particleType: "snow", label: "Winter",
  },
};

export function getSeason(): SeasonKey {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

/* ═══════════ DARK THEME ═══════════ */
export interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  textSub: string;
  textMuted: string;
  textFaint: string;
  label: string;
  hoverBg: string;
  inputBg: string;
  inputBorder: string;
  checkBorder: string;
  progressBg: string;
  overlayBg: string;
  modalBg: string;
  dangerBg: string;
  dangerBorder: string;
  streakBg: string;
  streakActiveBg: string;
  coinBg: string;
  freezeBtnBg: string;
  freezeBtnOff: string;
  heatEmpty: string;
  glassHighlight: string;
}

export const THEME: Record<"light" | "dark", ThemeColors> = {
  light: {
    bg: "#FAF8F3", card: "white", cardBorder: "rgba(0,0,0,0.04)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.02),0 4px 16px rgba(0,0,0,0.015)",
    text: "#1a1a2e", textSub: "rgba(0,0,0,.28)", textMuted: "rgba(0,0,0,.18)", textFaint: "rgba(0,0,0,.08)",
    label: "rgba(0,0,0,.18)", hoverBg: "rgba(0,0,0,.01)", inputBg: "#FAFAF8", inputBorder: "rgba(0,0,0,.04)",
    checkBorder: "rgba(0,0,0,.08)", progressBg: "rgba(0,0,0,.04)", overlayBg: "rgba(0,0,0,.15)",
    modalBg: "white", dangerBg: "rgba(239,68,68,.02)", dangerBorder: "rgba(239,68,68,.1)",
    streakBg: "rgba(0,0,0,.02)", streakActiveBg: "rgba(245,158,11,.06)", coinBg: "rgba(245,158,11,.06)",
    freezeBtnBg: "rgba(66,180,214,.08)", freezeBtnOff: "rgba(0,0,0,.02)", heatEmpty: "rgba(0,0,0,0.025)",
    glassHighlight: "rgba(255,255,255,0.12)",
  },
  dark: {
    bg: "#0f0f1a", card: "#1a1a2e", cardBorder: "rgba(255,255,255,0.06)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.3),0 4px 16px rgba(0,0,0,0.2)",
    text: "#e8e6f0", textSub: "rgba(255,255,255,.45)", textMuted: "rgba(255,255,255,.3)", textFaint: "rgba(255,255,255,.12)",
    label: "rgba(255,255,255,.3)", hoverBg: "rgba(255,255,255,.03)", inputBg: "#12122a", inputBorder: "rgba(255,255,255,.08)",
    checkBorder: "rgba(255,255,255,.12)", progressBg: "rgba(255,255,255,.06)", overlayBg: "rgba(0,0,0,.5)",
    modalBg: "#1a1a2e", dangerBg: "rgba(239,68,68,.08)", dangerBorder: "rgba(239,68,68,.2)",
    streakBg: "rgba(255,255,255,.04)", streakActiveBg: "rgba(245,158,11,.12)", coinBg: "rgba(245,158,11,.1)",
    freezeBtnBg: "rgba(66,180,214,.12)", freezeBtnOff: "rgba(255,255,255,.04)", heatEmpty: "rgba(255,255,255,0.04)",
    glassHighlight: "rgba(255,255,255,0.06)",
  },
};
