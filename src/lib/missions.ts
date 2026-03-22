import { Mission, TimeSlotMissions } from "@/types/plant";

export const ALL_MISSIONS: Mission[] = [
  { id: 'water',     emoji: '💧', label: '물 듬뿍 주기',        statEffect: { water: 20 },                xpReward: 15 },
  { id: 'sunlight',  emoji: '☀️', label: '햇빛 쬐어주기',      statEffect: { sunlight: 20 },             xpReward: 15 },
  { id: 'wipe',      emoji: '🍃', label: '잎사귀 닦아주기',     statEffect: { health: 15 },               xpReward: 10 },
  { id: 'talk',      emoji: '💬', label: '다정하게 말 걸기',    statEffect: { health: 10 },               xpReward: 10 },
  { id: 'fertilize', emoji: '💊', label: '식물 영양제 꽂기',    statEffect: { health: 20, water: 5 },     xpReward: 20 },
  { id: 'observe',   emoji: '📸', label: '성장일기 사진 찍기',  statEffect: { sunlight: 10, health: 5 },  xpReward: 12 },
  { id: 'prune',     emoji: '✂️', label: '시든 잎 잘라주기',    statEffect: { health: 25 },               xpReward: 18 },
  { id: 'sing',      emoji: '🎵', label: '기분 좋은 노래 틀기', statEffect: { health: 12, sunlight: 8 },  xpReward: 14 },
  { id: 'mist',      emoji: '🌊', label: '잎에 분무기 뿌리기',  statEffect: { water: 15, health: 5 },     xpReward: 12 },
  { id: 'breeze',    emoji: '🌬️', label: '선선한 바람 쐬주기',  statEffect: { health: 15, sunlight: 5 },  xpReward: 15 },
  { id: 'journal',   emoji: '📓', label: '성장 기록 남기기',    statEffect: { health: 15 },               xpReward: 15 },
  { id: 'share',     emoji: '💌', label: '친구에게 자랑하기',   statEffect: { health: 20 },               xpReward: 20 },
];

// Pick 12 unique missions for today (3 per slot), seeded by date
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
  const picked = shuffled.slice(0, 12).map(m => m.id);
  return {
    morning:   picked.slice(0, 3),
    afternoon: picked.slice(3, 6),
    evening:   picked.slice(6, 9),
    night:     picked.slice(9, 12),
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
