/**
 * Complimentary premium for specific production users (no payment required).
 * IDs from production leaderboard; emails as a stable fallback on sign-in.
 */
const PREMIUM_GRANTED_USER_IDS = new Set([
  "cmqxi2lg40000l2049l65ulsu", // ADaRsH Kumar rawat
  "cmqxibjyo0004kz040i9jsh63", // Advika Mishra
]);

const PREMIUM_GRANTED_EMAILS = new Set([
  "adarshrawat474@gmail.com",
]);

export type AIMode = "chat" | "quiz" | "flashcard" | "summary";

export function hasPremiumAccess(user: {
  id?: string | null;
  email?: string | null;
  isPremium?: boolean | null;
}): boolean {
  if (user.isPremium) return true;
  if (user.id && PREMIUM_GRANTED_USER_IDS.has(user.id)) return true;
  if (user.email && PREMIUM_GRANTED_EMAILS.has(user.email.toLowerCase())) return true;
  return false;
}

export function canUseAIMode(
  mode: AIMode,
  user: { id?: string | null; email?: string | null; isPremium?: boolean | null }
): boolean {
  if (mode === "chat") return true;
  return hasPremiumAccess(user);
}
