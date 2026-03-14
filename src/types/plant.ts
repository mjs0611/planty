export type PlantStage = 'seed' | 'sprout' | 'young' | 'bud' | 'flower' | 'fruit' | 'bloom' | 'special';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'moonlight';

export interface PlantStats {
  water: number;    // 0-100
  sunlight: number; // 0-100
  health: number;   // 0-100
}

export interface Mission {
  id: string;
  emoji: string;
  label: string;
  statEffect: Partial<PlantStats>;
  xpReward: number;
}

export interface TimeSlotMissions {
  morning: string[];
  afternoon: string[];
  evening: string[];
}

export interface PlantState {
  stage: PlantStage;
  stats: PlantStats;
  xp: number;
  xpRequired: number;
  streak: number;
  lastCareDate: string | null;          // YYYY-MM-DD
  lastCareTime: string | null;          // kept for migration compat
  adLastWatched: string | null;         // ISO string
  lastLoginBonusDate: string | null;    // YYYY-MM-DD
  lastWateringTime: string | null;      // ISO string (mini watering cooldown)
  lastMoodInteractTime: string | null;  // ISO string (mood tap cooldown)
  completedMissions: string[];          // slotId format: 'morning_water'
  timeSlotMissions: TimeSlotMissions;
  todayMissionsDate: string;
  isWilting: boolean;
  isDead: boolean;
  totalDaysAlive: number;
}

export interface MissionResult {
  state: PlantState;
  luckyBonus: boolean;
  weatherBonus: boolean;
  xpGained: number;
}
