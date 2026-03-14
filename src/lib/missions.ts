import { Mission, TimeSlotMissions } from "@/types/plant";

export const ALL_MISSIONS: Mission[] = [
  { id: 'water',     emoji: '💧', label: '물 주기',        statEffect: { water: 20 },                xpReward: 15 },
  { id: 'sunlight',  emoji: '☀️', label: '햇빛 주기',      statEffect: { sunlight: 20 },             xpReward: 15 },
  { id: 'wipe',      emoji: '🍃', label: '잎 닦기',         statEffect: { health: 15 },               xpReward: 10 },
  { id: 'talk',      emoji: '💬', label: '말 걸기',          statEffect: { health: 10 },               xpReward: 10 },
  { id: 'fertilize', emoji: '💊', label: '영양제 주기',     statEffect: { health: 20, water: 5 },     xpReward: 20 },
  { id: 'observe',   emoji: '📸', label: '사진 관찰',       statEffect: { sunlight: 10, health: 5 },  xpReward: 12 },
  { id: 'prune',     emoji: '✂️', label: '가지치기',         statEffect: { health: 25 },               xpReward: 18 },
  { id: 'sing',      emoji: '🎵', label: '노래 불러주기',   statEffect: { health: 12, sunlight: 8 },  xpReward: 14 },
  { id: 'mist',      emoji: '🌊', label: '분무기 뿌리기',   statEffect: { water: 15, health: 5 },     xpReward: 12 },
  { id: 'stretch',   emoji: '🤸', label: '줄기 세워주기',   statEffect: { health: 10, sunlight: 10 }, xpReward: 12 },
  { id: 'journal',   emoji: '📓', label: '식물 일기 쓰기',  statEffect: { health: 15 },               xpReward: 15 },
  { id: 'hug',       emoji: '🤗', label: '안아주기',         statEffect: { health: 20 },               xpReward: 15 },
];

// Pick 9 unique missions for today (3 per slot), seeded by date
export function getTodayMissions(dateStr: string): TimeSlotMissions {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const shuffled = [...ALL_MISSIONS].sort((a, b) => {
    const ha = Math.sin(hash + a.id.charCodeAt(0)) * 10000;
    const hb = Math.sin(hash + b.id.charCodeAt(0)) * 10000;
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb));
  });
  const picked = shuffled.slice(0, 9).map(m => m.id);
  return {
    morning:   picked.slice(0, 3),
    afternoon: picked.slice(3, 6),
    evening:   picked.slice(6, 9),
  };
}

export function getMissionById(id: string): Mission | undefined {
  return ALL_MISSIONS.find(m => m.id === id);
}

// Parse slotId: 'morning_water' → { slot: 'morning', missionId: 'water' }
export function parseSlotId(slotId: string): { slot: string; missionId: string } {
  const idx = slotId.indexOf('_');
  return {
    slot: slotId.slice(0, idx),
    missionId: slotId.slice(idx + 1),
  };
}
