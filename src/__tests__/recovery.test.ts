import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { format, subDays } from 'date-fns';
import { getInitialState, loadState, resetPlant, recoverPlant, saveState, applyMiniWatering } from '@/lib/plantState';
import { STORAGE_KEY } from '@/lib/constants';
import type { PlantState } from '@/types/plant';

const NOW = new Date(2026, 9, 5, 12);
const collection = [{ type: 'green' as const, completedAt: '2026-09-01T12:00:00.000Z', totalDaysAlive: 12, maxStreak: 9 }];

function returningState(overrides: Partial<PlantState> = {}): PlantState {
  return {
    ...getInitialState(), stage: 'flower', plantType: 'cactus', name: '초록이', xp: 42,
    xpRequired: 200, garden: collection, maxStreak: 12, streak: 7,
    totalDaysAlive: 20, todayMissionsDate: '2026-10-02', lastCareDate: '2026-10-02',
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(NOW);
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key), clear: () => values.clear(),
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('복귀 기록 보존', () => {
  it('3일 공백도 성장한 식물과 정원을 복구할 수 있는 상태로 남긴다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returningState()));
    const { state } = loadState();
    expect(state.isDead).toBe(true); // 저장 호환: 무료 복귀 돌봄이 필요한 상태
    expect(state.stage).toBe('flower');
    expect(state.garden).toEqual(collection);
    const restarted = resetPlant(state);
    expect(restarted.garden).toEqual(collection);
    expect(restarted.maxStreak).toBe(12);
    expect(restarted.totalDaysAlive).toBeGreaterThanOrEqual(20);
    expect(restarted.name).toBe('초록이');
  });

  it('무료 돌봄은 같은 식물의 상태만 회복하고 XP·광고·접속 보상을 추가하지 않는다', () => {
    const old = returningState({ isDead: true, stats: { water: 20, sunlight: 85, health: 0 },
      adLastWatched: '2026-10-05T00:00:00.000Z', lastLoginBonusDate: '2026-10-05',
      completedMissions: ['morning_water'], todayMissionsDate: '2026-10-05' });
    const recovered = recoverPlant(old);
    expect(recovered).toMatchObject({ stage: 'flower', plantType: 'cactus', name: '초록이', xp: 42,
      garden: collection, maxStreak: 12, totalDaysAlive: 20, streak: 1,
      stats: { water: 60, sunlight: 85, health: 60 }, isDead: false, isWilting: false,
      adLastWatched: old.adLastWatched, lastLoginBonusDate: old.lastLoginBonusDate,
      completedMissions: old.completedMissions, lastCareDate: '2026-10-05' });
    expect(old.isDead).toBe(true);
    expect(old.stats.health).toBe(0);
    expect(recoverPlant(recovered)).toBe(recovered);
  });

  it('회복을 저장하고 다시 열면 복귀 상태가 반복되지 않는다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returningState()));
    const recovered = recoverPlant(loadState().state);
    expect(saveState(recovered)).toBe(true);
    const restored = loadState().state;
    expect(restored).toMatchObject({ isDead: false, isWilting: false, stage: 'flower', xp: 42,
      name: '초록이', maxStreak: 12, garden: collection, lastCareDate: '2026-10-05' });
  });

  it.each([3, 7, 90, 365])('%i일 공백에도 정원·성장·최고 기록이 남고 무료 회복이 가능하다', (days) => {
    const date = format(subDays(NOW, days), 'yyyy-MM-dd');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returningState({ lastCareDate: date, todayMissionsDate: date })));
    const state = loadState().state;
    expect(state.isDead).toBe(true);
    const recovered = recoverPlant(state);
    expect(recovered.garden).toEqual(collection);
    expect(recovered.stage).toBe('flower');
    expect(recovered.xp).toBe(42);
    expect(recovered.maxStreak).toBe(12);
    expect(Object.values(recovered.stats).every(value => value >= 60 && value <= 100)).toBe(true);
  });

  it('반복 새 씨앗 초기화에서도 누적 기록과 오늘의 한도를 보존한다', () => {
    const original = returningState({ isDead: true, lastMilestoneStreak: 12,
      todayMissionsDate: '2026-10-05', completedMissions: ['morning_water'],
      lastLoginBonusDate: '2026-10-05', adLastWatched: '2026-10-05T01:00:00.000Z',
      tapHealthToday: 10, lastTapStatDate: '2026-10-05' });
    const second = resetPlant(resetPlant(original));
    expect(second).toMatchObject({ garden: collection, name: '초록이', plantType: 'cactus',
      maxStreak: 12, totalDaysAlive: 20, lastMilestoneStreak: 12, stage: 'seed', xp: 0,
      lastLoginBonusDate: original.lastLoginBonusDate, adLastWatched: original.adLastWatched,
      tapHealthToday: 10, completedMissions: original.completedMissions });
  });

  it('구형 저장의 사망 표시와 누락된 필드는 정원을 지우지 않고 무료 복귀로 옮긴다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage: 'flower', plantType: 'cactus',
      garden: collection, name: '예전식물', xp: 42, isDead: true, maxStreak: 12, totalDaysAlive: 20 }));
    const { state } = loadState();
    expect(state.isDead).toBe(true);
    expect(state.stats).toEqual({ water: 80, sunlight: 80, health: 80 });
    expect(recoverPlant(state)).toMatchObject({ stage: 'flower', xp: 42, garden: collection, name: '예전식물' });
  });

  it('구형 식물 타입·3시간대 미션도 누적 정원은 유지한다', () => {
    const old = { ...returningState(), plantType: 'cherry', garden: [{ ...collection[0], type: 'cherry' }],
      timeSlotMissions: { morning: ['water'], afternoon: ['sunlight'], evening: ['talk'] } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const recovered = recoverPlant(loadState().state);
    expect(recovered.plantType).toBe('flower');
    expect(recovered.garden).toEqual([{ ...collection[0], type: 'flower' }]);
    expect(recovered.timeSlotMissions.night).toHaveLength(3);
  });
});

describe('날짜·저장 회귀', () => {
  it('이틀 공백의 실드는 같은 날 다시 열어도 한 번만 차감한다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(returningState({ todayMissionsDate: '2026-10-03',
      lastCareDate: '2026-10-03', streakShields: 2 })));
    const first = loadState();
    expect(first.shieldConsumed).toBe(true);
    expect(first.state.streakShields).toBe(1);
    saveState(first.state);
    const next = loadState();
    expect(next.shieldConsumed).toBe(false);
    expect(next.state.streakShields).toBe(1);
    expect(next.state.isWilting).toBe(false);
  });

  it('자정 전 이틀·자정 후 사흘 경계에서 무료 회복 날짜를 실제 오늘로 기록한다', () => {
    const raw = returningState({ lastCareDate: '2026-10-02', todayMissionsDate: '2026-10-02', streakShields: 0 });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    vi.setSystemTime(new Date(2026, 9, 4, 23, 59));
    expect(loadState().state.isDead).toBe(false);
    vi.setSystemTime(new Date(2026, 9, 5, 0, 1));
    expect(loadState().state.isDead).toBe(true);
    const recovered = recoverPlant(loadState().state);
    expect(recovered.lastCareDate).toBe('2026-10-05');
    expect(recovered.todayMissionsDate).toBe('2026-10-05');
  });

  it('자정 전에 열린 복귀 화면도 자정 후 돌보면 새 날짜의 미션으로 이어간다', () => {
    const old = returningState({ isDead: true, todayMissionsDate: '2026-10-04', completedMissions: ['night_share'] });
    const next = recoverPlant(old);
    expect(next.todayMissionsDate).toBe('2026-10-05');
    expect(next.completedMissions).toEqual([]);
  });

  it('기기 시간이 뒤로 이동한 저장에서는 스탯이나 누적 일수를 부풀리지 않는다', () => {
    const old = returningState({ lastCareDate: '2026-10-10', todayMissionsDate: '2026-10-10',
      stats: { water: 45, sunlight: 55, health: 65 } });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const state = loadState().state;
    expect(state.stats).toEqual(old.stats);
    expect(state.totalDaysAlive).toBe(20);
    expect(state.isDead).toBe(false);
    expect(state.garden).toEqual(collection);
  });

  it('잘못된 날짜·누락 스탯에도 유효한 정원을 보존하고 NaN을 만들지 않는다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...returningState(), stats: null,
      lastCareDate: '2026-02-30', todayMissionsDate: 'bad-date' }));
    const state = loadState().state;
    expect(state.garden).toEqual(collection);
    expect(state.lastCareDate).toBeNull();
    expect(Object.values(state.stats).every(Number.isFinite)).toBe(true);
  });

  it('회복 전에는 일반 물주기로 XP를 얻지 못한다', () => {
    expect(applyMiniWatering(returningState({ isDead: true }))).toBeNull();
  });

  it('저장 실패는 예외 대신 false를 반환하며 재시도한 기록이 다시 복원된다', () => {
    const recovered = recoverPlant(returningState({ isDead: true }));
    const blocked = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    expect(saveState(recovered)).toBe(false);
    blocked.mockRestore();
    expect(saveState(recovered)).toBe(true);
    expect(loadState().state.garden).toEqual(collection);
  });

  it('저장소 읽기가 차단돼도 돌봄 가능한 초기 상태로 열리고 쓰기 실패를 알린다', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Blocked', 'SecurityError'); });
    expect(loadState().state.stage).toBe('seed');
    expect(saveState(getInitialState())).toBe(false);
  });
});
