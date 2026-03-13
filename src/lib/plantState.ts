import { PlantState, PlantStage, PlantStats } from "@/types/plant";
import { getTodayMissions } from "./missions";
import { format } from "date-fns";

const STORAGE_KEY = "daily_green_state";

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'young', 'flowering', 'mature', 'special'];
const XP_REQUIRED: Record<PlantStage, number> = {
  seed: 50,
  sprout: 100,
  young: 150,
  flowering: 200,
  mature: 300,
  special: 9999, // Max stage
};

export function getInitialState(): PlantState {
  const today = format(new Date(), 'yyyy-MM-dd');
  return {
    stage: 'seed',
    stats: { water: 80, sunlight: 80, health: 80 },
    xp: 0,
    xpRequired: XP_REQUIRED['seed'],
    streak: 0,
    lastCareTime: null,
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
    // Refresh today's missions if date changed
    const today = format(new Date(), 'yyyy-MM-dd');
    if (state.todayMissionsDate !== today) {
      state.todayMissions = getTodayMissions(today);
      state.todayMissionsDate = today;
      state.completedMissions = [];
    }
    return applyTimeDecay(state);
  } catch {
    return getInitialState();
  }
}

export function saveState(state: PlantState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Stats decrease over time if not cared for
function applyTimeDecay(state: PlantState): PlantState {
  if (!state.lastCareTime || state.isDead) return state;
  const lastCare = new Date(state.lastCareTime);
  const now = new Date();
  const hoursElapsed = (now.getTime() - lastCare.getTime()) / (1000 * 60 * 60);
  if (hoursElapsed < 6) return state; // Grace period

  const decayRate = Math.min(hoursElapsed / 24, 3); // Max 3x daily decay
  const newStats: PlantStats = {
    water: Math.max(0, state.stats.water - decayRate * 15),
    sunlight: Math.max(0, state.stats.sunlight - decayRate * 12),
    health: Math.max(0, state.stats.health - decayRate * 10),
  };

  const isWilting = newStats.water < 30 || newStats.sunlight < 30 || newStats.health < 30;
  const isDead = newStats.water === 0 && newStats.sunlight === 0 && newStats.health === 0;

  return { ...state, stats: newStats, isWilting, isDead };
}

export function completeMission(state: PlantState, missionId: string, statEffect: Partial<PlantStats>, xpReward: number): PlantState {
  if (state.completedMissions.includes(missionId) || state.isDead) return state;

  const newStats: PlantStats = {
    water: Math.min(100, state.stats.water + (statEffect.water ?? 0)),
    sunlight: Math.min(100, state.stats.sunlight + (statEffect.sunlight ?? 0)),
    health: Math.min(100, state.stats.health + (statEffect.health ?? 0)),
  };

  const newXp = state.xp + xpReward;
  const completedMissions = [...state.completedMissions, missionId];
  const isWilting = newStats.water < 30 || newStats.sunlight < 30 || newStats.health < 30;

  let { stage, xpRequired } = state;
  let finalXp = newXp;

  if (newXp >= xpRequired && stage !== 'special') {
    const currentIndex = STAGE_ORDER.indexOf(stage);
    stage = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 1)];
    xpRequired = XP_REQUIRED[stage];
    finalXp = newXp - state.xpRequired; // carry over
  }

  return {
    ...state,
    stats: newStats,
    xp: finalXp,
    xpRequired,
    stage,
    completedMissions,
    lastCareTime: new Date().toISOString(),
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
    lastCareTime: new Date().toISOString(),
  };
}

export function resetPlant(): PlantState {
  return getInitialState();
}

export const STAGE_INFO: Record<PlantStage, { emoji: string; name: string; description: string }> = {
  seed: { emoji: '🌰', name: '씨앗', description: '작은 씨앗이 싹을 틔우려 해요' },
  sprout: { emoji: '🌱', name: '새싹', description: '귀여운 새싹이 올라왔어요!' },
  young: { emoji: '🌿', name: '어린 식물', description: '쑥쑥 자라고 있어요!' },
  flowering: { emoji: '🌸', name: '꽃봉오리', description: '꽃이 피려고 해요!' },
  mature: { emoji: '🌺', name: '만개', description: '아름답게 꽃이 피었어요!' },
  special: { emoji: '✨🌟', name: '황금 식물', description: '전설의 황금 식물이 되었어요!' },
};
