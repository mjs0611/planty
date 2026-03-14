"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Top, Button, Toast } from "@toss/tds-mobile";
import { PlantState, GrowthEvent } from "@/types/plant";
import {
  loadState, saveState, completeMission, applyAdBoost, applyMiniWatering,
  applyMoodInteract, claimLoginBonus, graduatePlant, resetPlant,
  STAGE_INFO, isAdAvailable, getAllMissionIds,
} from "@/lib/plantState";
import { getMissionById, parseSlotId } from "@/lib/missions";
import { haptic, logEvent } from "@/lib/bridge";
import { getCurrentSeason, SEASON_INFO, PLANT_TYPE_INFO } from "@/lib/season";
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
import GardenSheet from "@/components/GardenSheet";
import { useTheme } from "@/lib/theme";

const ONBOARDED_KEY = "daily_green_onboarded";

export default function HomePage() {
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggle } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(true);

  const season = getCurrentSeason();
  const seasonInfo = SEASON_INFO[season];

  const openToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ open: true, message });
    toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, open: false })), 2500);
  }, []);

  const triggerLevelUp = useCallback((newStage: PlantState["stage"]) => {
    setJustLeveledUp(true);
    haptic("confetti");
    openToast(`🎊 ${STAGE_INFO[newStage].name}으로 레벨 업!`);
    setTimeout(() => setJustLeveledUp(false), 2500);
  }, [openToast]);

  useEffect(() => {
    const isOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    setOnboarded(isOnboarded);
    const state = loadState();
    const bonusResult = claimLoginBonus(state);
    if (bonusResult) {
      setPlant(bonusResult.state);
      setTimeout(() => openToast(`🎁 오늘의 접속 보너스 +${bonusResult.bonusXp} XP`), 2000);
    } else {
      setPlant(state);
    }
    logEvent("screen_view", { screen: "home", stage: state.stage, streak: state.streak });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnboardingStart = () => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    setOnboarded(true);
  };

  useEffect(() => { if (plant) saveState(plant); }, [plant]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { graniteEvent } = await import("@apps-in-toss/web-framework");
        const sub = graniteEvent.addEventListener("backEvent", {
          onEvent: () => {
            if (showGarden) { setShowGarden(false); return; }
            setShowShare(prev => (prev ? false : prev));
          },
        });
        cleanup = sub;
      } catch { /* 앱 외부 */ }
    })();
    return () => cleanup?.();
  }, [showGarden]);

  const handleMissionComplete = useCallback((slotId: string) => {
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

    if (evt) {
      setTimeout(() => setGrowthEvent(evt), 600);
    }

    logEvent("mission_complete", { mission_id: missionId, xp_gained: xpGained, lucky_bonus: luckyBonus });
    setPlant(newState);
  }, [plant, openToast, triggerLevelUp]);

  const handleAdComplete = useCallback(() => {
    if (!plant) return;
    const { state: newState, xpGained } = applyAdBoost(plant);
    const leveledUp = newState.stage !== plant.stage;
    setPlant(newState);
    if (leveledUp) triggerLevelUp(newState.stage);
    else { haptic("success"); openToast(`📺 광고 보상! 성장 XP +${xpGained}`); }
    logEvent("ad_rewarded", { stage: plant.stage });
  }, [plant, openToast, triggerLevelUp]);

  const handleMiniWater = useCallback(() => {
    if (!plant) return;
    const result = applyMiniWatering(plant);
    if (!result) return;
    haptic("success");
    openToast("💧 물을 줬어요! +5 XP");
    setPlant(result.state);
  }, [plant, openToast]);

  const handleMoodInteract = useCallback(() => {
    if (!plant) return;
    const result = applyMoodInteract(plant);
    if (!result) return;
    haptic("success");
    openToast("💚 말을 걸었어요! +3 XP");
    setPlant(result.state);
  }, [plant, openToast]);

  const handleGraduate = useCallback(() => {
    if (!plant) return;
    const newState = graduatePlant(plant);
    const typeInfo = PLANT_TYPE_INFO[newState.plantType];
    haptic("confetti");
    openToast(`🎓 졸업! 새 식물 "${typeInfo.name}" 시작!`);
    logEvent("plant_graduate", { from_type: plant.plantType, to_type: newState.plantType, garden_count: newState.garden.length });
    setPlant(newState);
  }, [plant, openToast]);

  const handleReset = useCallback(() => {
    if (!plant?.isDead) return;
    logEvent("plant_reset", { prev_stage: plant.stage });
    setPlant(resetPlant());
  }, [plant]);

  // ── Render guards ───────────────────────────────────────────
  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />;
  if (!onboarded)  return <Onboarding onStart={handleOnboardingStart} />;
  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    );
  }

  const allMissionIds = getAllMissionIds(plant.timeSlotMissions);
  const totalCompleted = allMissionIds.filter(id => plant.completedMissions.includes(id)).length;
  const total = allMissionIds.length;
  const adAvailable = isAdAvailable(plant);

  const streakBadge =
    plant.streak >= 30 ? "🏆 월간 마스터" :
    plant.streak >= 7  ? "⭐ 주간 달성"    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-8">
      {/* Header */}
      <Top
        title={
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold">초록하루</span>
            <span>🌿</span>
          </div>
        }
        subtitleBottom={
          <div className="flex items-center gap-1.5">
            <span className="text-orange-500 font-semibold text-xs">🔥 {plant.streak}일</span>
            <span className="text-[var(--color-text-secondary)] text-xs">연속 케어</span>
            {plant.streakShields > 0 && (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                🛡 ×{plant.streakShields}
              </span>
            )}
            {streakBadge && (
              <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                {streakBadge}
              </span>
            )}
          </div>
        }
        right={
          <div className="flex items-center gap-1">
            <Top.RightButton onClick={() => setShowGarden(true)} aria-label="내 정원">🌸</Top.RightButton>
            <Top.RightButton onClick={() => { setShowShare(true); logEvent("share_open", { stage: plant.stage }); }} aria-label="공유">🔗</Top.RightButton>
            <Top.RightButton onClick={toggle} aria-label="테마">{theme === "dark" ? "☀️" : "🌙"}</Top.RightButton>
          </div>
        }
      />

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
      <div className="mx-4 mt-3 bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl relative overflow-hidden">
        <PlantDisplay
          stage={plant.stage}
          plantType={plant.plantType}
          isWilting={plant.isWilting}
          isDead={plant.isDead}
          xp={plant.xp}
          xpRequired={plant.xpRequired}
          justLeveledUp={justLeveledUp}
          onGraduate={plant.stage === 'special' ? handleGraduate : undefined}
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
        <div className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-3xl p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">식물 상태</h2>
          <StatBar emoji="💧" label="수분" value={plant.stats.water} color="#3B82F6" />
          <StatBar emoji="☀️" label="햇빛" value={plant.stats.sunlight} color="#F59E0B" />
          <StatBar emoji="💚" label="건강" value={plant.stats.health} color="#00C473" />
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

      <Toast position="bottom" open={toast.open} text={toast.message} />

      <GrowthEventPopup event={growthEvent} onDismiss={() => setGrowthEvent(null)} />
      {showShare  && <ShareSheet plant={plant} onClose={() => setShowShare(false)} />}
      {showGarden && <GardenSheet garden={plant.garden} currentType={plant.plantType} onClose={() => setShowGarden(false)} />}
    </div>
  );
}
