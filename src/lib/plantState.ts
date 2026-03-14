import { PlantState, PlantStage, PlantStats, MissionResult, PlantType, GrowthEvent } from "@/types/plant";
import { getTodayMissions, getMissionById, parseSlotId } from "./missions";
import { getCurrentWeather, getCurrentTimeSlot, weatherBonusMultiplier } from "./weather";
import { getCurrentSeason, seasonXpMultiplier, GROWTH_EVENTS, PLANT_TYPE_ORDER, getCurrentWeekStr } from "./season";
import { format, isYesterday, parseISO, differenceInCalendarDays } from "date-fns";

const STORAGE_KEY = "daily_green_state";

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'young', 'bud', 'flower', 'fruit', 'bloom', 'special'];

const XP_REQUIRED: Record<PlantStage, number> = {
  seed: 30, sprout: 60, young: 100, bud: 150,
  flower: 200, fruit: 250, bloom: 300, special: 9999,
};

export const STAGE_INFO: Record<PlantStage, { image: string; name: string; description: string }> = {
  seed:    { image: '/plants/stage_1_seed.png',    name: '씨앗',      description: '작은 씨앗이 싹을 틔우려 해요' },
  sprout:  { image: '/plants/stage_2_sprout.png',  name: '새싹',      description: '귀여운 새싹이 올라왔어요!' },
  young:   { image: '/plants/stage_3_young.png',   name: '어린 식물', description: '쑥쑥 자라고 있어요!' },
  bud:     { image: '/plants/stage_4_bud.png',     name: '꽃봉오리',  description: '꽃이 피려고 해요!' },
  flower:  { image: '/plants/stage_5_flower.png',  name: '꽃',        description: '예쁜 꽃이 피었어요!' },
  fruit:   { image: '/plants/stage_6_fruit.png',   name: '열매',      description: '달콤한 열매가 맺혔어요!' },
  bloom:   { image: '/plants/stage_7_bloom.png',   name: '만개',      description: '화려하게 만개했어요!' },
  special: { image: '/plants/stage_8_golden.png',  name: '황금 식물', description: '전설의 황금 식물이 되었어요!' },
};

const MAX_SHIELDS = 2;

function applyXp(state: PlantState, xp: number): PlantState {
  let { stage, xpRequired } = state;
  let finalXp = state.xp + xp;
  while (finalXp >= xpRequired && stage !== 'special') {
    finalXp -= xpRequired;
    const idx = STAGE_ORDER.indexOf(stage);
    stage = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)];
    xpRequired = XP_REQUIRED[stage];
  }
  return { ...state, xp: finalXp, xpRequired, stage };
}

function nextPlantType(current: PlantType): PlantType {
  const idx = PLANT_TYPE_ORDER.indexOf(current);
  return PLANT_TYPE_ORDER[(idx + 1) % PLANT_TYPE_ORDER.length];
}

function refreshShieldIfNewWeek(state: PlantState): PlantState {
  const thisWeek = getCurrentWeekStr();
  if (state.lastShieldRefillWeek === thisWeek) return state;
  const newShields = Math.min(MAX_SHIELDS, (state.streakShields ?? 0) + 1);
  return { ...state, streakShields: newShields, lastShieldRefillWeek: thisWeek };
}

export function getInitialState(): PlantState {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    stage: 'seed',
    plantType: 'green',
    garden: [],
    stats: { water: 80, sunlight: 80, health: 80 },
    xp: 0,
    xpRequired: XP_REQUIRED['seed'],
    streak: 0,
    maxStreak: 0,
    lastCareDate: null,
    lastCareTime: null,
    adLastWatched: null,
    lastLoginBonusDate: null,
    lastWateringTime: null,
    lastMoodInteractTime: null,
    streakShields: 1, // Start with 1 shield
    lastShieldRefillWeek: getCurrentWeekStr(),
    completedMissions: [],
    timeSlotMissions: getTodayMissions(today),
    todayMissionsDate: today,
    isWilting: false,
    isDead: false,
    totalDaysAlive: 0,
  };
}

export function loadState(): PlantState {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let state: any = JSON.parse(raw);

    // Migrate missing fields
    if (!state.lastCareDate)         state.lastCareDate = null;
    if (!state.adLastWatched)        state.adLastWatched = null;
    if (!state.lastLoginBonusDate)   state.lastLoginBonusDate = null;
    if (!state.lastWateringTime)     state.lastWateringTime = null;
    if (!state.lastMoodInteractTime) state.lastMoodInteractTime = null;
    if (!state.plantType)            state.plantType = 'green';
    if (!state.garden)               state.garden = [];
    if (state.streakShields === undefined) state.streakShields = 0;
    if (!state.lastShieldRefillWeek) state.lastShieldRefillWeek = null;
    if (!state.maxStreak)            state.maxStreak = state.streak ?? 0;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Migrate old flat todayMissions → timeSlotMissions
    if (!state.timeSlotMissions) {
      state.timeSlotMissions = getTodayMissions(state.todayMissionsDate ?? today);
      state.completedMissions = [];
    }

    // Refresh missions on new day
    if (state.todayMissionsDate !== today) {
      state.timeSlotMissions = getTodayMissions(today);
      state.todayMissionsDate = today;
      state.completedMissions = [];
      state.totalDaysAlive = (state.totalDaysAlive ?? 0) + 1;
    }

    // Weekly shield refill
    state = refreshShieldIfNewWeek(state);

    // Streak & wilting/dead
    if (state.lastCareDate && state.lastCareDate !== today) {
      const lastDate = parseISO(state.lastCareDate);
      const daysSince = differenceInCalendarDays(new Date(), lastDate);

      if (daysSince >= 3) {
        // Can shield save from death? Only wilting → shield. Death needs 3+ days.
        state.streak = 0;
        state.isDead = true;
        state.isWilting = false;
      } else if (daysSince === 2) {
        // Use shield to protect streak if available
        if ((state.streakShields ?? 0) > 0) {
          state.streakShields -= 1;
          state.isWilting = false;
          state.isDead = false;
          // Streak preserved
        } else {
          state.streak = 0;
          state.isWilting = true;
          state.isDead = false;
        }
      } else {
        state.isWilting = false;
        state.isDead = false;
      }
    } else if (!state.lastCareDate) {
      state.isWilting = false;
      state.isDead = false;
    }

    return state as PlantState;
  } catch {
    return getInitialState();
  }
}

export function saveState(state: PlantState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function completeMission(
  state: PlantState,
  slotId: string,
  statEffect: Partial<PlantStats>,
  xpReward: number
): MissionResult {
  if (state.completedMissions.includes(slotId) || state.isDead) {
    return { state, luckyBonus: false, weatherBonus: false, xpGained: 0 };
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  let newStreak = state.streak;
  let newLastCareDate = state.lastCareDate;

  if (state.lastCareDate !== today) {
    if (state.lastCareDate) {
      const lastDate = parseISO(state.lastCareDate);
      newStreak = isYesterday(lastDate) ? state.streak + 1 : 1;
    } else {
      newStreak = 1;
    }
    newLastCareDate = today;
  }

  const newMaxStreak = Math.max(state.maxStreak ?? 0, newStreak);

  const newStats: PlantStats = {
    water:    Math.min(100, state.stats.water    + (statEffect.water    ?? 0)),
    sunlight: Math.min(100, state.stats.sunlight + (statEffect.sunlight ?? 0)),
    health:   Math.min(100, state.stats.health   + (statEffect.health   ?? 0)),
  };

  // Weather bonus
  const weather = getCurrentWeather();
  const { slot } = parseSlotId(slotId);
  const wMult = weatherBonusMultiplier(weather, slot as 'morning' | 'afternoon' | 'evening', statEffect);
  const weatherBonus = wMult > 1;

  // Season bonus
  const season = getCurrentSeason();
  const sMult = seasonXpMultiplier(season, statEffect);

  // Lucky bonus (20%)
  const luckyBonus = Math.random() < 0.2;
  const multiplier = wMult * sMult * (luckyBonus ? 2 : 1);
  const xpGained = Math.round(xpReward * multiplier);

  // Growth event (10% chance)
  let growthEvent: GrowthEvent | undefined;
  let eventXp = 0;
  if (Math.random() < 0.1) {
    growthEvent = GROWTH_EVENTS[Math.floor(Math.random() * GROWTH_EVENTS.length)];
    eventXp = growthEvent.xpBonus;
  }

  let next: PlantState = {
    ...state,
    stats: newStats,
    completedMissions: [...state.completedMissions, slotId],
    lastCareDate: newLastCareDate,
    streak: newStreak,
    maxStreak: newMaxStreak,
    isWilting: false,
    isDead: false,
  };
  next = applyXp(next, xpGained + eventXp);

  return { state: next, luckyBonus, weatherBonus, xpGained, growthEvent };
}

const AD_XP_REWARD = 50;

export function applyAdBoost(state: PlantState): { state: PlantState; xpGained: number } {
  let next = applyXp(state, AD_XP_REWARD);
  next = { ...next, isWilting: false, adLastWatched: new Date().toISOString() };
  return { state: next, xpGained: AD_XP_REWARD };
}

export function applyMiniWatering(state: PlantState): { state: PlantState; xpGained: number } | null {
  if (!isMiniWateringAvailable(state)) return null;
  const newStats = { ...state.stats, water: Math.min(100, state.stats.water + 8) };
  let next = applyXp({ ...state, stats: newStats }, 5);
  next = { ...next, lastWateringTime: new Date().toISOString() };
  return { state: next, xpGained: 5 };
}

export function isMiniWateringAvailable(state: PlantState): boolean {
  if (!state.lastWateringTime) return true;
  return Date.now() - new Date(state.lastWateringTime).getTime() >= 3 * 60 * 60 * 1000;
}

export function applyMoodInteract(state: PlantState): { state: PlantState; xpGained: number } | null {
  if (state.isDead) return null;
  if (state.lastMoodInteractTime) {
    if (Date.now() - new Date(state.lastMoodInteractTime).getTime() < 2 * 60 * 60 * 1000) return null;
  }
  let next = applyXp(state, 3);
  next = { ...next, lastMoodInteractTime: new Date().toISOString() };
  return { state: next, xpGained: 3 };
}

function loginBonusXp(streak: number): number {
  if (streak >= 30) return 30;
  if (streak >= 7)  return 20;
  if (streak >= 3)  return 15;
  return 10;
}

export function claimLoginBonus(state: PlantState): { state: PlantState; bonusXp: number } | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  if (state.lastLoginBonusDate === today || state.isDead) return null;
  const bonusXp = loginBonusXp(state.streak);
  let next = applyXp(state, bonusXp);
  next = { ...next, lastLoginBonusDate: today };
  return { state: next, bonusXp };
}

export function graduatePlant(state: PlantState): PlantState {
  if (state.stage !== 'special') return state;
  const collected = {
    type: state.plantType,
    completedAt: new Date().toISOString(),
    totalDaysAlive: state.totalDaysAlive,
    maxStreak: state.maxStreak,
  };
  const newType = nextPlantType(state.plantType);
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    ...getInitialState(),
    plantType: newType,
    garden: [...state.garden, collected],
    streak: state.streak,
    maxStreak: state.maxStreak,
    lastCareDate: state.lastCareDate,
    lastLoginBonusDate: state.lastLoginBonusDate,
    streakShields: state.streakShields,
    lastShieldRefillWeek: state.lastShieldRefillWeek,
    timeSlotMissions: getTodayMissions(today),
    todayMissionsDate: today,
    totalDaysAlive: state.totalDaysAlive,
  };
}

export function resetPlant(): PlantState {
  return getInitialState();
}

export function isAdAvailable(state: PlantState): boolean {
  if (!state.adLastWatched) return true;
  return Date.now() - new Date(state.adLastWatched).getTime() >= 60 * 60 * 1000;
}

export function getAllMissionIds(tsm: { morning: string[]; afternoon: string[]; evening: string[] }): string[] {
  return [
    ...tsm.morning.map(id => `morning_${id}`),
    ...tsm.afternoon.map(id => `afternoon_${id}`),
    ...tsm.evening.map(id => `evening_${id}`),
  ];
}
