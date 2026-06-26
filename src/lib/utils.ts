import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export function getWeekDates(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your only limit is your mind.",
  "Dream big, study hard, stay focused.",
  "Every hour of study brings you closer to your goal.",
  "JEE/NEET rank is earned in the quiet hours.",
  "Consistency beats intensity every single time.",
];

export const PLANT_STAGES = [
  { stage: 0, name: "Seed", minHours: 0 },
  { stage: 1, name: "Sprout", minHours: 1 },
  { stage: 2, name: "Seedling", minHours: 10 },
  { stage: 3, name: "Young Plant", minHours: 50 },
  { stage: 4, name: "Mature", minHours: 100 },
  { stage: 5, name: "Blooming", minHours: 250 },
  { stage: 6, name: "Mighty Tree", minHours: 500 },
  { stage: 7, name: "Legendary", minHours: 1000 },
  { stage: 8, name: "Mythical", minHours: 5000 },
  { stage: 9, name: "Eternal", minHours: 10000 },
];

export const FREE_LIMITS = {
  labels: 3,
  goals: 1,
  groups: 3,
  aiPrompts: 10,
};

export const PREMIUM_LIMITS = {
  labels: 50,
  goals: 50,
  groups: 30,
  aiPrompts: 500,
};
