import { describe, it, expect } from 'vitest';
import { getTodayMissions, getMissionById, parseSlotId, ALL_MISSIONS } from '@/lib/missions';

describe('getTodayMissions', () => {
  it('4개 슬롯, 각 3개 미션 반환', () => {
    const tsm = getTodayMissions('2026-03-20');
    expect(tsm.morning).toHaveLength(3);
    expect(tsm.afternoon).toHaveLength(3);
    expect(tsm.evening).toHaveLength(3);
    expect(tsm.night).toHaveLength(3);
  });

  it('같은 날짜는 항상 동일 결과 (결정론적)', () => {
    const a = getTodayMissions('2026-03-20');
    const b = getTodayMissions('2026-03-20');
    expect(a).toEqual(b);
  });

  it('다른 날짜는 다른 결과', () => {
    const a = getTodayMissions('2026-03-20');
    const b = getTodayMissions('2026-04-01');
    const aAll = [...a.morning, ...a.afternoon, ...a.evening, ...a.night].join();
    const bAll = [...b.morning, ...b.afternoon, ...b.evening, ...b.night].join();
    expect(aAll).not.toBe(bAll);
  });

  it('12개 미션 중복 없음', () => {
    const tsm = getTodayMissions('2026-03-20');
    const all = [...tsm.morning, ...tsm.afternoon, ...tsm.evening, ...tsm.night];
    expect(new Set(all).size).toBe(12);
  });

  it('모든 미션 ID가 ALL_MISSIONS에 존재', () => {
    const validIds = new Set(ALL_MISSIONS.map(m => m.id));
    const tsm = getTodayMissions('2026-03-20');
    const all = [...tsm.morning, ...tsm.afternoon, ...tsm.evening, ...tsm.night];
    all.forEach(id => expect(validIds.has(id)).toBe(true));
  });
});

describe('getMissionById', () => {
  it('유효한 ID로 미션 반환', () => {
    const mission = getMissionById('water');
    expect(mission).toBeDefined();
    expect(mission?.label).toBe('물 듬뿍 주기');
  });

  it('존재하지 않는 ID는 undefined', () => {
    expect(getMissionById('nonexistent')).toBeUndefined();
  });
});

describe('parseSlotId', () => {
  it('morning_water → { slot: morning, missionId: water }', () => {
    expect(parseSlotId('morning_water')).toEqual({ slot: 'morning', missionId: 'water' });
  });

  it('afternoon_fertilize 파싱', () => {
    expect(parseSlotId('afternoon_fertilize')).toEqual({ slot: 'afternoon', missionId: 'fertilize' });
  });

  it('night_hug 파싱', () => {
    expect(parseSlotId('night_hug')).toEqual({ slot: 'night', missionId: 'hug' });
  });
});
