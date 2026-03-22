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

export const PLANT_TYPE_INFO: Record<PlantType, { name: string; emoji: string; desc: string }> = {
  green:     { name: '초록 식물', emoji: '🌿', desc: '싱그러운 초록 식물' },
  flower:    { name: '꽃 식물',   emoji: '🌺', desc: '화사하게 피어나는 꽃 식물' },
  cactus:    { name: '선인장',    emoji: '🌵', desc: '강인하고 독특한 선인장' },
  sunflower: { name: '해바라기',  emoji: '🌻', desc: '태양을 사랑하는 밝은 해바라기' },
  rose:      { name: '장미',      emoji: '🌹', desc: '치명적인 매력을 가진 붉은 장미' },
  bamboo:    { name: '대나무',    emoji: '🎋', desc: '올곧게 자라는 푸른 대나무' },
  mushroom:  { name: '버섯',      emoji: '🍄', desc: '습한 곳을 좋아하는 귀여운 버섯' },
  succulent: { name: '다육이',    emoji: '🪴', desc: '작고 통통한 생명력 강한 다육이' },
  clover:    { name: '클로버',    emoji: '🍀', desc: '행운을 가져다주는 네잎클로버' },
  monstera:  { name: '몬스테라',  emoji: '🍃', desc: '멋진 구멍 잎을 가진 몬스테라' },
};

export const PLANT_TYPE_ORDER: PlantType[] = ['green', 'flower', 'cactus', 'sunflower', 'rose', 'bamboo', 'mushroom', 'succulent', 'clover', 'monstera'];

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

// ISO 8601 week string: "YYYY-WNN"
export function getCurrentWeekStr(): string {
  const now = new Date();
  // ISO week: Mon=1 start, Jan 4th always in week 1
  const tmp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayOfWeek = tmp.getUTCDay() || 7; // 1(Mon)~7(Sun)
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
