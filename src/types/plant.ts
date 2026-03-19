export type PlantStage = 'seed' | 'sprout' | 'young' | 'bud' | 'flower' | 'fruit' | 'bloom' | 'special';
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'moonlight';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type PlantType = 'green' | 'cactus' | 'cherry' | 'sunflower' | 'bamboo' | 'rose';

export interface PlantStats {
  water: number;
  sunlight: number;
  health: number;
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
  night: string[];
}

export interface CollectedPlant {
  type: PlantType;
  completedAt: string; // ISO
  totalDaysAlive: number;
  maxStreak: number;
}

export interface PlantState {
  stage: PlantStage;
  plantType: PlantType;
  name?: string;
  lastMilestoneStreak?: number;
  garden: CollectedPlant[];
  stats: PlantStats;
  xp: number;
  xpRequired: number;
  streak: number;
  maxStreak: number;
  lastCareDate: string | null;
  adLastWatched: string | null;
  lastLoginBonusDate: string | null;
  lastWateringTime: string | null;
  lastMoodInteractTime: string | null;
  streakShields: number;
  lastShieldRefillWeek: string | null;
  completedMissions: string[];
  timeSlotMissions: TimeSlotMissions;
  todayMissionsDate: string;
  isWilting: boolean;
  isDead: boolean;
  totalDaysAlive: number;
}

export interface GrowthEvent {
  emoji: string;
  message: string;
  xpBonus: number;
}

export interface MissionResult {
  state: PlantState;
  luckyBonus: boolean;
  weatherBonus: boolean;
  xpGained: number;
  growthEvent?: GrowthEvent;
}
