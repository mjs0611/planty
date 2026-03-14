import type { Season, PlantType } from '@/types/plant';

export const SEASON_INFO: Record<Season, {
  emoji: string;
  name: string;
  desc: string;
  bonusStat: keyof { water: number; sunlight: number; health: number } | null;
  xpMultiplier: number;
}> = {
  spring: { emoji: '🌸', name: '봄',  desc: '건강 미션 XP +10%', bonusStat: 'health',   xpMultiplier: 1.1 },
  summer: { emoji: '☀️', name: '여름', desc: '햇빛 미션 XP +10%', bonusStat: 'sunlight', xpMultiplier: 1.1 },
  autumn: { emoji: '🍂', name: '가을', desc: '물 미션 XP +10%',   bonusStat: 'water',    xpMultiplier: 1.1 },
  winter: { emoji: '❄️', name: '겨울', desc: '전 미션 XP +5%',    bonusStat: null,       xpMultiplier: 1.05 },
};

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function seasonXpMultiplier(
  season: Season,
  statEffect: Partial<{ water: number; sunlight: number; health: number }>
): number {
  const info = SEASON_INFO[season];
  if (!info.bonusStat) return info.xpMultiplier;
  if ((statEffect[info.bonusStat] ?? 0) > 0) return info.xpMultiplier;
  return 1;
}

export const PLANT_TYPE_INFO: Record<PlantType, { name: string; emoji: string; hueRotate: number; desc: string }> = {
  green:     { name: '초록 식물', emoji: '🌿', hueRotate: 0,   desc: '싱그러운 초록 식물' },
  cactus:    { name: '선인장',    emoji: '🌵', hueRotate: 45,  desc: '강인하고 독특한 선인장' },
  cherry:    { name: '벚꽃 나무', emoji: '🌸', hueRotate: 300, desc: '아름다운 벚꽃 나무' },
  sunflower: { name: '해바라기',  emoji: '🌻', hueRotate: 30,  desc: '밝고 환한 해바라기' },
  bamboo:    { name: '대나무',    emoji: '🎍', hueRotate: 90,  desc: '곧고 굳건한 대나무' },
  rose:      { name: '장미',      emoji: '🌹', hueRotate: 330, desc: '우아하고 고귀한 장미' },
};

export const PLANT_TYPE_ORDER: PlantType[] = ['green', 'cactus', 'cherry', 'sunflower', 'bamboo', 'rose'];

export const GROWTH_EVENTS = [
  { emoji: '🦋', message: '나비가 찾아왔어요!',     xpBonus: 5 },
  { emoji: '🌿', message: '새 잎이 돋았어요!',      xpBonus: 5 },
  { emoji: '💎', message: '이슬이 맺혔어요!',       xpBonus: 3 },
  { emoji: '🐞', message: '무당벌레가 놀러왔어요!', xpBonus: 3 },
  { emoji: '✨', message: '별빛 에너지가 흘러들어요!', xpBonus: 8 },
  { emoji: '🌈', message: '무지개가 떴어요!',       xpBonus: 8 },
  { emoji: '🐝', message: '벌이 꿀을 가져왔어요!', xpBonus: 5 },
  { emoji: '🌙', message: '달빛을 받았어요!',       xpBonus: 5 },
];

// ISO week string: "YYYY-WW"
export function getCurrentWeekStr(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-${String(week).padStart(2, '0')}`;
}
