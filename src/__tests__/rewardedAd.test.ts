import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRewardedAdSession, RewardedAdSdk } from '@/lib/rewardedAd';
import { applyAdBoost, getInitialState, getPlantAdOwnerKey, graduatePlant, isAdAvailable, recoverPlant } from '@/lib/plantState';
import { AD_COOLDOWN_MS, AD_XP_REWARD } from '@/lib/constants';

type Request = Parameters<RewardedAdSdk['loadAppsInTossAdMob']>[0];
const sessions: ReturnType<typeof createRewardedAdSession>[] = [];
let sequence = 0;
function fixture(groupId = `unit-group-${sequence++}`) {
  const loads: Request[] = []; const shows: Request[] = [];
  const loadCleanup = vi.fn(); const showCleanup = vi.fn();
  let loadSupported = true; let showSupported = true;
  const sdk: RewardedAdSdk = {
    loadAppsInTossAdMob: Object.assign(vi.fn((request: Request) => { loads.push(request); return loadCleanup; }), { isSupported: () => loadSupported }),
    showAppsInTossAdMob: Object.assign(vi.fn((request: Request) => { shows.push(request); return showCleanup; }), { isSupported: () => showSupported }),
  };
  let owner = 'plant-1'; let eligible = true; let rewardEligible = true;
  const reward = vi.fn(() => true); const status = vi.fn();
  const session = createRewardedAdSession({ groupId, sdk, getOwnerKey: () => owner, isEligible: () => eligible, canReward: () => rewardEligible, onReward: reward, onStatus: status });
  sessions.push(session);
  return { session, sdk, loads, shows, reward, status, loadCleanup, showCleanup,
    setOwner: (next: string) => { owner = next; }, setEligible: (next: boolean) => { eligible = next; },
    setRewardEligible: (next: boolean) => { rewardEligible = next; },
    setLoadSupport: (next: boolean) => { loadSupported = next; }, setShowSupport: (next: boolean) => { showSupported = next; },
    loaded: () => loads[0].onEvent({ type: 'loaded' }), event: (type: string) => shows[0].onEvent({ type }) };
}
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-05T12:00:00Z')); });
afterEach(() => { sessions.splice(0).forEach(session => session.cancel()); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('explicit rewarded-ad lifecycle', () => {
  it('mounting a controller neither loads nor shows; loaded alone never shows', () => {
    const f = fixture(); expect(f.loads).toHaveLength(0); expect(f.shows).toHaveLength(0);
    f.session.load(); f.session.show(); expect(f.shows).toHaveLength(0);
    f.loaded(); expect(f.session.getStatus().phase).toBe('ready'); expect(f.shows).toHaveLength(0);
    f.session.show(); f.session.show(); expect(f.shows).toHaveLength(1);
    expect(f.shows[0].options).toEqual(f.loads[0].options);
  });
  it('only the SDK reward event grants once, and keeps the group locked until dismissal', () => {
    const f = fixture('shared'); f.session.load(); f.loaded(); f.session.show();
    f.event('userEarnedReward'); f.event('userEarnedReward'); expect(f.reward).toHaveBeenCalledExactlyOnceWith('plant-1');
    const other = fixture('shared'); other.session.load(); expect(other.loads).toHaveLength(0); expect(other.session.getStatus().phase).toBe('busy');
    f.event('dismissed'); expect(f.session.getStatus()).toEqual({ phase: 'completed', rewardGranted: true });
    expect(f.showCleanup).toHaveBeenCalledTimes(1);
    const next = fixture('shared'); next.session.load(); expect(next.loads).toHaveLength(1);
  });
  it.each(['dismissed', 'failedToShow'])('%s without reward grants nothing and ignores late reward', type => {
    const f = fixture(); f.session.load(); f.loaded(); f.session.show(); f.event(type); f.event('userEarnedReward');
    expect(f.reward).not.toHaveBeenCalled(); expect(f.showCleanup).toHaveBeenCalledTimes(1);
  });
  it('load errors/late loaded cannot show; explicitly retrying requires a new session and choice', () => {
    const f = fixture('retry'); f.session.load(); f.loads[0].onError(new Error('mock')); f.loaded(); f.session.show();
    expect(f.shows).toHaveLength(0); expect(f.loadCleanup).toHaveBeenCalledTimes(1);
    const retry = fixture('retry'); retry.session.load(); retry.loaded(); expect(retry.shows).toHaveLength(0); retry.session.show(); expect(retry.shows).toHaveLength(1);
  });
  it('show errors/late reward do not grant', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.session.show(); f.shows[0].onError(new Error('mock')); f.event('userEarnedReward');
    expect(f.reward).not.toHaveBeenCalled(); expect(f.session.getStatus().phase).toBe('error'); expect(f.showCleanup).toHaveBeenCalledTimes(1);
  });
  it('cancel while loading ignores late loaded, releases the group, and cleans once', () => {
    const f = fixture('cancel'); f.session.load(); f.session.cancel(); f.session.cancel(); f.loaded(); f.session.show();
    expect(f.session.getStatus().phase).toBe('dismissed');
    expect(f.shows).toHaveLength(0); expect(f.loadCleanup).toHaveBeenCalledTimes(1);
    const next = fixture('cancel'); next.session.load(); expect(next.loads).toHaveLength(1);
  });
  it('cancel after readiness or watching never accepts late rewards', () => {
    const ready = fixture(); ready.session.load(); ready.loaded(); ready.session.cancel(); ready.session.show(); expect(ready.shows).toHaveLength(0);
    const watching = fixture(); watching.session.load(); watching.loaded(); watching.session.show(); watching.session.cancel(); watching.event('userEarnedReward');
    expect(watching.reward).not.toHaveBeenCalled(); expect(watching.showCleanup).toHaveBeenCalledTimes(1);
  });
  it('a cancelled session cannot start later', () => {
    const f = fixture(); f.session.cancel(); f.session.load(); expect(f.loads).toHaveLength(0);
  });
  it('loading timeout does not reward or auto-show on late loaded', () => {
    const f = fixture(); f.session.load(); vi.advanceTimersByTime(15000); f.loaded(); f.session.show();
    expect(f.session.getStatus().phase).toBe('error'); expect(f.shows).toHaveLength(0); expect(f.reward).not.toHaveBeenCalled();
  });
  it('watching has no arbitrary timer that completes or cancels an ad', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.session.show(); vi.advanceTimersByTime(600000);
    expect(f.session.getStatus().phase).toBe('watching'); expect(f.reward).not.toHaveBeenCalled();
  });
  it.each(['load', 'show'])('unsupported %s is truthful and never fakes rewards', method => {
    const f = fixture(); if (method === 'load') f.setLoadSupport(false); else f.setShowSupport(false);
    f.session.load(); vi.advanceTimersByTime(10000); expect(f.session.getStatus().phase).toBe('unsupported'); expect(f.loads).toHaveLength(0); expect(f.reward).not.toHaveBeenCalled();
  });
  it('checks show support again immediately before showing', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.setShowSupport(false); f.session.show(); expect(f.shows).toHaveLength(0);
  });
  it('owner changed while preparing cannot become ready', () => {
    const f = fixture(); f.session.load(); f.setOwner('plant-2'); f.loaded(); expect(f.session.getStatus().phase).toBe('ineligible'); expect(f.shows).toHaveLength(0);
  });
  it('owner changed after readiness cannot show', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.setOwner('plant-2'); f.session.show(); expect(f.shows).toHaveLength(0);
  });
  it('owner changed during watching cannot reward a different plant', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.session.show(); f.setOwner('plant-2'); f.event('userEarnedReward'); f.event('dismissed');
    expect(f.reward).not.toHaveBeenCalled(); expect(f.session.getStatus().phase).toBe('ineligible');
  });
  it('eligibility lost during watching denies reward; rejected parent reward is not marked completed', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.session.show(); f.setRewardEligible(false); f.event('userEarnedReward'); expect(f.reward).not.toHaveBeenCalled();
    const rejected = fixture(); rejected.reward.mockReturnValue(false); rejected.session.load(); rejected.loaded(); rejected.session.show(); rejected.event('userEarnedReward'); rejected.event('dismissed');
    expect(rejected.session.getStatus()).toEqual({ phase: 'ineligible', rewardGranted: false });
  });
  it('a weather/time boundary after explicit show does not remove an otherwise valid earned reward', () => {
    const f = fixture(); f.session.load(); f.loaded(); f.session.show(); f.setEligible(false); f.event('userEarnedReward'); f.event('dismissed');
    expect(f.reward).toHaveBeenCalledExactlyOnceWith('plant-1'); expect(f.session.getStatus().phase).toBe('completed');
  });
  it('cleans returned SDK handles even when callbacks run synchronously', () => {
    const f = fixture();
    f.sdk.loadAppsInTossAdMob = Object.assign((request: Request) => { request.onEvent({ type: 'loaded' }); return f.loadCleanup; }, { isSupported: () => true });
    f.sdk.showAppsInTossAdMob = Object.assign((request: Request) => { request.onEvent({ type: 'dismissed' }); return f.showCleanup; }, { isSupported: () => true });
    f.session.load(); f.session.show(); expect(f.loadCleanup).toHaveBeenCalledTimes(1); expect(f.showCleanup).toHaveBeenCalledTimes(1);
  });
  it('an SDK throw or reward handler throw releases the group without a second attempt', () => {
    const f = fixture('throw'); f.sdk.loadAppsInTossAdMob = Object.assign(() => { throw new Error('mock'); }, { isSupported: () => true }); f.session.load();
    const next = fixture('throw'); next.reward.mockImplementation(() => { throw new Error('mock reward'); }); next.session.load(); next.loaded(); next.session.show(); next.event('userEarnedReward'); next.event('userEarnedReward');
    expect(next.reward).toHaveBeenCalledTimes(1); expect(next.showCleanup).toHaveBeenCalledTimes(1);
  });
});

describe('plant reward guard and ownership', () => {
  it('grants the advertised XP once, then rejects duplicate calls inside the cooldown', () => {
    const plant = { ...getInitialState(), xp: 0 };
    const first = applyAdBoost(plant); expect(first.xpGained).toBe(AD_XP_REWARD);
    const repeated = applyAdBoost(first.state); expect(repeated.xpGained).toBe(0); expect(repeated.state).toBe(first.state);
  });
  it('re-enables at the exact cooldown boundary, not one millisecond earlier', () => {
    const first = applyAdBoost(getInitialState()); vi.advanceTimersByTime(AD_COOLDOWN_MS - 1);
    expect(isAdAvailable(first.state)).toBe(false); expect(applyAdBoost(first.state).xpGained).toBe(0);
    vi.advanceTimersByTime(1); expect(isAdAvailable(first.state)).toBe(true); expect(applyAdBoost(first.state).xpGained).toBe(AD_XP_REWARD);
  });
  it('dead plants cannot gain ad XP; free recovery preserves XP/name/garden/cooldown', () => {
    const plant = { ...getInitialState(), isDead: true, name: '초록이', xp: 12, adLastWatched: new Date().toISOString() };
    expect(applyAdBoost(plant)).toEqual({ state: plant, xpGained: 0 });
    const recovered = recoverPlant(plant); expect(recovered).toMatchObject({ name: plant.name, xp: plant.xp, garden: plant.garden, adLastWatched: plant.adLastWatched });
  });
  it('normal name/care changes retain ownership; graduation changes it even with the same plant type', () => {
    const plant = getInitialState(); const key = getPlantAdOwnerKey(plant);
    expect(getPlantAdOwnerKey({ ...plant, name: '새 이름', xp: 20 })).toBe(key);
    expect(getPlantAdOwnerKey(graduatePlant({ ...plant, stage: 'special' }))).not.toBe(key);
    expect(getPlantAdOwnerKey(null)).toBe('');
  });
});
