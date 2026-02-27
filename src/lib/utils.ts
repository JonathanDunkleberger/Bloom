import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Brain, Dumbbell, BookOpen, Droplets, Moon, Footprints, Utensils,
  Palette, Target, Smartphone, Wine, Cigarette, Coffee, Eye, Clock,
  Heart, Zap, Star, Flame, TrendingUp, Trophy, Sparkles,
  Download, RefreshCw, Share2, Award, Users, Wind, DollarSign,
  MessageCircle, AlertTriangle, Shield,
  type LucideIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ICON_MAP: Record<string, LucideIcon> = {
  Brain, Dumbbell, BookOpen, Droplets, Moon, Footprints, Utensils,
  Palette, Target, Smartphone, Wine, Cigarette, Coffee, Eye, Clock,
  Heart, Zap, Star, Flame, TrendingUp, Trophy, Sparkles,
  Download, RefreshCw, Share2, Award, Users, Wind, DollarSign,
  MessageCircle, AlertTriangle, Shield,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Target;
}

export function getStage(totalDays: number): number {
  if (totalDays >= 30) return 4;
  if (totalDays >= 14) return 3;
  if (totalDays >= 7) return 2;
  if (totalDays >= 3) return 1;
  return 0;
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtDate(s: string): string {
  return new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Seeded pseudo-random for deterministic positions
export function seed(s: number): () => number {
  let h = s;
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Lighten a hex color
export function lightenColor(hex: string, amt: number): string {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return hex;
  const r = Math.min(255, parseInt(match[1], 16) + amt);
  const g = Math.min(255, parseInt(match[2], 16) + amt);
  const b = Math.min(255, parseInt(match[3], 16) + amt);
  return `rgb(${r},${g},${b})`;
}

export function daysBetween(a: string, b: string): number {
  // Handle both ISO timestamps and date-only strings
  const d1 = a.includes("T") ? new Date(a) : new Date(a + "T12:00:00");
  const d2 = b.includes("T") ? new Date(b) : new Date(b + "T12:00:00");
  return Math.max(0, Math.floor((d2.getTime() - d1.getTime()) / 86400000));
}

export function fmtDuration(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    const r = days % 7;
    return r > 0 ? `${w}w ${r}d` : `${w} week${w > 1 ? "s" : ""}`;
  }
  const m = Math.floor(days / 30);
  const r = days % 30;
  return r > 0 ? `${m}mo ${r}d` : `${m} month${m > 1 ? "s" : ""}`;
}

/** Format days completed text with proper singular/plural */
export function fmtDaysCompleted(days: number, isQuit: boolean): string {
  if (isQuit && days === 0) return "Just started";
  if (days === 0) return "Starting today";
  if (days === 1) return "1 day completed";
  return `${days} days completed`;
}

export function fmtMoney(n: number): string {
  return n >= 100 ? `$${Math.floor(n)}` : `$${n.toFixed(2)}`;
}

/** Format a quit date (ISO timestamp or date string) for display */
export function fmtQuitDate(isoStr: string): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  // Same calendar day
  if (d.toDateString() === now.toDateString()) {
    if (diffHrs < 1) return `Started ${Math.max(1, Math.round(diffMs / 60000))}m ago`;
    return `Started today at ${timeStr}`;
  }

  // Within 24 hours
  if (diffHrs < 24) {
    return `Started ${Math.round(diffHrs)}h ago`;
  }

  // Yesterday or older
  const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Started ${monthDay} at ${timeStr}`;
}

/** Format a relative time for quit habits in the first 24h */
export function fmtQuitRelative(isoStr: string): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 1) return `${Math.max(1, Math.round(diffMs / 60000))} minutes ago`;
  if (diffHrs < 24) return `${Math.round(diffHrs)} hours ago`;
  return "";
}

/* ═══════════ HAPTIC FEEDBACK ═══════════ */
export function haptic(pattern: "light" | "medium" | "success") {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  switch (pattern) {
    case "light": navigator.vibrate(10); break;
    case "medium": navigator.vibrate(20); break;
    case "success": navigator.vibrate([10, 50, 10]); break;
  }
}

/* ═══════════ TIME-AWARE GREETINGS ═══════════ */
function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getTimePeriod(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function getGreeting(): string {
  const hour = new Date().getHours();

  let options: string[];
  if (hour >= 5 && hour < 12) {
    options = [
      "Good morning. One day at a time.",
      "New day, new chance. You\u2019ve got this.",
      "Morning. Your creatures are waking up too.",
    ];
  } else if (hour >= 12 && hour < 17) {
    options = [
      "Afternoon check-in. Still going strong.",
      "Halfway through the day. Keep it up.",
      "You\u2019re doing great today.",
    ];
  } else if (hour >= 17 && hour < 21) {
    options = [
      "Evening wind-down. Still time to grow today.",
      "Almost through today. You\u2019ve got this.",
      "The evening is yours. Finish strong.",
    ];
  } else {
    options = [
      "Late night. Be gentle with yourself.",
      "Night owl hours. Your planet is still here.",
      "Can\u2019t sleep? That\u2019s okay. You\u2019re still clean.",
      "The night is quiet. You\u2019re doing fine.",
    ];
  }

  // Seed by date + time period so greeting is consistent within a period
  const seedStr = new Date().toDateString() + getTimePeriod();
  const index = hashString(seedStr) % options.length;
  return options[index];
}

/* ═══════════ LIVE TIMER ═══════════ */
export function formatLiveTimer(quitDate: string, now: number): { days: number; hours: number; minutes: number; totalHours: number } | null {
  const d = new Date(quitDate);
  if (isNaN(d.getTime())) return null;
  const ms = now - d.getTime();
  if (ms < 0) return null;
  const totalMinutes = Math.floor(ms / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, totalHours };
}
