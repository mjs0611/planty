// ── Storage ──────────────────────────────────────────────────────────────────
export const STORAGE_KEY = "planty_state";
export const ONBOARDED_KEY = "planty_onboarded";

// ── Cooldowns (ms) ────────────────────────────────────────────────────────────
export const MINI_WATERING_COOLDOWN_MS = 3 * 60 * 60 * 1000;
export const AD_COOLDOWN_MS = 60 * 60 * 1000;
export const MOOD_INTERACT_COOLDOWN_MS = 2 * 60 * 60 * 1000;

// ── Rewards ───────────────────────────────────────────────────────────────────
export const AD_XP_REWARD = 50;

// ── Creature spawning ─────────────────────────────────────────────────────────
export const CREATURE_SPAWN_MIN_MS = 90_000;
export const CREATURE_SPAWN_RANGE_MS = 150_000;

// ── Combo milestones ──────────────────────────────────────────────────────────
export const COMBO_MILESTONES = [
  { combo: 5,  emoji: "💕", xp: 3,  message: "💕 좋아, 좋아~",        hapticType: "success"  as const },
  { combo: 10, emoji: "🌸", xp: 5,  message: "🌸 두근두근! ×10",       hapticType: "success"  as const },
  { combo: 20, emoji: "🎊", xp: 10, message: "🎊 신난다! ×20",          hapticType: "confetti" as const },
  { combo: 30, emoji: "✨", xp: 15, message: "✨ 황금빛 에너지! ×30",   hapticType: "confetti" as const },
  { combo: 50, emoji: "🏆", xp: 20, message: "🏆 전설의 식물! ×50",     hapticType: "confetti" as const },
];

export const COMBO_MILESTONE_NUMBERS = new Set(COMBO_MILESTONES.map(m => m.combo));
