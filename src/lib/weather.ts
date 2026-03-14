import type { Weather, TimeSlot } from '@/types/plant';

const SLOT_ORDER: TimeSlot[] = ['morning', 'afternoon', 'evening'];

export const WEATHER_INFO: Record<Weather, {
  emoji: string;
  name: string;
  desc: string;
  bonusStat?: keyof { water: number; sunlight: number; health: number };
  bonusSlot?: TimeSlot;
}> = {
  sunny:     { emoji: '☀️', name: '맑음',  desc: '햇빛 미션 XP 1.5배!',  bonusStat: 'sunlight' },
  cloudy:    { emoji: '⛅', name: '흐림',  desc: '평화로운 하루예요' },
  rainy:     { emoji: '🌧', name: '비',    desc: '물 미션 XP 1.5배!',     bonusStat: 'water' },
  windy:     { emoji: '💨', name: '바람',  desc: '건강 미션 XP 1.5배!',   bonusStat: 'health' },
  moonlight: { emoji: '🌙', name: '달빛',  desc: '저녁 미션 XP 1.5배!',   bonusSlot: 'evening' },
};

export function getCurrentWeather(): Weather {
  const now = new Date();
  const slot6h = Math.floor(now.getHours() / 6);
  const seed = (now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()) * 4 + slot6h;
  const weathers: Weather[] = ['sunny', 'cloudy', 'rainy', 'windy', 'moonlight'];
  const h = ((seed * 1664525 + 1013904223) >>> 0);
  return weathers[h % weathers.length];
}

export function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function isSlotUnlocked(slot: TimeSlot): boolean {
  const current = SLOT_ORDER.indexOf(getCurrentTimeSlot());
  return SLOT_ORDER.indexOf(slot) <= current;
}

export function getSlotMeta(slot: TimeSlot): { emoji: string; name: string; unlockHour: number } {
  return {
    morning:   { emoji: '🌅', name: '아침', unlockHour: 0 },
    afternoon: { emoji: '☀️', name: '낮',   unlockHour: 12 },
    evening:   { emoji: '🌙', name: '저녁', unlockHour: 18 },
  }[slot];
}

export function weatherBonusMultiplier(
  weather: Weather,
  slot: TimeSlot,
  statEffect: Partial<{ water: number; sunlight: number; health: number }>
): number {
  const info = WEATHER_INFO[weather];
  if (info.bonusSlot && info.bonusSlot === slot) return 1.5;
  if (info.bonusStat && (statEffect[info.bonusStat] ?? 0) > 0) return 1.5;
  return 1;
}
