"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button, Toast } from "@toss/tds-mobile";
import { PlantState, GrowthEvent } from "@/types/plant";
import {
  loadState, completeMission, applyAdBoost, applyMiniWatering,
  claimLoginBonus, graduatePlant, recoverPlant, saveState,
  STAGE_INFO, isAdAvailable, getAllMissionIds, getPlantAdOwnerKey,
  checkStreakMilestone, applyStreakMilestone,
  applyCreatureReward, applyCreaturePenalty, applyComboBonus,
  applyTapStatBoost,
  getGrowthFeedback, getGardenSummary, getPlantImage, type GrowthFeedback,
} from "@/lib/plantState";
import { getMissionById, parseSlotId } from "@/lib/missions";
import { haptic, logEvent } from "@/lib/bridge";
import { PLANT_TYPE_INFO, getCurrentSeason, SEASON_INFO } from "@/lib/season";
import { getCurrentWeather, WEATHER_INFO } from "@/lib/weather";
import { ONBOARDED_KEY, COMBO_MILESTONES } from "@/lib/constants";
import { useToast } from "@/hooks/useToast";
import { useCreatureSpawner } from "@/hooks/useCreatureSpawner";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";
import PlantDisplay from "@/components/PlantDisplay";
import AdButton from "@/components/AdButton";
import ShareSheet from "@/components/ShareSheet";
import BannerAd from "@/components/BannerAd";
import Splash from "@/components/Splash";
import Onboarding, { onboardingBack } from "@/components/Onboarding";
import { installHistoryBack } from "@/lib/historyBack";
import { installCardTilt } from "@/lib/cardTilt";
import PlantMood from "@/components/PlantMood";
import MiniWatering from "@/components/MiniWatering";
import TimeSlotMissions from "@/components/TimeSlotMissions";
import GrowthEventPopup from "@/components/GrowthEventPopup";
import GardenView from "@/components/GardenView";
import FloatingCreature, { Creature } from "@/components/FloatingCreature";
import PestModal from "@/components/PestModal";
import ProfilePage from "@/components/ProfilePage";
import GrowthProgress from "@/components/GrowthProgress";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type AppTab = 'home' | 'garden' | 'profile';

// Render the current value immediately, then animate care-driven changes.
function HeroXpBar({ xp, xpRequired }: { xp: number; xpRequired: number }) {
  return (
    <div role="progressbar" aria-label="성장 XP" aria-valuemin={0} aria-valuemax={xpRequired} aria-valuenow={xp}
      className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--toss-surface-high)" }}>
      <div
        className="progress-fill h-full rounded-full"
        style={{
          transform: `scaleX(${Math.min(xp / xpRequired, 1)})`,
          background: "var(--primary)",
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [careFeedback, setCareFeedback] = useState<GrowthFeedback | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'garden' || tab === 'profile') return tab;
    }
    return 'home';
  });
  const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
  const activeTabRef = useRef(activeTab);
  const tabHistoryRef = useRef<AppTab[]>(
    typeof window !== 'undefined' && Array.isArray(window.history.state?.__plantyTabHistory)
      ? window.history.state.__plantyTabHistory.filter((tab: unknown): tab is AppTab => tab === 'home' || tab === 'garden' || tab === 'profile')
      : []
  );
  const navigateTab = useCallback((tab: AppTab, remember = true) => {
    if (tab === activeTabRef.current) return;
    if (remember) tabHistoryRef.current.push(activeTabRef.current);
    activeTabRef.current = tab;
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'home') url.searchParams.delete('tab');
    else url.searchParams.set('tab', tab);
    // 약관/개인정보 화면에서 돌아올 때 직전 탭을 복원한다. Next의 history.state는 보존한다.
    window.history.replaceState({ ...window.history.state, __plantyTabHistory: [...tabHistoryRef.current] }, '', url);
    window.scrollTo(0, 0);
  }, []);
  const [onboarded, setOnboarded] = useState(true);
  const [creature, setCreature] = useState<Creature | null>(null);
  const [showPestModal, setShowPestModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [milestone, setMilestone] = useState<{ streak: number; bonusXp: number } | null>(null);
  const triggeredCombosRef = useRef<Set<number>>(new Set());
  const missionBackRef = useRef<(() => boolean) | null>(null);
  const adBackRef = useRef<(() => void) | null>(null);
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const registerAdBack = useCallback((close: () => void) => {
    adBackRef.current = close;
    setAdDialogOpen(true);
    return () => {
      if (adBackRef.current !== close) return;
      adBackRef.current = null;
      setAdDialogOpen(false);
    };
  }, []);
  useEffect(() => { if (activeTab !== 'home') adBackRef.current?.(); }, [activeTab]);
  const nameDialogRef = useDialogFocus(editingName && onboarded && !!plant && !milestone && !adDialogOpen && !showShare && !showPestModal, () => setEditingName(false));
  const milestoneDialogRef = useDialogFocus(!!milestone && onboarded && !!plant && !adDialogOpen && !showShare && !showPestModal, () => setMilestone(null));

  // 최신 값을 핸들러에서 참조하기 위한 refs (stale closure 방지)
  const plantRef = useRef<PlantState | null>(null);
  const creatureRef = useRef<Creature | null>(null);
  useEffect(() => { plantRef.current = plant; }, [plant]);
  useEffect(() => { creatureRef.current = creature; }, [creature]);

const { toast, openToast } = useToast();
  const { saveFailed, retrySave } = useDebouncedSave(plant);

  const triggerLevelUp = useCallback((newStage: PlantState["stage"]) => {
    setJustLeveledUp(true);
    haptic("confetti");
    openToast(`🎊 ${STAGE_INFO[newStage].name}으로 레벨 업!`);
    setTimeout(() => setJustLeveledUp(false), 2500);
  }, [openToast]);

  // Synchronous ownership keeps care, combo XP and rapid taps from overwriting one another.
  const commitPlant = useCallback((next: PlantState, source?: string) => {
    const before = plantRef.current;
    plantRef.current = next;
    setPlant(next);
    if (source && before) {
      const feedback = getGrowthFeedback(before, next, source);
      if (feedback) setCareFeedback(feedback);
    }
  }, []);

  useEffect(() => {
    let isOnboarded = false;
    try { isOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true"; } catch { /* Core care remains available without storage. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser storage after hydration.
    setOnboarded(isOnboarded);
    const { state, shieldConsumed } = loadState();
    const bonusResult = claimLoginBonus(state);
    let finalState = bonusResult ? bonusResult.state : state;

    // 마일스톤 체크
    const ms = checkStreakMilestone(finalState);
    if (ms) {
      finalState = applyStreakMilestone(finalState, ms.bonusXp);
      setTimeout(() => setMilestone({ streak: ms.milestone, bonusXp: ms.bonusXp }), 2500);
    }

    plantRef.current = state;
    commitPlant(finalState, '접속 보너스');
    if (shieldConsumed) {
      setTimeout(() => openToast(`🛡 스트릭 실드를 사용했어요! 연속 기록이 유지됐습니다`), 1000);
    }
    if (bonusResult) {
      setTimeout(() => openToast(`🎁 오늘의 접속 보너스 +${bonusResult.bonusXp} XP`), shieldConsumed ? 4000 : 2000);
    }
    logEvent("screen_view", { screen: "home", stage: state.stage, streak: state.streak });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingStart = useCallback((plantName?: string) => {
    try { localStorage.setItem(ONBOARDED_KEY, "true"); } catch { /* The save status explains persistence limits. */ }
    setOnboarded(true);
    const current = plantRef.current;
    if (current) commitPlant({ ...current, ...(plantName ? { name: plantName } : {}) });
  }, [commitPlant]);

  // 토스 뒤로가기(히스토리 방식): 온보딩 단계 → 팝업 → 미션 모달 → 탭 → 홈에서만 미니앱 종료
  const historyBackRef = useRef<() => boolean>(() => false);
  useEffect(() => { historyBackRef.current = () => {
    if (!onboarded) return onboardingBack?.() ?? false;
    if (adBackRef.current) { adBackRef.current(); return true; }
    if (milestone) { setMilestone(null); return true; }
    if (showPestModal) { creatureRef.current = null; setCreature(null); setShowPestModal(false); return true; }
    if (editingName) { setEditingName(false); return true; }
    if (showShare) { setShowShare(false); return true; }
    if (missionBackRef.current?.()) return true; // 미션 인터랙션 모달
    const previousTab = tabHistoryRef.current.pop();
    if (previousTab) { navigateTab(previousTab, false); return true; }
    if (activeTab === 'garden' || activeTab === 'profile') { navigateTab('home', false); return true; }
    return false;
  }; }, [onboarded, milestone, showPestModal, editingName, showShare, activeTab, navigateTab]);
  useEffect(() => installHistoryBack(() => historyBackRef.current()), []);
  // 홈 카드를 누르면 손가락 쪽으로 기운다. 식물 쓰다듬기·벌레 잡기는 제외(data-no-tilt).
  useEffect(() => installCardTilt('.home-hero, .home-garden-link'), []);

  const handleMissionComplete = useCallback((slotId: string) => {
    const plant = plantRef.current;
    if (!plant) return;
    const { missionId } = parseSlotId(slotId);
    const mission = getMissionById(missionId);
    if (!mission) return;

    const prevStage = plant.stage;
    const result = completeMission(plant, slotId, mission.statEffect, mission.xpReward);
    const { state: newState, luckyBonus, weatherBonus, shieldBonus, xpGained, growthEvent: evt } = result;
    if (newState === plant) return;
    const shieldTag = shieldBonus ? " 🛡" : "";

    if (newState.stage !== prevStage) {
      triggerLevelUp(newState.stage);
      logEvent("level_up", { from: prevStage, to: newState.stage });
    } else if (luckyBonus && weatherBonus) {
      haptic("confetti");
      openToast(`🍀⛅ 행운 + 날씨 보너스! +${xpGained} XP${shieldTag}`);
    } else if (luckyBonus) {
      haptic("confetti");
      openToast(`🍀 행운! ${mission.emoji} 2배 XP +${xpGained}${shieldTag}`);
    } else if (weatherBonus) {
      haptic("success");
      openToast(`⛅ 날씨 보너스! ${mission.emoji} +${xpGained} XP${shieldTag}`);
    } else {
      haptic("success");
      openToast(`${mission.emoji} ${mission.label} 완료! +${xpGained} XP${shieldTag}`);
    }

    if (evt) setTimeout(() => setGrowthEvent(evt), 600);

    const ms = checkStreakMilestone(newState);
    let finalState = newState;
    if (ms) {
      finalState = applyStreakMilestone(newState, ms.bonusXp);
      setTimeout(() => setMilestone({ streak: ms.milestone, bonusXp: ms.bonusXp }), 800);
    }

    logEvent("mission_complete", { mission_id: missionId, xp_gained: xpGained, lucky_bonus: luckyBonus });
    commitPlant(finalState, '미션 돌봄');
  }, [openToast, triggerLevelUp, commitPlant]);

  const getAdOwnerKey = useCallback(() => getPlantAdOwnerKey(plantRef.current), []);
  const canReceiveGrowthAdReward = useCallback(() => {
    const plant = plantRef.current;
    return !!plant && !plant.isDead && isAdAvailable(plant);
  }, []);
  const isGrowthAdEligible = useCallback(() => {
    const plant = plantRef.current;
    const weather = getCurrentWeather();
    return !!plant && !plant.isDead && isAdAvailable(plant) && !['cloudy', 'rainy', 'moonlight'].includes(weather);
  }, []);
  const handleAdComplete = useCallback((ownerKey: string) => {
    const plant = plantRef.current;
    if (!plant || getPlantAdOwnerKey(plant) !== ownerKey || !canReceiveGrowthAdReward()) return false;
    const { state: newState, xpGained } = applyAdBoost(plant);
    if (xpGained === 0) return false;
    const leveledUp = newState.stage !== plant.stage;
    commitPlant(newState, '광고 보상');
    if (leveledUp) triggerLevelUp(newState.stage);
    else { haptic("success"); openToast(`📺 광고 보상! 성장 XP +${xpGained}`); }
    logEvent("ad_rewarded", { stage: plant.stage });
    return true;
  }, [openToast, triggerLevelUp, canReceiveGrowthAdReward, commitPlant]);

  const handleMiniWater = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const result = applyMiniWatering(plant);
    if (!result) return;
    haptic("success");
    if (result.state.stage !== plant.stage) triggerLevelUp(result.state.stage);
    else openToast("💧 물을 줬어요! +10 XP");
    commitPlant(result.state, '물주기');
  }, [openToast, triggerLevelUp, commitPlant]);

  const handleTapStatBoost = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const { state: newState, gained } = applyTapStatBoost(plant);
    if (!gained) return;
    commitPlant(newState);
  }, [commitPlant]);

  const handleGraduate = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const newState = graduatePlant(plant);
    if (newState === plant) return;
    const typeInfo = PLANT_TYPE_INFO[newState.plantType];
    haptic("confetti");
    openToast(`🎓 졸업! 새 식물 "${typeInfo.name}" 시작!`);
    logEvent("plant_graduate", { from_type: plant.plantType, to_type: newState.plantType, garden_count: newState.garden.length });
    triggeredCombosRef.current.clear();
    setCareFeedback(null);
    commitPlant(newState);
    navigateTab('garden');
  }, [openToast, commitPlant, navigateTab]);

  const handleComboTap = useCallback((combo: number) => {
    const plant = plantRef.current;
    if (!plant || plant.isDead) return;
    const ms = COMBO_MILESTONES.find(m => m.combo === combo);
    if (!ms || triggeredCombosRef.current.has(combo)) return;
    triggeredCombosRef.current.add(combo);
    haptic(ms.hapticType);
    const newState = applyComboBonus(plant, ms.xp);
    if (newState.stage !== plant.stage) triggerLevelUp(newState.stage);
    else openToast(`${ms.message} +${ms.xp} XP`);
    commitPlant(newState, '식물 쓰다듬기');
  }, [openToast, triggerLevelUp, commitPlant]);

  const handleRecover = useCallback(() => {
    const plant = plantRef.current;
    if (!plant || (!plant.isDead && !plant.isWilting)) return;
    const recovered = recoverPlant(plant);
    plantRef.current = recovered; // Repeated taps before a render do not repeat recovery.
    saveState(recovered);
    commitPlant(recovered);
    haptic("success");
    openToast("다시 건강해졌어요. 이어서 키워봐요!");
    logEvent("plant_reset", { prev_stage: plant.stage, mode: "free_recovery", garden_count: plant.garden.length });
  }, [openToast, commitPlant]);

  const handleSaveName = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const trimmed = nameInput.trim().slice(0, 12);
    commitPlant({ ...plant, name: trimmed || undefined });
    setEditingName(false);
  }, [nameInput, commitPlant]);

  const handleCreatureResult = useCallback((caught: boolean, skipPenalty = false) => {
    const plant = plantRef.current;
    const creature = creatureRef.current;
    if (!plant || !creature) { creatureRef.current = null; setCreature(null); setShowPestModal(false); return; }
    creatureRef.current = null; // Consume this creature before any callbacks or re-render.
    if (caught) {
      const newState = applyCreatureReward(plant, creature.xpReward, creature.statEffect);
      const leveledUp = newState.stage !== plant.stage;
      commitPlant(newState, '정원 친구');
      if (leveledUp) triggerLevelUp(newState.stage);
      else {
        haptic("success");
        const desc = creature.statEffect?.health ? ' 💚+5' : creature.statEffect?.sunlight ? ' ☀️+5' : '';
        openToast(`${creature.emoji} ${creature.label} 잡았어요!${desc} +${creature.xpReward} XP`);
      }
    } else if (!skipPenalty && creature.isPest && creature.penalty) {
      const newState = applyCreaturePenalty(plant, creature.penalty);
      commitPlant(newState);
      haptic("error");
      openToast(`🐛 해충이 식물을 갉아먹었어요! 건강 -8`);
    }
    setCreature(null);
    setShowPestModal(false);
  }, [openToast, triggerLevelUp, commitPlant]);

  const handleCreatureSpawn = useCallback((c: Creature) => { creatureRef.current = c; setCreature(c); }, []);
  useCreatureSpawner({
    isActive: activeTab === 'home' && !!plant && !adDialogOpen && !showPestModal,
    isDead: plant?.isDead ?? false,
    creature,
    onSpawn: handleCreatureSpawn,
  });

  const { totalCompleted, total } = useMemo(() => {
    if (!plant) return { totalCompleted: 0, total: 0 };
    const allMissionIds = getAllMissionIds(plant.timeSlotMissions);
    return {
      totalCompleted: allMissionIds.filter(id => plant.completedMissions.includes(id)).length,
      total: allMissionIds.length,
    };
  }, [plant]);

  const adAvailable = useMemo(() => plant ? isAdAvailable(plant) : false, [plant]);

  const streakBadge = useMemo(() =>
    !plant ? null :
    plant.streak >= 30 ? "🏆 월간 마스터" :
    plant.streak >= 7  ? "⭐ 주간 달성"   : null,
  [plant]);

  const currentWeather = getCurrentWeather();
  const isPhotosynthesisDisabled = currentWeather === 'cloudy' || currentWeather === 'rainy' || currentWeather === 'moonlight';

  // ── Render guards ───────────────────────────────────────────
  if (!plant) return <Splash />;
  if (!onboarded) return <Onboarding onStart={handleOnboardingStart} plantType={plant?.plantType} />;

  return (
    <div className="min-h-screen nature-page app-shell">
      <section className="mx-4 pt-4" aria-label="식물 요약">
        <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1
            className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-black tracking-tight leading-tight"
            style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}
          >
            플랜티
            {plant.name && (
              <button
                onClick={() => { setNameInput(plant.name ?? ''); setEditingName(true); }}
                className="max-w-full text-left text-sm font-medium [overflow-wrap:anywhere]"
                style={{ color: "var(--toss-primary)" }}
              >
                &quot;{plant.name}&quot;
              </button>
            )}
          </h1>
        </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => { setShowShare(true); logEvent("share_open", { stage: plant.stage }); }}
              aria-label="공유 화면 열기"
              className="relative p-2 rounded-full transition-colors"
              style={{ color: "var(--toss-on-surface-variant)" }}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V3m-4 4 4-4 4 4M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
              </svg>
            </button>
          </div>
        </div>
        {/* streak / badges sub-row */}
        <div className="flex items-center gap-2 pb-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: "var(--color-warning)" }}>🔥 {plant.streak}일 연속</span>
          {plant.streakShields > 0 && (
            <span className="text-sm px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}
            >
              🛡 실드×{plant.streakShields}
            </span>
          )}
          {streakBadge && (
            <span className="text-sm px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "rgba(232,118,0,0.10)", color: "var(--color-warning)" }}
            >
              {streakBadge}
            </span>
          )}
        </div>
      </section>
      {saveFailed && (
        <section className="mx-4 mt-3 p-4 toss-card rounded-2xl" role="status" aria-label="기기 저장 안내">
          <p className="text-base font-semibold" style={{ color: "var(--toss-on-surface)" }}>기기에 기록을 저장하지 못했어요</p>
          <p className="text-sm mt-1 mb-3 leading-relaxed" style={{ color: "var(--toss-on-surface-variant)" }}>계속 돌볼 수 있지만, 앱을 닫으면 이번 변화가 사라질 수 있어요.</p>
          <Button display="full" color="light" size="large" onClick={() => retrySave()}>저장 다시 시도</Button>
        </section>
      )}

      {/* Garden Tab */}
      {activeTab === 'garden' && (
        <GardenView plant={plant} onCare={() => navigateTab('home')} />
      )}

      {/* Home Tab */}
      {activeTab === 'home' && <>

      {(plant.isDead || plant.isWilting) && (
        <section className="mx-4 mt-3 p-5 toss-card rounded-2xl" aria-labelledby="recovery-title">
          <h2 id="recovery-title" className="text-lg font-bold" style={{ color: "var(--toss-on-surface)" }}>다시 이어서 키워요</h2>
          <p className="text-base mt-2 mb-4 leading-relaxed" style={{ color: "var(--toss-on-surface-variant)" }}>식물의 성장과 정원 {plant.garden.length}그루는 그대로예요.</p>
          <Button display="full" color="primary" size="large" onClick={handleRecover}>무료로 다시 돌보기</Button>
          {plant.garden.length > 0 && <button className="mt-3 text-sm font-semibold" onClick={() => navigateTab('garden')} style={{ color: "var(--toss-primary)" }}>모아둔 정원 보기</button>}
        </section>
      )}

      {/* Environment Bar */}
      <div className="mx-4 mt-2 flex items-center justify-between rounded-full px-5 py-2 toss-card bg-opacity-60 backdrop-blur-md" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {(() => {
          const season = getCurrentSeason();
          const si = SEASON_INFO[season];
          const weather = getCurrentWeather();
          const wi = WEATHER_INFO[weather];
          return (
            <>
              <div className="flex flex-1 items-center justify-center gap-2">
                <span className="text-lg">{wi.emoji}</span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold" style={{ color: "var(--toss-on-surface-variant)" }}>오늘 날씨</span>
                  <span className="text-sm font-extrabold tracking-tight" style={{ color: "var(--toss-on-surface)" }}>{wi.name}</span>
                </div>
              </div>
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
              <div className="flex flex-1 items-center justify-center gap-2">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-sm font-bold" style={{ color: "var(--toss-on-surface-variant)" }}>현재 시즌</span>
                  <span className="text-sm font-extrabold tracking-tight" style={{ color: "var(--toss-secondary)" }}>{si.name} <span className="text-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 rounded px-1">+{si.xpMultiplier}x</span></span>
                </div>
                <span className="text-lg">{si.emoji}</span>
              </div>
            </>
          );
        })()}
      </div>

      {/* Hero Card */}
      <div
        className="home-hero mx-4 mt-3 toss-card rounded-3xl relative overflow-hidden"
        style={{ boxShadow: "0 4px 24px -4px rgba(0,78,203,0.06)" }}
      >
        {creature && (
          <FloatingCreature
            creature={creature}
            onTap={handleCreatureResult}
            onPestTap={() => setShowPestModal(true)}
          />
        )}
        {/* 식물 이름 + 상태 뱃지 */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-black px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}
            >
              {STAGE_INFO[plant.stage].name}
            </span>
            {plant.isWilting && !plant.isDead && (
              <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(186,26,26,0.08)", color: "var(--color-danger)" }}>
                ⚠️ 힘들어요
              </span>
            )}
          </div>
          <button
            className="max-w-full text-left text-sm font-medium [overflow-wrap:anywhere]"
            style={{ color: "var(--toss-primary)" }}
            onClick={() => { setNameInput(plant.name ?? ''); setEditingName(true); }}
          >
            {plant.name ? `"${plant.name}" ✏️` : "이름 짓기 ✏️"}
          </button>
        </div>
        {/* 단계 설명 */}
        <p className="text-center text-sm px-5 pt-0.5 pb-0" style={{ color: "var(--toss-on-surface-variant)" }}>
          {plant.isDead || plant.isWilting ? "쉬고 있던 식물을 다시 돌봐주세요" : STAGE_INFO[plant.stage].description}
        </p>

        {/* Name Display */}
        {plant.name && (
          <p className="text-center text-xl font-black mt-2 px-5 tracking-tight [overflow-wrap:anywhere]" style={{ color: "var(--toss-on-surface)" }}>
            {plant.name}
          </p>
        )}

        {/* 식물 캐릭터 (가운데 크게) */}
        <div className="relative flex justify-center pt-2 pb-0" data-no-tilt>
          <PlantDisplay
            stage={plant.stage}
            plantType={plant.plantType}
            isWilting={plant.isWilting}
            isDead={plant.isDead}
            xp={plant.xp}
            xpRequired={plant.xpRequired}
            justLeveledUp={justLeveledUp}
            onGraduate={plant.stage === 'special' && !plant.isDead ? handleGraduate : undefined}
            onComboTap={handleComboTap}
            onTapStatBoost={handleTapStatBoost}
          />
        </div>
        {!plant.isDead && <p className="text-sm text-center px-5" style={{ color: "var(--toss-on-surface-variant)" }}>식물을 눌러 쓰다듬어요</p>}
        {!plant.isDead && <div className="px-5 pt-4">
          <MiniWatering plant={plant} onWater={handleMiniWater} primary={plant.stage !== 'special' && !plant.isWilting} />
        </div>}
        <div className="px-5 pb-3">
          <GrowthProgress plant={plant} feedback={careFeedback} />
        </div>
        {/* XP bar */}
        {!plant.isDead && plant.stage !== 'special' && (
          <div className="px-5 pb-3">
            {/* The goal row above already states the remaining XP; the bar alone shows progress. */}
            <HeroXpBar xp={plant.xp} xpRequired={plant.xpRequired} />
          </div>
        )}

        {/* Stats row — 히어로 카드 내부 */}
        {!plant.isDead && (
          <div className="grid grid-cols-3 gap-2 px-4 pb-1">
            {[
              { emoji: "☀️", label: "햇빛", value: plant.stats.sunlight,
                display: plant.stats.sunlight >= 80 ? "최적" : plant.stats.sunlight >= 55 ? "좋음" : plant.stats.sunlight >= 30 ? "부족" : "위험" },
              { emoji: "💚", label: "건강", value: plant.stats.health, display: `${Math.round(plant.stats.health)}%` },
              { emoji: "💧", label: "수분", value: plant.stats.water,  display: `${Math.round(plant.stats.water)}%` },
            ].map(({ emoji, label, value, display }) => {
              const isCritical = value < 30;
              const isWarn = value >= 30 && value < 55;
              return (
                <div
                  key={label}
                  className="rounded-xl p-2 flex flex-col items-center gap-1 min-w-0"
                  style={{
                    backgroundColor: isCritical
                      ? "rgba(186,26,26,0.08)"
                      : isWarn
                      ? "rgba(232,118,0,0.07)"
                      : "var(--toss-surface-low)",
                  }}
                >
                  <p className="text-sm font-bold whitespace-nowrap" style={{ color: isCritical ? "var(--color-danger)" : isWarn ? "var(--color-warning)" : "var(--toss-on-surface-variant)" }}><span aria-hidden="true">{emoji} </span>{label}</p>
                  <p className="text-sm font-extrabold whitespace-nowrap" style={{ color: isCritical ? "var(--color-danger)" : isWarn ? "var(--color-warning)" : "var(--toss-on-surface)" }}>{display}</p>
                  {/* "위험" already says it; only percentages need the extra words. */}
                  {isCritical && display !== "위험" && <span className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--color-danger)" }}>돌봄 필요</span>}
                </div>
              );
            })}
          </div>
        )}



        {/* Mood */}
        <div className="px-5 mt-1">
          <PlantMood plant={plant} completedToday={totalCompleted} />
        </div>


      </div>

      <button className="home-garden-link mx-4 mt-3 toss-card rounded-2xl" onClick={() => navigateTab('garden')}>
        <div className="garden-miniatures" aria-hidden="true">
          {(plant.garden.length ? plant.garden.slice(-3).map(p => p.type) : [plant.plantType]).map((type, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={getPlantImage('special', type)} alt="" width={40} height={40} />
          ))}
        </div>
        <div className="min-w-0 text-left">
          <p className="font-bold">{plant.garden.length ? `정원 ${plant.garden.length}그루 · ${getGardenSummary(plant).collectedTypes}종` : '첫 황금 식물을 모아봐요'}</p>
          <p className="growth-detail">내 정원 보기 ›</p>
        </div>
      </button>

      {!plant.isDead && <div className="mx-4 mt-3">
        <AdButton onAdComplete={handleAdComplete} getOwnerKey={getAdOwnerKey} isEligible={isGrowthAdEligible} canReward={canReceiveGrowthAdReward}
          registerBack={registerAdBack} adAvailable={adAvailable} adLastWatched={plant.adLastWatched} weatherDisabled={isPhotosynthesisDisabled} />
      </div>}

      {/* Banner Ad (Moved up for better visibility) */}
      <div className="mx-4 mt-3 mb-1"><BannerAd /></div>

      {/* Missions */}
      {!plant.isDead && (
        <TimeSlotMissions
          timeSlotMissions={plant.timeSlotMissions}
          completedMissions={plant.completedMissions}
          onComplete={handleMissionComplete}
          totalCompleted={totalCompleted}
          total={total}
          backRef={missionBackRef}
        />
      )}

      {/* End Home Tab */}
      </>}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <ProfilePage
          plant={plant}
          onRecover={handleRecover}
        />
      )}

      <Toast position="bottom" open={toast.open} text={toast.message} />
      <GrowthEventPopup event={growthEvent} onDismiss={() => setGrowthEvent(null)} />
      {showShare && <ShareSheet plant={plant} onClose={() => setShowShare(false)} />}

      {/* 해충은 광고 없이 무료로 보냅니다. */}
      {showPestModal && (
        <PestModal
          onClose={() => handleCreatureResult(false, true)}
        />
      )}

      {/* 스트릭 마일스톤 팝업 */}
      {milestone && (
        <div className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setMilestone(null)}>
          <div
            ref={milestoneDialogRef} role="dialog" aria-modal="true" aria-labelledby="milestone-title" tabIndex={-1}
            className="dialog-panel toss-card rounded-3xl p-6 w-full max-w-sm max-h-[calc(100dvh-32px)] overflow-y-auto text-center"
            style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-6xl mb-3">
              {milestone.streak >= 30 ? '🏆' : milestone.streak >= 14 ? '🌟' : milestone.streak >= 7 ? '⭐' : '🎉'}
            </div>
            <p id="milestone-title" className="text-xl font-bold mb-1" style={{ color: "var(--toss-on-surface)" }}>
              {milestone.streak}일 연속 달성!
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--toss-on-surface-variant)" }}>
              꾸준히 돌봐줘서 고마워요 💚
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--toss-secondary)" }}>+{milestone.bonusXp} XP 보너스!</p>
            <button
              className="mt-5 w-full py-3 font-bold rounded-2xl text-white"
              style={{ background: "var(--primary)" }}
              onClick={() => setMilestone(null)}
            >
              계속 키우기 🌱
            </button>
          </div>
        </div>
      )}

      {/* 이름 편집 모달 */}
      {editingName && (
        <div className="dialog-backdrop fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setEditingName(false)}>
          <div
            ref={nameDialogRef} role="dialog" aria-modal="true" aria-labelledby="plant-name-title" tabIndex={-1}
            className="dialog-sheet w-full max-w-[430px] mx-auto toss-card rounded-t-3xl p-6 pb-8 max-h-[90dvh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="plant-name-title" className="text-lg font-bold mb-1" style={{ color: "var(--toss-on-surface)" }}>내 식물 이름 짓기 🌿</h2>
            <label htmlFor="plant-name" className="block text-sm mb-2">식물 이름</label>
            <p id="plant-name-hint" className="text-sm mb-4" style={{ color: "var(--toss-on-surface-variant)" }}>최대 12자</p>
            <input
              id="plant-name" aria-describedby="plant-name-hint" data-dialog-autofocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="예: 봄이, 초록이, 미미..."
              maxLength={12}
              className="w-full rounded-2xl px-4 py-3 text-base focus:outline-none"
              style={{
                backgroundColor: "var(--toss-surface-low)",
                color: "var(--toss-on-surface)",
                border: "none",
              }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveName(); }}
            />
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-3 rounded-2xl font-semibold"
                style={{ backgroundColor: "var(--toss-surface-low)", color: "var(--toss-on-surface-variant)" }}
                onClick={() => setEditingName(false)}
              >
                취소하기
              </button>
              <button
                className="flex-1 py-3 rounded-2xl font-bold text-white"
                style={{ background: "var(--primary)" }}
                onClick={handleSaveName}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Nav — floating pill */}
      <nav aria-label="주요 화면" className="bottom-navigation fixed left-0 right-0 px-4 max-w-[430px] mx-auto z-40">
        <div
          className="toss-nav-bg backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/5"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="flex justify-around items-center h-[60px] px-2">
            {([
              { id: 'home' as const, label: '홈', renderIcon: (active: boolean) => (
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H15v-5.25H9V21H3V9.75z" />
                </svg>
              )},
              { id: 'garden' as const, label: '정원', renderIcon: (active: boolean) => (
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 3 7.5 3 12c4 0 7-2 9-5 2 3 5 5 9 5 0-4.5-4-9-9-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13M9 21h6" />
                </svg>
              )},
              { id: 'profile' as const, label: '프로필', renderIcon: (active: boolean) => (
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )},
            ]).map(({ id, label, renderIcon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => navigateTab(id)}
                  className="w-full h-full flex flex-col items-center justify-center touch-manipulation"
                >
                  <div className={`flex flex-col items-center justify-center w-14 py-1 rounded-2xl transition-all duration-300 ${
                    active
                      ? "text-[var(--toss-primary)] bg-[rgba(0,78,203,0.08)]"
                      : "text-[var(--toss-on-surface-variant)]"
                  }`}>
                    {renderIcon(active)}
                    <span className={`text-sm leading-none tracking-tight ${active ? "font-bold" : "font-medium"}`}>
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
