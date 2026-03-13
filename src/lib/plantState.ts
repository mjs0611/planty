import { PlantState, PlantStage, PlantStats } from "@/types/plant";
import { getTodayMissions } from "./missions";
import { format, isYesterday, parseISO, differenceInCalendarDays } from "date-fns";

const STORAGE_KEY = "daily_green_state";

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'young', 'bud', 'flower', 'fruit', 'bloom', 'special'];

const XP_REQUIRED: Record<PlantStage, number> = {
  seed: 30,
  sprout: 60,
  young: 100,
  bud: 150,
  flower: 200,
  fruit: 250,
  bloom: 300,
  special: 9999,
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

export function getInitialState(): PlantState {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    stage: 'seed',
    stats: { water: 80, sunlight: 80, health: 80 },
    xp: 0,
    xpRequired: XP_REQUIRED['seed'],
    streak: 0,
    lastCareDate: null,
    lastCareTime: null,
    adLastWatched: null,
    completedMissions: [],
    todayMissions: getTodayMissions(today),
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
    const state: PlantState = JSON.parse(raw);

    // Migrate old state missing new fields
    if (state.lastCareDate === undefined) state.lastCareDate = null;
    if (state.adLastWatched === undefined) state.adLastWatched = null;

    const today = format(new Date(), 'yyyy-MM-dd');

    // Refresh missions on new day
    if (state.todayMissionsDate !== today) {
      state.todayMissions = getTodayMissions(today);
      state.todayMissionsDate = today;
      state.completedMissions = [];
      state.totalDaysAlive += 1;
    }

    // Streak & wilting/dead: based on days since last care
    if (state.lastCareDate && state.lastCareDate !== today) {
      const lastDate = parseISO(state.lastCareDate);
      const daysSince = differenceInCalendarDays(new Date(), lastDate);

      if (daysSince >= 3) {
        state.streak = 0;
        state.isDead = true;
        state.isWilting = false;
      } else if (daysSince === 2) {
        state.streak = 0;
        state.isWilting = true;
        state.isDead = false;
      } else if (daysSince === 1) {
        // Cared yesterday — streak intact, not wilting
        state.isWilting = false;
        state.isDead = false;
      }
    } else if (!state.lastCareDate) {
      // Never cared (brand new plant)
      state.isWilting = false;
      state.isDead = false;
    }

    return state;
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
  missionId: string,
  statEffect: Partial<PlantStats>,
  xpReward: number
): PlantState {
  if (state.completedMissions.includes(missionId) || state.isDead) return state;

  const today = format(new Date(), 'yyyy-MM-dd');

  // Streak logic
  let newStreak = state.streak;
  let newLastCareDate = state.lastCareDate;

  if (state.lastCareDate !== today) {
    // First mission today
    if (state.lastCareDate) {
      const lastDate = parseISO(state.lastCareDate);
      newStreak = isYesterday(lastDate) ? state.streak + 1 : 1;
    } else {
      newStreak = 1;
    }
    newLastCareDate = today;
  }

  const newStats: PlantStats = {
    water: Math.min(100, state.stats.water + (statEffect.water ?? 0)),
    sunlight: Math.min(100, state.stats.sunlight + (statEffect.sunlight ?? 0)),
    health: Math.min(100, state.stats.health + (statEffect.health ?? 0)),
  };

  const newXp = state.xp + xpReward;
  const completedMissions = [...state.completedMissions, missionId];
  // Caring today always recovers wilting
  const isWilting = false;

  let { stage, xpRequired } = state;
  let finalXp = newXp;

  if (newXp >= xpRequired && stage !== 'special') {
    const currentIndex = STAGE_ORDER.indexOf(stage);
    stage = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 1)];
    xpRequired = XP_REQUIRED[stage];
    finalXp = newXp - state.xpRequired;
  }

  return {
    ...state,
    stats: newStats,
    xp: finalXp,
    xpRequired,
    stage,
    completedMissions,
    lastCareDate: newLastCareDate,
    streak: newStreak,
    isWilting,
    isDead: false,
  };
}

export function applyAdBoost(state: PlantState): PlantState {
  const boostedStats: PlantStats = {
    water: Math.min(100, state.stats.water + 20),
    sunlight: Math.min(100, state.stats.sunlight + 20),
    health: Math.min(100, state.stats.health + 20),
  };
  return {
    ...state,
    stats: boostedStats,
    xp: Math.min(state.xpRequired - 1, state.xp + 30),
    isWilting: false,
    adLastWatched: new Date().toISOString(),
  };
}

export function resetPlant(): PlantState {
  return getInitialState();
}

export function isAdAvailable(state: PlantState): boolean {
  if (!state.adLastWatched) return true;
  const lastWatched = new Date(state.adLastWatched);
  const hoursElapsed = (Date.now() - lastWatched.getTime()) / (1000 * 60 * 60);
  return hoursElapsed >= 1;
}
