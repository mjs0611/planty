"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button, Toast } from "@toss/tds-mobile";
import { PlantState, GrowthEvent } from "@/types/plant";
import {
  loadState, saveState, completeMission, applyAdBoost, applyMiniWatering,
  applyMoodInteract, claimLoginBonus, graduatePlant, resetPlant,
  STAGE_INFO, isAdAvailable, getAllMissionIds,
  checkStreakMilestone, applyStreakMilestone,
  applyCreatureReward, applyCreaturePenalty, applyComboBonus,
} from "@/lib/plantState";
import { getMissionById, parseSlotId } from "@/lib/missions";
import { haptic, logEvent } from "@/lib/bridge";
import { getCurrentSeason, SEASON_INFO, PLANT_TYPE_INFO } from "@/lib/season";
import { ONBOARDED_KEY, COMBO_MILESTONES } from "@/lib/constants";
import { useToast } from "@/hooks/useToast";
import { useCreatureSpawner } from "@/hooks/useCreatureSpawner";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";
import PlantDisplay from "@/components/PlantDisplay";
import StatBar from "@/components/StatBar";
import AdButton from "@/components/AdButton";
import ShareSheet from "@/components/ShareSheet";
import BannerAd from "@/components/BannerAd";
import Splash from "@/components/Splash";
import Onboarding from "@/components/Onboarding";
import WeatherBanner from "@/components/WeatherBanner";
import PlantMood from "@/components/PlantMood";
import MiniWatering from "@/components/MiniWatering";
import TimeSlotMissions from "@/components/TimeSlotMissions";
import GrowthEventPopup from "@/components/GrowthEventPopup";
import GardenView from "@/components/GardenView";
import FloatingCreature, { Creature } from "@/components/FloatingCreature";
import PestAdModal from "@/components/PestAdModal";
import { useTheme } from "@/lib/theme";

export default function HomePage() {
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'garden'>('home');
  const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
  const { theme, toggle } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(true);
  const [creature, setCreature] = useState<Creature | null>(null);
  const [showPestModal, setShowPestModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [milestone, setMilestone] = useState<{ streak: number; bonusXp: number } | null>(null);
  const triggeredCombosRef = useRef<Set<number>>(new Set());

  // 최신 값을 핸들러에서 참조하기 위한 refs (stale closure 방지)
  const plantRef = useRef<PlantState | null>(null);
  const creatureRef = useRef<Creature | null>(null);
  useEffect(() => { plantRef.current = plant; }, [plant]);
  useEffect(() => { creatureRef.current = creature; }, [creature]);

  const season = getCurrentSeason();
  const seasonInfo = SEASON_INFO[season];

  const { toast, openToast } = useToast();
  useDebouncedSave(plant);

  const triggerLevelUp = useCallback((newStage: PlantState["stage"]) => {
    setJustLeveledUp(true);
    haptic("confetti");
    openToast(`🎊 ${STAGE_INFO[newStage].name}으로 레벨 업!`);
    setTimeout(() => setJustLeveledUp(false), 2500);
  }, [openToast]);

  useEffect(() => {
    const isOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
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

    setPlant(finalState);
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
    localStorage.setItem(ONBOARDED_KEY, "true");
    setOnboarded(true);
    if (plantName) {
      setPlant(prev => prev ? { ...prev, name: plantName } : prev);
    }
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { graniteEvent } = await import("@apps-in-toss/web-framework");
        const sub = graniteEvent.addEventListener("backEvent", {
          onEvent: () => {
            if (activeTab === 'garden') { setActiveTab('home'); return; }
            setShowShare(prev => (prev ? false : prev));
          },
        });
        cleanup = sub;
      } catch { /* 앱 외부 */ }
    })();
    return () => cleanup?.();
  }, [activeTab]);

  const handleMissionComplete = useCallback((slotId: string) => {
    const plant = plantRef.current;
    if (!plant) return;
    const { missionId } = parseSlotId(slotId);
    const mission = getMissionById(missionId);
    if (!mission) return;

    const prevStage = plant.stage;
    const result = completeMission(plant, slotId, mission.statEffect, mission.xpReward);
    const { state: newState, luckyBonus, weatherBonus, xpGained, growthEvent: evt } = result;

    if (newState.stage !== prevStage) {
      triggerLevelUp(newState.stage);
      logEvent("level_up", { from: prevStage, to: newState.stage });
    } else if (luckyBonus && weatherBonus) {
      haptic("confetti");
      openToast(`🍀⛅ 행운 + 날씨 보너스! +${xpGained} XP`);
    } else if (luckyBonus) {
      haptic("confetti");
      openToast(`🍀 행운! ${mission.emoji} 2배 XP +${xpGained}`);
    } else if (weatherBonus) {
      haptic("success");
      openToast(`⛅ 날씨 보너스! ${mission.emoji} +${xpGained} XP`);
    } else {
      haptic("success");
      openToast(`${mission.emoji} ${mission.label} 완료! +${xpGained} XP`);
    }

    if (evt) setTimeout(() => setGrowthEvent(evt), 600);

    const ms = checkStreakMilestone(newState);
    let finalState = newState;
    if (ms) {
      finalState = applyStreakMilestone(newState, ms.bonusXp);
      setTimeout(() => setMilestone({ streak: ms.milestone, bonusXp: ms.bonusXp }), 800);
    }

    logEvent("mission_complete", { mission_id: missionId, xp_gained: xpGained, lucky_bonus: luckyBonus });
    setPlant(finalState);
  }, [openToast, triggerLevelUp]);

  const handleAdComplete = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const { state: newState, xpGained } = applyAdBoost(plant);
    const leveledUp = newState.stage !== plant.stage;
    setPlant(newState);
    if (leveledUp) triggerLevelUp(newState.stage);
    else { haptic("success"); openToast(`📺 광고 보상! 성장 XP +${xpGained}`); }
    logEvent("ad_rewarded", { stage: plant.stage });
  }, [openToast, triggerLevelUp]);

  const handleMiniWater = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const result = applyMiniWatering(plant);
    if (!result) return;
    haptic("success");
    openToast("💧 물을 줬어요! +5 XP");
    setPlant(result.state);
  }, [openToast]);

  const handleMoodInteract = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const result = applyMoodInteract(plant);
    if (!result) return;
    haptic("success");
    openToast("💚 말을 걸었어요! +3 XP");
    setPlant(result.state);
  }, [openToast]);

  const handleGraduate = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const newState = graduatePlant(plant);
    const typeInfo = PLANT_TYPE_INFO[newState.plantType];
    haptic("confetti");
    openToast(`🎓 졸업! 새 식물 "${typeInfo.name}" 시작!`);
    logEvent("plant_graduate", { from_type: plant.plantType, to_type: newState.plantType, garden_count: newState.garden.length });
    triggeredCombosRef.current.clear();
    setPlant(newState);
  }, [openToast]);

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
    setPlant(newState);
  }, [openToast, triggerLevelUp]);

  const handleReset = useCallback(() => {
    const plant = plantRef.current;
    if (!plant?.isDead) return;
    logEvent("plant_reset", { prev_stage: plant.stage });
    triggeredCombosRef.current.clear();
    setPlant(resetPlant());
  }, []);

  const handleSaveName = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const trimmed = nameInput.trim().slice(0, 12);
    setPlant({ ...plant, name: trimmed || undefined });
    setEditingName(false);
  }, [nameInput]);

  const handleCreatureResult = useCallback((caught: boolean, skipPenalty = false) => {
    const plant = plantRef.current;
    const creature = creatureRef.current;
    if (!plant || !creature) { setCreature(null); setShowPestModal(false); return; }
    if (caught) {
      const newState = applyCreatureReward(plant, creature.xpReward, creature.statEffect);
      const leveledUp = newState.stage !== plant.stage;
      setPlant(newState);
      if (leveledUp) triggerLevelUp(newState.stage);
      else {
        haptic("success");
        const desc = creature.statEffect?.health ? ' 💚+5' : creature.statEffect?.sunlight ? ' ☀️+5' : '';
        openToast(`${creature.emoji} ${creature.label} 잡았어요!${desc} +${creature.xpReward} XP`);
      }
    } else if (!skipPenalty && creature.isPest && creature.penalty) {
      const newState = applyCreaturePenalty(plant, creature.penalty);
      setPlant(newState);
      haptic("error");
      openToast(`🐛 해충이 식물을 갉아먹었어요! 건강 -8`);
    }
    setCreature(null);
    setShowPestModal(false);
  }, [openToast, triggerLevelUp]);

  const handleCreatureSpawn = useCallback((c: Creature) => setCreature(c), []);
  useCreatureSpawner({
    isActive: activeTab === 'home' && !!plant,
    isDead: plant?.isDead ?? false,
    creature,
    onSpawn: handleCreatureSpawn,
  });

  // ── Render guards ───────────────────────────────────────────
  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;
  if (!onboarded) return <Onboarding onStart={handleOnboardingStart} />;
  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    );
  }

  const { totalCompleted, total } = useMemo(() => {
    const allMissionIds = getAllMissionIds(plant.timeSlotMissions);
    return {
      totalCompleted: allMissionIds.filter(id => plant.completedMissions.includes(id)).length,
      total: allMissionIds.length,
    };
  }, [plant.timeSlotMissions, plant.completedMissions]);

  const adAvailable = useMemo(() => isAdAvailable(plant), [plant.adLastWatched]);

  const streakBadge = useMemo(() =>
    plant.streak >= 30 ? "🏆 월간 마스터" :
    plant.streak >= 7  ? "⭐ 주간 달성"   : null,
  [plant.streak]);

  return (
    <div className="min-h-screen nature-page pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold whitespace-nowrap">플랜티</span>
            <span>🌿</span>
            {plant.name && (
              <button
                onClick={() => { setNameInput(plant.name ?? ''); setEditingName(true); }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium ml-1 truncate max-w-[80px]"
              >
                &quot;{plant.name}&quot;
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <span className="text-orange-500 font-semibold text-xs whitespace-nowrap">🔥 {plant.streak}일 연속</span>
            {plant.streakShields > 0 && (
              <span
                title="스트릭 실드: 하루 빠져도 연속 기록을 지켜줘요"
                className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full whitespace-nowrap cursor-help"
              >
                🛡 실드×{plant.streakShields}
              </span>
            )}
            {streakBadge && (
              <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                {streakBadge}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button onClick={() => { setShowShare(true); logEvent("share_open", { stage: plant.stage }); }} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors whitespace-nowrap">공유</button>
          <button onClick={toggle} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors whitespace-nowrap">{theme === "dark" ? "라이트" : "다크"}</button>
        </div>
      </div>

      {/* Garden Tab */}
      {activeTab === 'garden' && (
        <GardenView garden={plant.garden} currentType={plant.plantType} />
      )}

      {/* Home Tab */}
      {activeTab === 'home' && <>

      {/* Stage badge + Season */}
      <div className="px-4 mt-1 flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{STAGE_INFO[plant.stage].name}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{plant.totalDaysAlive}일째</span>
        </div>
        <div className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full px-2.5 py-1 shadow-sm">
          <span className="text-xs">{seasonInfo.emoji}</span>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{seasonInfo.desc}</span>
        </div>
      </div>

      {/* Weather */}
      <WeatherBanner />

      {/* Plant */}
      <div className="mx-4 mt-3 bg-gradient-to-b from-[#EAF5EE] to-white dark:from-emerald-900/30 dark:to-[#09100D] rounded-3xl relative overflow-hidden border border-emerald-100/80 dark:border-emerald-800/20 shadow-sm">
        {creature && (
          <FloatingCreature
            creature={creature}
            onTap={handleCreatureResult}
            onPestTap={() => setShowPestModal(true)}
          />
        )}
        {!plant.name && !plant.isDead && (
          <button
            onClick={() => { setNameInput(''); setEditingName(true); }}
            className="absolute top-3 right-3 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/50 px-2 py-1 rounded-full font-medium z-10"
          >
            ✏️ 이름 짓기
          </button>
        )}
        <PlantDisplay
          stage={plant.stage}
          plantType={plant.plantType}
          isWilting={plant.isWilting}
          isDead={plant.isDead}
          xp={plant.xp}
          xpRequired={plant.xpRequired}
          justLeveledUp={justLeveledUp}
          onGraduate={plant.stage === 'special' ? handleGraduate : undefined}
          onComboTap={handleComboTap}
        />
        <div className="pb-3">
          <PlantMood plant={plant} completedToday={totalCompleted} onInteract={handleMoodInteract} />
        </div>
        {plant.isDead && (
          <div className="px-4 pb-4">
            <Button display="full" color="dark" size="large" onClick={handleReset}>새 씨앗 심기 🌱</Button>
          </div>
        )}
      </div>

      {/* Wilting */}
      {plant.isWilting && !plant.isDead && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">⚠️ 식물이 힘들어요! 빨리 돌봐주세요.</p>
        </div>
      )}

      {/* Stats */}
      {!plant.isDead && (
        <div className="mx-4 mt-3 glass-panel rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
            <span>✨</span> 식물 상태
          </h2>
          <div className="space-y-4 pt-1">
            <StatBar emoji="💧" label="수분" value={plant.stats.water} color="#3B82F6" />
            <StatBar emoji="☀️" label="햇빛" value={plant.stats.sunlight} color="#F59E0B" />
            <StatBar emoji="💚" label="건강" value={plant.stats.health} color="#10B981" />
          </div>
        </div>
      )}

      {/* Mini Watering */}
      {!plant.isDead && (
        <div className="mx-4 mt-3">
          <MiniWatering plant={plant} onWater={handleMiniWater} />
        </div>
      )}

      {/* Missions */}
      {!plant.isDead && (
        <TimeSlotMissions
          timeSlotMissions={plant.timeSlotMissions}
          completedMissions={plant.completedMissions}
          onComplete={handleMissionComplete}
          totalCompleted={totalCompleted}
          total={total}
        />
      )}

      {/* Ads */}
      {!plant.isDead && (
        <div className="mx-4 mt-3"><BannerAd /></div>
      )}
      {!plant.isDead && (
        <div className="mx-4 mt-2">
          <AdButton onAdComplete={handleAdComplete} adAvailable={adAvailable} />
        </div>
      )}

      {/* End Home Tab */}
      </>}

      <Toast position="bottom" open={toast.open} text={toast.message} />
      <GrowthEventPopup event={growthEvent} onDismiss={() => setGrowthEvent(null)} />
      {showShare && <ShareSheet plant={plant} onClose={() => setShowShare(false)} />}

      {/* 해충 광고 모달 */}
      {showPestModal && (
        <PestAdModal
          onCatch={() => handleCreatureResult(true)}
          onClose={() => handleCreatureResult(false, true)}
        />
      )}

      {/* 스트릭 마일스톤 팝업 */}
      {milestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setMilestone(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 mx-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-3">
              {milestone.streak >= 30 ? '🏆' : milestone.streak >= 14 ? '🌟' : milestone.streak >= 7 ? '⭐' : '🎉'}
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {milestone.streak}일 연속 달성!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              꾸준히 돌봐줘서 고마워요 💚
            </p>
            <p className="text-lg font-bold text-emerald-500">+{milestone.bonusXp} XP 보너스!</p>
            <button
              className="mt-5 w-full py-3 bg-emerald-500 text-white font-bold rounded-2xl"
              onClick={() => setMilestone(null)}
            >
              계속 키우기 🌱
            </button>
          </div>
        </div>
      )}

      {/* 이름 편집 모달 */}
      {editingName && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setEditingName(false)}>
          <div className="w-full bg-white dark:bg-gray-900 rounded-t-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
            <p className="text-lg font-bold text-gray-800 dark:text-white mb-1">내 식물 이름 짓기 🌿</p>
            <p className="text-xs text-gray-400 mb-4">최대 12자</p>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="예: 봄이, 초록이, 미미..."
              maxLength={12}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold" onClick={() => setEditingName(false)}>취소</button>
              <button className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-bold" onClick={handleSaveName}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Nav */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-white/80 dark:bg-[#09100D]/90 backdrop-blur-xl border border-white/30 dark:border-emerald-500/20 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-40 px-2 py-1.5 capsule-nav">
        <div className="flex justify-around items-center h-12">
          {([
            { id: 'home', label: '홈', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H15v-5.25H9V21H3V9.75z" />
              </svg>
            )},
            { id: 'garden', label: '정원', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7 3 3 7.5 3 12c4 0 7-2 9-5 2 3 5 5 9 5 0-4.5-4-9-9-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13M9 21h6" />
              </svg>
            )},
          ] as const).map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex-1 flex flex-col items-center justify-center h-full text-[11px] font-bold tracking-wide transition-all duration-300 rounded-full gap-0.5 ${
                  active
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/40'
                    : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-600'
                }`}
              >
                {active && (
                  <span className="absolute -top-1 w-8 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-b-full shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                )}
                {icon}
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
