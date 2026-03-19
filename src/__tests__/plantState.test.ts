import { describe, it, expect } from 'vitest';
import { format, subDays } from 'date-fns';
import {
  getInitialState,
  completeMission,
  applyAdBoost,
  applyMiniWatering,
  isMiniWateringAvailable,
  applyMoodInteract,
  claimLoginBonus,
  graduatePlant,
  checkStreakMilestone,
  applyStreakMilestone,
  applyCreatureReward,
  applyCreaturePenalty,
  isAdAvailable,
  getAllMissionIds,
} from '@/lib/plantState';
import type { PlantState } from '@/types/plant';

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<PlantState> = {}): PlantState {
  return { ...getInitialState(), ...overrides };
}

// 실제 코드와 동일하게 date-fns format 사용 (로컬 타임존 기준)
function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function yesterday(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

// ── applyXp (applyAdBoost 통해 간접 테스트) ───────────────────────────────────

describe('applyXp (via applyAdBoost)', () => {
  it('XP 누적', () => {
    const s = makeState({ xp: 10, xpRequired: 30 });
    const { state } = applyAdBoost(s); // +50 XP
    expect(state.xp).toBeGreaterThan(10);
  });

  it('XP가 threshold 초과 시 레벨업', () => {
    const s = makeState({ stage: 'seed', xp: 25, xpRequired: 30 });
    const { state } = applyAdBoost(s); // +50 → 총 75, seed 기준 30 → 레벨업
    expect(state.stage).not.toBe('seed');
  });

  it('연속 레벨업 처리', () => {
    // xp=0, seed(30) → 50 XP → seed 완료(30) 후 sprout에 20 남음
    const s = makeState({ stage: 'seed', xp: 0, xpRequired: 30 });
    const { state } = applyAdBoost(s);
    expect(state.stage).toBe('sprout');
    expect(state.xp).toBe(20);
  });

  it('special 단계에서 멈춤', () => {
    const s = makeState({ stage: 'special', xp: 0, xpRequired: 9999 });
    const { state } = applyAdBoost(s);
    expect(state.stage).toBe('special');
  });
});

// ── completeMission ───────────────────────────────────────────────────────────

describe('completeMission', () => {
  const slotId = 'morning_water';
  const statEffect = { water: 20 };
  const xpReward = 15;

  it('이미 완료된 미션은 스킵', () => {
    const s = makeState({ completedMissions: [slotId] });
    const result = completeMission(s, slotId, statEffect, xpReward);
    expect(result.xpGained).toBe(0);
    expect(result.state.completedMissions).toHaveLength(1);
  });

  it('isDead 상태에서 스킵', () => {
    const s = makeState({ isDead: true });
    const result = completeMission(s, slotId, statEffect, xpReward);
    expect(result.xpGained).toBe(0);
  });

  it('첫 케어 시 streak=1 설정', () => {
    const s = makeState({ lastCareDate: null, streak: 0 });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.streak).toBe(1);
    expect(state.lastCareDate).toBe(today());
  });

  it('어제 케어했으면 streak 증가', () => {
    const s = makeState({ lastCareDate: yesterday(), streak: 5 });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.streak).toBe(6);
  });

  it('오늘 이미 케어한 경우 streak 유지', () => {
    const s = makeState({ lastCareDate: today(), streak: 3 });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.streak).toBe(3);
  });

  it('오래 전 케어했으면 streak=1 리셋', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const s = makeState({ lastCareDate: twoDaysAgo.toISOString().slice(0, 10), streak: 10 });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.streak).toBe(1);
  });

  it('스탯 100 상한선 적용', () => {
    const s = makeState({ stats: { water: 95, sunlight: 80, health: 80 } });
    const { state } = completeMission(s, slotId, { water: 20 }, xpReward);
    expect(state.stats.water).toBe(100);
  });

  it('스탯이 음수로 내려가지 않음', () => {
    const s = makeState({ stats: { water: 5, sunlight: 80, health: 80 } });
    const { state } = completeMission(s, slotId, { water: 0 }, xpReward);
    expect(state.stats.water).toBeGreaterThanOrEqual(0);
  });

  it('완료된 미션 목록에 추가', () => {
    const s = makeState({ completedMissions: [] });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.completedMissions).toContain(slotId);
  });

  it('maxStreak 업데이트', () => {
    const s = makeState({ lastCareDate: yesterday(), streak: 9, maxStreak: 9 });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.maxStreak).toBe(10);
  });

  it('isWilting 해제', () => {
    const s = makeState({ isWilting: true });
    const { state } = completeMission(s, slotId, statEffect, xpReward);
    expect(state.isWilting).toBe(false);
  });

  it('XP 획득 (최소 xpReward 이상)', () => {
    // 랜덤 보너스 없을 때도 기본 XP 이상
    const s = makeState({ xp: 0 });
    const { xpGained } = completeMission(s, slotId, statEffect, xpReward);
    expect(xpGained).toBeGreaterThanOrEqual(xpReward);
  });
});

// ── applyAdBoost ──────────────────────────────────────────────────────────────

describe('applyAdBoost', () => {
  it('+50 XP 지급', () => {
    const s = makeState({ xp: 0 });
    const { xpGained } = applyAdBoost(s);
    expect(xpGained).toBe(50);
  });

  it('isWilting 해제', () => {
    const s = makeState({ isWilting: true });
    const { state } = applyAdBoost(s);
    expect(state.isWilting).toBe(false);
  });

  it('adLastWatched 타임스탬프 기록', () => {
    const s = makeState({ adLastWatched: null });
    const { state } = applyAdBoost(s);
    expect(state.adLastWatched).not.toBeNull();
  });
});

// ── isAdAvailable ─────────────────────────────────────────────────────────────

describe('isAdAvailable', () => {
  it('처음이면 true', () => {
    expect(isAdAvailable(makeState({ adLastWatched: null }))).toBe(true);
  });

  it('1시간 넘으면 true', () => {
    expect(isAdAvailable(makeState({ adLastWatched: hoursAgo(2) }))).toBe(true);
  });

  it('1시간 미만이면 false', () => {
    expect(isAdAvailable(makeState({ adLastWatched: hoursAgo(0.5) }))).toBe(false);
  });
});

// ── applyMiniWatering ─────────────────────────────────────────────────────────

describe('applyMiniWatering', () => {
  it('물 +8, XP +5 지급', () => {
    const s = makeState({ stats: { water: 50, sunlight: 80, health: 80 } });
    const result = applyMiniWatering(s);
    expect(result).not.toBeNull();
    expect(result!.state.stats.water).toBe(58);
    expect(result!.xpGained).toBe(5);
  });

  it('쿨다운 중이면 null 반환', () => {
    const s = makeState({ lastWateringTime: hoursAgo(1) });
    expect(applyMiniWatering(s)).toBeNull();
  });

  it('물 100 상한선 적용', () => {
    const s = makeState({ stats: { water: 97, sunlight: 80, health: 80 } });
    const result = applyMiniWatering(s);
    expect(result!.state.stats.water).toBe(100);
  });
});

// ── isMiniWateringAvailable ───────────────────────────────────────────────────

describe('isMiniWateringAvailable', () => {
  it('lastWateringTime이 없으면 true', () => {
    expect(isMiniWateringAvailable(makeState({ lastWateringTime: null }))).toBe(true);
  });

  it('3시간 초과하면 true', () => {
    expect(isMiniWateringAvailable(makeState({ lastWateringTime: hoursAgo(4) }))).toBe(true);
  });

  it('3시간 미만이면 false', () => {
    expect(isMiniWateringAvailable(makeState({ lastWateringTime: hoursAgo(1) }))).toBe(false);
  });
});

// ── applyMoodInteract ─────────────────────────────────────────────────────────

describe('applyMoodInteract', () => {
  it('isDead이면 null', () => {
    expect(applyMoodInteract(makeState({ isDead: true }))).toBeNull();
  });

  it('2시간 쿨다운 중이면 null', () => {
    const s = makeState({ lastMoodInteractTime: hoursAgo(1) });
    expect(applyMoodInteract(s)).toBeNull();
  });

  it('처음 또는 쿨다운 지나면 +3 XP', () => {
    const s = makeState({ lastMoodInteractTime: null });
    const result = applyMoodInteract(s);
    expect(result).not.toBeNull();
    expect(result!.xpGained).toBe(3);
  });
});

// ── claimLoginBonus ───────────────────────────────────────────────────────────

describe('claimLoginBonus', () => {
  it('이미 오늘 수령 시 null', () => {
    const s = makeState({ lastLoginBonusDate: today() });
    expect(claimLoginBonus(s)).toBeNull();
  });

  it('isDead이면 null', () => {
    const s = makeState({ isDead: true, lastLoginBonusDate: null });
    expect(claimLoginBonus(s)).toBeNull();
  });

  it('streak 0-2 → 10 XP', () => {
    const s = makeState({ streak: 2, lastLoginBonusDate: null });
    expect(claimLoginBonus(s)!.bonusXp).toBe(10);
  });

  it('streak 3-6 → 15 XP', () => {
    const s = makeState({ streak: 5, lastLoginBonusDate: null });
    expect(claimLoginBonus(s)!.bonusXp).toBe(15);
  });

  it('streak 7-29 → 20 XP', () => {
    const s = makeState({ streak: 7, lastLoginBonusDate: null });
    expect(claimLoginBonus(s)!.bonusXp).toBe(20);
  });

  it('streak 30+ → 30 XP', () => {
    const s = makeState({ streak: 30, lastLoginBonusDate: null });
    expect(claimLoginBonus(s)!.bonusXp).toBe(30);
  });
});

// ── graduatePlant ─────────────────────────────────────────────────────────────

describe('graduatePlant', () => {
  it('special이 아니면 그대로 반환', () => {
    const s = makeState({ stage: 'bloom' });
    expect(graduatePlant(s)).toBe(s);
  });

  it('식물 타입 순환', () => {
    const s = makeState({ stage: 'special', plantType: 'green' });
    const next = graduatePlant(s);
    expect(next.plantType).toBe('cactus');
  });

  it('garden에 수집 기록 추가', () => {
    const s = makeState({ stage: 'special', garden: [] });
    const next = graduatePlant(s);
    expect(next.garden).toHaveLength(1);
    expect(next.garden[0].type).toBe('green');
  });

  it('streak, maxStreak, shields 유지', () => {
    const s = makeState({ stage: 'special', streak: 10, maxStreak: 15, streakShields: 2 });
    const next = graduatePlant(s);
    expect(next.streak).toBe(10);
    expect(next.maxStreak).toBe(15);
    expect(next.streakShields).toBe(2);
  });

  it('stage, xp 초기화', () => {
    const s = makeState({ stage: 'special', xp: 999 });
    const next = graduatePlant(s);
    expect(next.stage).toBe('seed');
    expect(next.xp).toBe(0);
  });
});

// ── checkStreakMilestone ──────────────────────────────────────────────────────

describe('checkStreakMilestone', () => {
  it('마일스톤 미달 시 null', () => {
    const s = makeState({ streak: 2, lastMilestoneStreak: 0 });
    expect(checkStreakMilestone(s)).toBeNull();
  });

  it('이미 달성한 마일스톤은 null', () => {
    const s = makeState({ streak: 3, lastMilestoneStreak: 3 });
    expect(checkStreakMilestone(s)).toBeNull();
  });

  it('streak 3 → milestone:3, bonusXp:10', () => {
    const s = makeState({ streak: 3, lastMilestoneStreak: 0 });
    const result = checkStreakMilestone(s);
    expect(result?.milestone).toBe(3);
    expect(result?.bonusXp).toBe(10);
  });

  it('streak 7 → milestone:7, bonusXp:20', () => {
    const s = makeState({ streak: 7, lastMilestoneStreak: 3 });
    const result = checkStreakMilestone(s);
    expect(result?.milestone).toBe(7);
    expect(result?.bonusXp).toBe(20);
  });

  it('streak 14 → bonusXp:30', () => {
    const s = makeState({ streak: 14, lastMilestoneStreak: 7 });
    expect(checkStreakMilestone(s)?.bonusXp).toBe(30);
  });

  it('streak 30 → bonusXp:50', () => {
    const s = makeState({ streak: 30, lastMilestoneStreak: 14 });
    expect(checkStreakMilestone(s)?.bonusXp).toBe(50);
  });
});

// ── applyCreatureReward / Penalty ─────────────────────────────────────────────

describe('applyCreatureReward', () => {
  it('XP 지급', () => {
    const s = makeState({ xp: 0 });
    const next = applyCreatureReward(s, 10);
    expect(next.xp).toBe(10);
  });

  it('스탯 효과 적용 (100 상한)', () => {
    const s = makeState({ stats: { water: 90, sunlight: 80, health: 80 } });
    const next = applyCreatureReward(s, 0, { water: 20 });
    expect(next.stats.water).toBe(100);
  });
});

describe('applyCreaturePenalty', () => {
  it('스탯 감소', () => {
    const s = makeState({ stats: { water: 50, sunlight: 80, health: 50 } });
    const next = applyCreaturePenalty(s, { health: -8 });
    expect(next.stats.health).toBe(42);
  });

  it('스탯 0 하한선 적용', () => {
    const s = makeState({ stats: { water: 50, sunlight: 80, health: 3 } });
    const next = applyCreaturePenalty(s, { health: -10 });
    expect(next.stats.health).toBe(0);
  });
});

// ── getAllMissionIds ───────────────────────────────────────────────────────────

describe('getAllMissionIds', () => {
  it('총 12개 슬롯 ID 반환', () => {
    const tsm = { morning: ['a', 'b', 'c'], afternoon: ['d', 'e', 'f'], evening: ['g', 'h', 'i'], night: ['j', 'k', 'l'] };
    const ids = getAllMissionIds(tsm);
    expect(ids).toHaveLength(12);
  });

  it('슬롯 prefix 포함', () => {
    const tsm = { morning: ['water'], afternoon: [], evening: [], night: [] };
    const ids = getAllMissionIds(tsm);
    expect(ids).toContain('morning_water');
  });
});
