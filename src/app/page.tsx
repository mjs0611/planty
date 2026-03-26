"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Button, Toast } from "@toss/tds-mobile";
import { PlantState, GrowthEvent } from "@/types/plant";
import {
  loadState, completeMission, applyAdBoost, applyMiniWatering,
  claimLoginBonus, graduatePlant, resetPlant,
  STAGE_INFO, isAdAvailable, getAllMissionIds,
  checkStreakMilestone, applyStreakMilestone,
  applyCreatureReward, applyCreaturePenalty, applyComboBonus,
  applyTapStatBoost,
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
import Onboarding from "@/components/Onboarding";
import WeatherBanner from "@/components/WeatherBanner";
import PlantMood from "@/components/PlantMood";
import MiniWatering from "@/components/MiniWatering";
import TimeSlotMissions from "@/components/TimeSlotMissions";
import GrowthEventPopup from "@/components/GrowthEventPopup";
import GardenView from "@/components/GardenView";
import FloatingCreature, { Creature } from "@/components/FloatingCreature";
import PestAdModal from "@/components/PestAdModal";
import ProfilePage from "@/components/ProfilePage";
import { useTheme } from "@/lib/theme";

// XP bar with mount animation (Stitch 9)
function HeroXpBar({ xp, xpRequired }: { xp: number; xpRequired: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(Math.min((xp / xpRequired) * 100, 100)));
    return () => cancelAnimationFrame(id);
  }, [xp, xpRequired]);
  return (
    <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--toss-surface-high)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: "linear-gradient(to right, #004ecb, #0064ff)",
          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'garden' | 'profile'>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'garden' || tab === 'profile') return tab;
    }
    return 'home';
  });
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
    setPlant(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...(plantName ? { name: plantName } : {}),
      };
    });
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { graniteEvent } = await import("@apps-in-toss/web-framework");
        const sub = graniteEvent.addEventListener("backEvent", {
          onEvent: () => {
            if (activeTab === 'garden' || activeTab === 'profile') { setActiveTab('home'); return; }
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
    const { state: newState, luckyBonus, weatherBonus, shieldBonus, xpGained, growthEvent: evt } = result;
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
    openToast("💧 물을 줬어요! +10 XP");
    setPlant(result.state);
  }, [openToast]);

  const handleTapStatBoost = useCallback(() => {
    const plant = plantRef.current;
    if (!plant) return;
    const { state: newState, gained } = applyTapStatBoost(plant);
    if (!gained) return;
    setPlant(newState);
  }, []);

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

  const { totalCompleted, total } = useMemo(() => {
    if (!plant) return { totalCompleted: 0, total: 0 };
    const allMissionIds = getAllMissionIds(plant.timeSlotMissions);
    return {
      totalCompleted: allMissionIds.filter(id => plant.completedMissions.includes(id)).length,
      total: allMissionIds.length,
    };
  }, [plant?.timeSlotMissions, plant?.completedMissions]);

  const adAvailable = useMemo(() => plant ? isAdAvailable(plant) : false, [plant?.adLastWatched]);

  const streakBadge = useMemo(() =>
    !plant ? null :
    plant.streak >= 30 ? "🏆 월간 마스터" :
    plant.streak >= 7  ? "⭐ 주간 달성"   : null,
  [plant?.streak]);

  const currentWeather = getCurrentWeather();
  const isPhotosynthesisDisabled = currentWeather === 'cloudy' || currentWeather === 'rainy' || currentWeather === 'moonlight';

  // ── Render guards ───────────────────────────────────────────
  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;
  if (!onboarded) return <Onboarding onStart={handleOnboardingStart} plantType={plant?.plantType} />;
  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nature-page pb-32">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto z-50 toss-nav-bg backdrop-blur-xl"
        style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}
      >
        <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2">
          <h1
            className="text-xl font-black tracking-tight"
            style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}
          >
            플랜티
            {plant.name && (
              <button
                onClick={() => { setNameInput(plant.name ?? ''); setEditingName(true); }}
                className="text-sm font-medium ml-2"
                style={{ color: "var(--toss-primary)" }}
              >
                &quot;{plant.name}&quot;
              </button>
            )}
          </h1>
        </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="p-2 rounded-full transition-colors"
              style={{ color: "var(--toss-on-surface-variant)" }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => { setShowShare(true); logEvent("share_open", { stage: plant.stage }); }}
              className="relative p-2 rounded-full transition-colors"
              style={{ color: "var(--toss-on-surface-variant)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {plant.streak > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "var(--toss-primary)" }} />
              )}
            </button>
          </div>
        </div>
        {/* streak / badges sub-row */}
        <div className="flex items-center gap-2 px-5 pb-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: "#e87600" }}>🔥 {plant.streak}일 연속</span>
          {plant.streakShields > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}
            >
              🛡 실드×{plant.streakShields}
            </span>
          )}
          {streakBadge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "rgba(232,118,0,0.10)", color: "#e87600" }}
            >
              {streakBadge}
            </span>
          )}
        </div>
      </header>
      {/* header spacer */}
      <div className="h-[88px]" />

      {/* Garden Tab */}
      {activeTab === 'garden' && (
        <GardenView plant={plant} />
      )}

      {/* Home Tab */}
      {activeTab === 'home' && <>

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
                  <span className="text-[9px] font-bold" style={{ color: "var(--toss-on-surface-variant)" }}>오늘 날씨</span>
                  <span className="text-xs font-extrabold tracking-tight" style={{ color: "var(--toss-on-surface)" }}>{wi.name}</span>
                </div>
              </div>
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700" />
              <div className="flex flex-1 items-center justify-center gap-2">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-[9px] font-bold" style={{ color: "var(--toss-on-surface-variant)" }}>현재 시즌</span>
                  <span className="text-xs font-extrabold tracking-tight" style={{ color: "var(--toss-secondary)" }}>{si.name} <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 rounded px-1">+{si.xpMultiplier}x</span></span>
                </div>
                <span className="text-lg">{si.emoji}</span>
              </div>
            </>
          );
        })()}
      </div>

      {/* Hero Card */}
      <div
        className="mx-4 mt-3 toss-card rounded-3xl relative overflow-hidden"
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
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}
            >
              {STAGE_INFO[plant.stage].name}
            </span>
            {plant.isWilting && !plant.isDead && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(186,26,26,0.08)", color: "#ba1a1a" }}>
                ⚠️ 힘들어요
              </span>
            )}
          </div>
          <button
            className="text-sm font-medium"
            style={{ color: "var(--toss-primary)" }}
            onClick={() => { setNameInput(plant.name ?? ''); setEditingName(true); }}
          >
            {plant.name ? `"${plant.name}" ✏️` : "이름 짓기 ✏️"}
          </button>
        </div>
        {/* 단계 설명 */}
        <p className="text-center text-xs px-5 pt-0.5 pb-0" style={{ color: "var(--toss-on-surface-variant)" }}>
          {plant.isDead ? "💀 식물이 떠났어요..." : plant.isWilting ? "😢 식물이 힘들어요!" : STAGE_INFO[plant.stage].description}
        </p>

        {/* Name Display */}
        {plant.name && (
          <p className="text-center text-xl font-black mt-2 tracking-tight" style={{ color: "var(--toss-on-surface)" }}>
            {plant.name}
          </p>
        )}

        {/* 식물 캐릭터 (가운데 크게) */}
        <div className="relative flex justify-center pt-2 pb-0">
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
            onTapStatBoost={handleTapStatBoost}
          />
          {/* Floating Actions */}
          {!plant.isDead && (
            <>
              <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10">
                <AdButton onAdComplete={handleAdComplete} adAvailable={adAvailable} adLastWatched={plant.adLastWatched} compact weatherDisabled={isPhotosynthesisDisabled} />
              </div>
              <div className="absolute top-1/2 right-4 -translate-y-1/2 z-10">
                <MiniWatering plant={plant} onWater={handleMiniWater} compact />
              </div>
            </>
          )}
        </div>
        {/* XP bar */}
        {!plant.isDead && plant.stage !== 'special' && (
          <div className="px-5 pb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold tracking-wide" style={{ color: "var(--toss-primary)" }}>성장 XP</span>
              <span className="text-[10px] font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>{plant.xp} / {plant.xpRequired}</span>
            </div>
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
                  className={`rounded-xl p-2.5 flex flex-col items-center gap-0.5 ${isCritical ? "animate-stat-danger" : ""}`}
                  style={{
                    backgroundColor: isCritical
                      ? "rgba(186,26,26,0.08)"
                      : isWarn
                      ? "rgba(232,118,0,0.07)"
                      : "var(--toss-surface-low)",
                  }}
                >
                  <span className="text-base">{emoji}</span>
                  <p className="text-[9px] font-bold tracking-tight" style={{ color: isCritical ? "#ba1a1a" : isWarn ? "#e87600" : "var(--toss-on-surface-variant)" }}>{label}</p>
                  <p className="text-xs font-extrabold" style={{ color: isCritical ? "#ba1a1a" : isWarn ? "#e87600" : "var(--toss-on-surface)" }}>{display}</p>
                  {isCritical && <span className="text-[8px] font-bold" style={{ color: "#ba1a1a" }}>⚠️</span>}
                </div>
              );
            })}
          </div>
        )}



        {/* Mood */}
        <div className="px-5 mt-1">
          <PlantMood plant={plant} completedToday={totalCompleted} />
        </div>


        {plant.isDead && (
          <div className="px-5 pb-4">
            <Button display="full" color="dark" size="large" onClick={handleReset}>새 씨앗 심기 🌱</Button>
          </div>
        )}
      </div>

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
        />
      )}

      {/* End Home Tab */}
      </>}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <ProfilePage
          plant={plant}
          theme={theme}
          onToggleTheme={toggle}
          onReset={handleReset}
        />
      )}

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
          <div
            className="toss-card rounded-3xl p-8 mx-6 text-center"
            style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-6xl mb-3">
              {milestone.streak >= 30 ? '🏆' : milestone.streak >= 14 ? '🌟' : milestone.streak >= 7 ? '⭐' : '🎉'}
            </div>
            <p className="text-xl font-bold mb-1" style={{ color: "var(--toss-on-surface)" }}>
              {milestone.streak}일 연속 달성!
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--toss-on-surface-variant)" }}>
              꾸준히 돌봐줘서 고마워요 💚
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--toss-secondary)" }}>+{milestone.bonusXp} XP 보너스!</p>
            <button
              className="mt-5 w-full py-3 font-bold rounded-2xl text-white"
              style={{ background: "linear-gradient(135deg, #004ecb, #0064ff)" }}
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
          <div
            className="w-full toss-card rounded-t-3xl p-6 pb-8"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-lg font-bold mb-1" style={{ color: "var(--toss-on-surface)" }}>내 식물 이름 짓기 🌿</p>
            <p className="text-xs mb-4" style={{ color: "var(--toss-on-surface-variant)" }}>최대 12자</p>
            <input
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
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,78,203,0.25)"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-3 rounded-2xl font-semibold"
                style={{ backgroundColor: "var(--toss-surface-low)", color: "var(--toss-on-surface-variant)" }}
                onClick={() => setEditingName(false)}
              >
                취소
              </button>
              <button
                className="flex-1 py-3 rounded-2xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #004ecb, #0064ff)" }}
                onClick={handleSaveName}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 toss-nav-bg backdrop-blur-xl px-4 pb-6 pt-3"
        style={{
          borderRadius: "2.5rem 2.5rem 0 0",
          boxShadow: "0 -1px 0 rgba(0,0,0,0.05), 0 12px 32px -4px rgba(0,84,216,0.08)",
        }}
      >
        <div className="flex justify-around items-center">
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
            { id: 'profile', label: '프로필', icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )},
          ] as const).map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center justify-center px-5 py-2 rounded-full gap-0.5 text-[11px] font-bold transition-all duration-200 active:scale-90"
                style={{
                  color: active ? "var(--toss-primary)" : "var(--toss-on-surface-variant)",
                  backgroundColor: active ? "rgba(0,78,203,0.08)" : "transparent",
                  fontFamily: "var(--font-headline, sans-serif)",
                }}
              >
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
