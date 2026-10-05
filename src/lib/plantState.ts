import { PlantState, PlantStage, PlantStats, MissionResult, PlantType, GrowthEvent } from "@/types/plant";
import { getTodayMissions, getMissionById, parseSlotId } from "./missions";
import { getCurrentWeather, getCurrentTimeSlot, weatherBonusMultiplier } from "./weather";
import { getCurrentSeason, seasonXpMultiplier, GROWTH_EVENTS, PLANT_TYPE_ORDER, PLANT_TYPE_INFO, getCurrentWeekStr } from "./season";
import { format, isYesterday, parseISO, differenceInCalendarDays } from "date-fns";
import { STORAGE_KEY, AD_XP_REWARD, MINI_WATERING_COOLDOWN_MS, AD_COOLDOWN_MS, MOOD_INTERACT_COOLDOWN_MS } from "./constants";

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'young', 'bud', 'flower', 'fruit', 'bloom', 'special'];

export function getPlantImage(stage: PlantStage, plantType: PlantType): string {
  const idx = STAGE_ORDER.indexOf(stage) + 1;
  return `/plants/${plantType}/stage_${idx}.png`;
}

const XP_REQUIRED: Record<PlantStage, number> = {
  seed: 30, sprout: 60, young: 100, bud: 150,
  flower: 200, fruit: 250, bloom: 300, special: 9999,
};

export const STAGE_INFO: Record<PlantStage, { name: string; description: string }> = {
  seed:    { name: '씨앗',     description: '작은 씨앗이 싹을 틔우려 해요' },
  sprout:  { name: '새싹',     description: '귀여운 새싹이 올라왔어요!' },
  young:   { name: '어린 식물', description: '쑥쑥 자라고 있어요!' },
  bud:     { name: '꽃봉오리', description: '꽃이 피려고 해요!' },
  flower:  { name: '꽃',       description: '예쁜 꽃이 피었어요!' },
  fruit:   { name: '열매',     description: '달콤한 열매가 맺혔어요!' },
  bloom:   { name: '만개',     description: '화려하게 만개했어요!' },
  special: { name: '황금 식물', description: '전설의 황금 식물이 되었어요!' },
};

const MAX_SHIELDS = 2;

function calendarDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = parseISO(value);
  return Number.isFinite(parsed.getTime()) && format(parsed, 'yyyy-MM-dd') === value ? value : null;
}

function nonNegative(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function isPlantType(value: unknown): value is PlantType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANT_TYPE_INFO, value);
}

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

function getRandomInitialPlantType(): PlantType {
  return PLANT_TYPE_ORDER[Math.floor(Math.random() * PLANT_TYPE_ORDER.length)];
}

export function getInitialState(): PlantState {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    stage: 'seed',
    plantType: getRandomInitialPlantType(),
    garden: [],
    stats: { water: 80, sunlight: 80, health: 80 },
    xp: 0,
    xpRequired: XP_REQUIRED['seed'],
    streak: 0,
    maxStreak: 0,
    lastCareDate: null,
    adLastWatched: null,
    lastLoginBonusDate: null,
    lastWateringTime: null,
    lastMoodInteractTime: null,
    tapHealthToday: 0,
    lastTapStatDate: null,
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

export function loadState(): { state: PlantState; shieldConsumed: boolean } {
  if (typeof window === 'undefined') return { state: getInitialState(), shieldConsumed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: getInitialState(), shieldConsumed: false };
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid plant state');
    let state = { ...getInitialState(), ...saved } as PlantState;

    // Keep valid legacy records while filling missing state fields.
    if (!STAGE_ORDER.includes(state.stage)) state.stage = 'seed';
    state.xp = nonNegative(state.xp);
    state.xpRequired = XP_REQUIRED[state.stage as PlantStage];
    state.stats = {
      water: Math.min(100, nonNegative(state.stats?.water, 80)),
      sunlight: Math.min(100, nonNegative(state.stats?.sunlight, 80)),
      health: Math.min(100, nonNegative(state.stats?.health, 80)),
    };
    state.maxStreak = nonNegative(state.maxStreak, nonNegative(state.streak));
    state.streak = nonNegative(state.streak);
    state.streakShields = Math.min(MAX_SHIELDS, nonNegative(state.streakShields));
    state.totalDaysAlive = nonNegative(state.totalDaysAlive);
    state.completedMissions = Array.isArray(state.completedMissions) ? state.completedMissions.filter((id: unknown) => typeof id === 'string') : [];
    state.lastCareDate = calendarDate(state.lastCareDate);
    state.isDead = state.isDead === true;
    state.isWilting = state.isWilting === true;

    // Migrate old PlantType (6종 → 3종)
    const LEGACY_TYPE_MAP: Record<string, PlantType> = {
      cherry: 'flower', sunflower: 'flower', rose: 'flower', bamboo: 'green',
    };
    if (state.plantType && LEGACY_TYPE_MAP[state.plantType]) {
      state.plantType = LEGACY_TYPE_MAP[state.plantType];
    }
    if (Array.isArray(state.garden)) {
      state.garden = state.garden.filter(g => g && typeof g === 'object').map(g => ({
        ...g,
        type: LEGACY_TYPE_MAP[g.type] ?? g.type,
      })).filter(g => isPlantType(g.type));
    }

    // Migrate missing fields
    if (!state.lastCareDate) state.lastCareDate = null;
    if (!state.adLastWatched) state.adLastWatched = null;
    if (!state.lastLoginBonusDate) state.lastLoginBonusDate = null;
    if (!state.lastWateringTime) state.lastWateringTime = null;
    if (!state.lastMoodInteractTime) state.lastMoodInteractTime = null;
    if (!isPlantType(state.plantType)) state.plantType = 'green';
    if (!Array.isArray(state.garden)) state.garden = [];
    if (state.streakShields === undefined) state.streakShields = 0;
    if (!state.lastShieldRefillWeek) state.lastShieldRefillWeek = null;
    if (state.tapHealthToday === undefined) state.tapHealthToday = 0;
    if (!state.lastTapStatDate) state.lastTapStatDate = null;
    if (!state.maxStreak) state.maxStreak = state.streak ?? 0;
    if (state.lastMilestoneStreak === undefined) state.lastMilestoneStreak = 0;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Migrate old flat todayMissions → timeSlotMissions
    if (!saved.timeSlotMissions) {
      state.timeSlotMissions = getTodayMissions(state.todayMissionsDate ?? today);
      state.completedMissions = [];
    }
    // Migrate missing night slot
    if (!state.timeSlotMissions || !(['morning', 'afternoon', 'evening', 'night'] as const).every(slot => Array.isArray(state.timeSlotMissions[slot]))) {
      state.timeSlotMissions = getTodayMissions(state.todayMissionsDate ?? today);
    }

    // Refresh missions on new day
    const newDay = state.todayMissionsDate !== today;
    if (newDay) {
      // 스탯 일일 감소 (지난 날 수만큼 누적 적용, 최대 7일)
      const prevDate = calendarDate(state.todayMissionsDate);
      const decayDays = prevDate
        ? Math.max(0, Math.min(differenceInCalendarDays(new Date(), parseISO(prevDate)), 7))
        : 1;
      state.stats = {
        water:    Math.max(0, state.stats.water    - 15 * decayDays),
        sunlight: Math.max(0, state.stats.sunlight - 12 * decayDays),
        health:   Math.max(0, state.stats.health   -  8 * decayDays),
      };

      state.timeSlotMissions = getTodayMissions(today);
      state.todayMissionsDate = today;
      state.completedMissions = [];
      state.totalDaysAlive = (state.totalDaysAlive ?? 0) + (decayDays > 0 ? 1 : 0);
    }

    // Weekly shield refill
    state = refreshShieldIfNewWeek(state);

    // isDead stays compatible with older saves: it now means free recovery is needed.
    let shieldConsumed = false;
    if (state.isDead) {
      state.streak = 0;
      state.isWilting = false;
    } else if (state.lastCareDate && state.lastCareDate !== today) {
      const lastDate = parseISO(state.lastCareDate);
      const daysSince = differenceInCalendarDays(new Date(), lastDate);

      if (daysSince >= 3) {
        state.streak = 0;
        state.isDead = true;
        state.isWilting = false;
      } else if (daysSince === 2 && newDay) {
        if ((state.streakShields ?? 0) > 0) {
          state.streakShields -= 1;
          state.isWilting = false;
          state.isDead = false;
          shieldConsumed = true;
        } else {
          state.streak = 0;
          state.isWilting = true;
          state.isDead = false;
        }
      } else if (daysSince !== 2) {
        state.isWilting = false;
        state.isDead = false;
      }
    } else if (!state.lastCareDate) {
      state.isWilting = false;
      state.isDead = false;
    }

    return { state: state as PlantState, shieldConsumed };
  } catch {
    return { state: getInitialState(), shieldConsumed: false };
  }
}

export function saveState(state: PlantState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function completeMission(
  state: PlantState,
  slotId: string,
  statEffect: Partial<PlantStats>,
  xpReward: number
): MissionResult {
  if (state.completedMissions.includes(slotId) || state.isDead) {
    return { state, luckyBonus: false, weatherBonus: false, shieldBonus: false, xpGained: 0 };
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
    water: Math.min(100, state.stats.water + (statEffect.water ?? 0)),
    sunlight: Math.min(100, state.stats.sunlight + (statEffect.sunlight ?? 0)),
    health: Math.min(100, state.stats.health + (statEffect.health ?? 0)),
  };

  // Weather bonus
  const weather = getCurrentWeather();
  const { slot } = parseSlotId(slotId);
  const wMult = weatherBonusMultiplier(weather, slot as 'morning' | 'afternoon' | 'evening' | 'night', statEffect);
  const weatherBonus = wMult > 1;

  // Season bonus
  const season = getCurrentSeason();
  const sMult = seasonXpMultiplier(season, statEffect);

  // Lucky bonus (20%)
  const luckyBonus = Math.random() < 0.2;
  // Shield A: 실드 보유 중 XP +20%
  const shieldBonus = (state.streakShields ?? 0) > 0;
  const shieldBoost = shieldBonus ? 1.2 : 1;
  const multiplier = wMult * sMult * (luckyBonus ? 2 : 1) * shieldBoost;
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

  return { state: next, luckyBonus, weatherBonus, shieldBonus, xpGained, growthEvent };
}

export function applyAdBoost(state: PlantState): { state: PlantState; xpGained: number } {
  let next = applyXp(state, AD_XP_REWARD);
  next = { ...next, adLastWatched: new Date().toISOString() };
  return { state: next, xpGained: AD_XP_REWARD };
}

export function applyMiniWatering(state: PlantState): { state: PlantState; xpGained: number } | null {
  if (state.isDead || !isMiniWateringAvailable(state)) return null;
  const newStats = { ...state.stats, water: Math.min(100, state.stats.water + 8) };
  let next = applyXp({ ...state, stats: newStats }, 10);
  next = { ...next, lastWateringTime: new Date().toISOString() };
  return { state: next, xpGained: 10 };
}

export function isMiniWateringAvailable(state: PlantState): boolean {
  if (!state.lastWateringTime) return true;
  return Date.now() - new Date(state.lastWateringTime).getTime() >= MINI_WATERING_COOLDOWN_MS;
}

export function applyMoodInteract(state: PlantState): { state: PlantState; xpGained: number } | null {
  if (state.isDead) return null;
  if (state.lastMoodInteractTime) {
    if (Date.now() - new Date(state.lastMoodInteractTime).getTime() < MOOD_INTERACT_COOLDOWN_MS) return null;
  }
  let next = applyXp(state, 3);
  next = { ...next, lastMoodInteractTime: new Date().toISOString() };
  return { state: next, xpGained: 3 };
}

function loginBonusXp(streak: number): number {
  if (streak >= 30) return 30;
  if (streak >= 7) return 20;
  if (streak >= 3) return 15;
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
    lastMilestoneStreak: state.lastMilestoneStreak,
    timeSlotMissions: getTodayMissions(today),
    todayMissionsDate: today,
    totalDaysAlive: state.totalDaysAlive,
  };
}

/** Free return care restores the same plant; it never grants XP or needs an ad. */
export function recoverPlant(state: PlantState): PlantState {
  if (!state.isDead && !state.isWilting) return state;
  const today = format(new Date(), 'yyyy-MM-dd');
  const newDay = state.todayMissionsDate !== today;
  const streak = state.lastCareDate === today ? state.streak : 1;
  return {
    ...state,
    stats: {
      water: Math.max(state.stats.water, 60),
      sunlight: Math.max(state.stats.sunlight, 60),
      health: Math.max(state.stats.health, 60),
    },
    isDead: false,
    isWilting: false,
    lastCareDate: today,
    lastWateringTime: new Date().toISOString(),
    streak,
    maxStreak: Math.max(state.maxStreak, streak),
    todayMissionsDate: today,
    timeSlotMissions: newDay ? getTodayMissions(today) : state.timeSlotMissions,
    completedMissions: newDay ? [] : state.completedMissions,
  };
}

/** Legacy restart callers must provide the state so collections and daily limits survive. */
export function resetPlant(state: PlantState): PlantState {
  return {
    ...recoverPlant(state),
    stage: 'seed', xp: 0, xpRequired: XP_REQUIRED.seed,
    stats: { water: 80, sunlight: 80, health: 80 },
  };
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function checkStreakMilestone(state: PlantState): { milestone: number; bonusXp: number } | null {
  const last = state.lastMilestoneStreak ?? 0;
  const hit = STREAK_MILESTONES.filter(m => state.streak >= m && m > last).pop();
  if (!hit) return null;
  const bonusXp = hit >= 30 ? 50 : hit >= 14 ? 30 : hit >= 7 ? 20 : 10;
  return { milestone: hit, bonusXp };
}

export function applyStreakMilestone(state: PlantState, bonusXp: number): PlantState {
  let next = applyXp(state, bonusXp);
  next = { ...next, lastMilestoneStreak: state.streak };
  return next;
}

export function applyComboBonus(state: PlantState, xp: number): PlantState {
  return applyXp(state, xp);
}

export function applyCreatureReward(
  state: PlantState,
  xpReward: number,
  statEffect?: Partial<PlantStats>
): PlantState {
  const newStats: PlantStats = statEffect ? {
    water: Math.min(100, state.stats.water + (statEffect.water ?? 0)),
    sunlight: Math.min(100, state.stats.sunlight + (statEffect.sunlight ?? 0)),
    health: Math.min(100, state.stats.health + (statEffect.health ?? 0)),
  } : state.stats;
  return applyXp({ ...state, stats: newStats }, xpReward);
}

export function applyCreaturePenalty(state: PlantState, statEffect: Partial<PlantStats>): PlantState {
  const newStats: PlantStats = {
    water: Math.max(0, state.stats.water + (statEffect.water ?? 0)),
    sunlight: Math.max(0, state.stats.sunlight + (statEffect.sunlight ?? 0)),
    health: Math.max(0, state.stats.health + (statEffect.health ?? 0)),
  };
  return { ...state, stats: newStats };
}

export function isAdAvailable(state: PlantState): boolean {
  if (!state.adLastWatched) return true;
  return Date.now() - new Date(state.adLastWatched).getTime() >= AD_COOLDOWN_MS;
}

const TAP_STAT_DAILY_CAP = 10;

export function applyTapStatBoost(state: PlantState): { state: PlantState; gained: boolean } {
  if (state.isDead) return { state, gained: false };
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCount = state.lastTapStatDate === today ? (state.tapHealthToday ?? 0) : 0;
  if (todayCount >= TAP_STAT_DAILY_CAP) return { state, gained: false };

  const weather = getCurrentWeather();
  let bonusSunlight = 0;
  let bonusWater = 0;
  
  if (weather === 'sunny' && Math.random() < 0.25) bonusSunlight = 1;
  if (weather === 'rainy' && Math.random() < 0.25) bonusWater = 1;

  const newHealth = Math.min(100, state.stats.health + 1);
  const newSunlight = Math.min(100, state.stats.sunlight + bonusSunlight);
  const newWater = Math.min(100, state.stats.water + bonusWater);

  return {
    state: {
      ...state,
      stats: { ...state.stats, health: newHealth, sunlight: newSunlight, water: newWater },
      tapHealthToday: todayCount + 1,
      lastTapStatDate: today,
    },
    gained: true,
  };
}

export function getAllMissionIds(tsm: { morning: string[]; afternoon: string[]; evening: string[]; night: string[] }): string[] {
  return [
    ...tsm.morning.map(id => `morning_${id}`),
    ...tsm.afternoon.map(id => `afternoon_${id}`),
    ...tsm.evening.map(id => `evening_${id}`),
    ...(tsm.night ?? []).map(id => `night_${id}`),
  ];
}
