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
