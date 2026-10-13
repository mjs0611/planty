import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as plants from '@/lib/plantState';
import type { PlantState } from '@/types/plant';

const state = (overrides: Partial<PlantState> = {}): PlantState => ({ ...plants.getInitialState(), ...overrides });
const collected = (type: PlantState['plantType']) => ({ type, completedAt: '2026-10-01T09:00:00Z', totalDaysAlive: 5, maxStreak: 4 });
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('growth and collection goals', () => {
  it('counts the XP still needed for the next visible stage, including a stage boundary', () => {
    expect(plants.getGrowthGoal(state({ xp: 20 }))).toMatchObject({ nextStage: 'sprout', remainingXp: 10 });
    expect(plants.getGrowthGoal(state({ stage: 'bloom', xp: 299 }))).toMatchObject({ nextStage: 'special', remainingXp: 1 });
    expect(plants.getGrowthGoal(state({ stage: 'special', xp: 100 }))).toBeNull();
  });
  it('reports the actual earned XP across stage boundaries instead of subtracting local XP', () => {
    const before = state({ xp: 25 });
    const after = plants.applyMiniWatering(before)!.state;
    expect(plants.getGrowthFeedback(before, after, '물주기')).toMatchObject({ fromStage: 'seed', toStage: 'sprout', xpGained: 10 });
    expect(plants.getGrowthFeedback(after, after, '물주기')).toBeNull();
  });
  it('matches the next type to the actual graduation even if that type was collected before', () => {
    const before = state({ stage: 'special', plantType: 'cactus', garden: [collected('sunflower')] });
    expect(plants.getGardenSummary(before)).toMatchObject({ nextType: 'sunflower', collectedTypes: 1, completedPlants: 1, maxStreak: 4 });
    expect(plants.graduatePlant(before).plantType).toBe('sunflower');
  });
  it('keeps duplicate plants without counting them as new species or summing cumulative day snapshots', () => {
    const before = state({ maxStreak: 12, totalDaysAlive: 10, garden: [collected('green'), collected('green')] });
    expect(plants.getGardenSummary(before)).toMatchObject({ collectedTypes: 1, completedPlants: 2, maxStreak: 12 });
    expect(before.garden).toHaveLength(2);
  });
});

describe('collection identity on reconnect', () => {
  it.each(['sunflower', 'rose', 'bamboo'] as const)('preserves valid %s progress and collected history after saving and loading', (type) => {
    const before = state({ plantType: type, stage: 'flower', xp: 42, name: '오래 키운 식물', garden: [collected(type), collected(type)] });
    expect(plants.saveState(before)).toBe(true);
    const after = plants.loadState().state;
    expect(after.plantType).toBe(type);
    expect(after.garden.map(p => p.type)).toEqual([type, type]);
    expect(after).toMatchObject({ stage: 'flower', xp: 42, name: '오래 키운 식물' });
  });
  it('still migrates the retired cherry type while preserving its collection', () => {
    localStorage.setItem('planty_state', JSON.stringify({ ...state(), plantType: 'cherry', garden: [{ ...collected('flower'), type: 'cherry' }] }));
    const after = plants.loadState().state;
    expect(after.plantType).toBe('flower');
    expect(after.garden[0].type).toBe('flower');
  });
});
