"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Top, Button, Toast } from "@toss/tds-mobile";
import { PlantState } from "@/types/plant";
import { loadState, saveState, completeMission, applyAdBoost, resetPlant, STAGE_INFO, isAdAvailable } from "@/lib/plantState";
import { getMissionById } from "@/lib/missions";
import { haptic, logEvent } from "@/lib/bridge";
import PlantDisplay from "@/components/PlantDisplay";
import StatBar from "@/components/StatBar";
import MissionCard from "@/components/MissionCard";
import AdButton from "@/components/AdButton";
import ShareSheet from "@/components/ShareSheet";
import BannerAd from "@/components/BannerAd";
import Splash from "@/components/Splash";
import Onboarding from "@/components/Onboarding";
import { useTheme } from "@/lib/theme";

const ONBOARDED_KEY = "daily_green_onboarded";

export default function HomePage() {
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggle } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(true); // default true to avoid flicker

  const openToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ open: true, message });
    toastTimerRef.current = setTimeout(() => setToast(prev => ({ ...prev, open: false })), 2500);
  }, []);

  // 앱 진입 시 상태 로드 + analytics + 온보딩 확인
  useEffect(() => {
    const isOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    setOnboarded(isOnboarded);
    const state = loadState();
    setPlant(state);
    logEvent("screen_view", { screen: "home", stage: state.stage, streak: state.streak });
  }, []);

  const handleOnboardingStart = () => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    setOnboarded(true);
  };

  // 상태 변경 시 저장
  useEffect(() => {
    if (plant) saveState(plant);
  }, [plant]);

  // 뒤로가기 이벤트 (토스 앱)
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { graniteEvent } = await import("@apps-in-toss/web-framework");
        const sub = graniteEvent.addEventListener("backEvent", {
          onEvent: () => {
            // 공유 시트가 열려있으면 닫기
            setShowShare(prev => {
              if (prev) return false;
              return prev; // 닫힌 상태면 앱 기본 동작(뒤로가기)
            });
          },
        });
        cleanup = sub;
      } catch {
        // 앱 외부
      }
    })();
    return () => cleanup?.();
  }, []);

  const handleMissionComplete = useCallback((missionId: string) => {
    if (!plant) return;
    const mission = getMissionById(missionId);
    if (!mission) return;
    const prevStage = plant.stage;
    const newState = completeMission(plant, missionId, mission.statEffect, mission.xpReward);

    if (newState.stage !== prevStage) {
      setJustLeveledUp(true);
      haptic("confetti");
      openToast(`🎊 ${STAGE_INFO[newState.stage].name}으로 레벨 업!`);
      logEvent("level_up", { from: prevStage, to: newState.stage, streak: newState.streak });
      setTimeout(() => setJustLeveledUp(false), 2500);
    } else {
      haptic("success");
      openToast(`${mission.emoji} ${mission.label} 완료! +${mission.xpReward} XP`);
    }

    logEvent("mission_complete", {
      mission_id: missionId,
      mission_label: mission.label,
      xp_reward: mission.xpReward,
      stage: newState.stage,
    });

    setPlant(newState);
  }, [plant, openToast]);

  const handleAdComplete = useCallback(() => {
    if (!plant) return;
    setPlant(applyAdBoost(plant));
    haptic("success");
    openToast('📺 광고 보상 획득! 스탯 +20');
    logEvent("ad_rewarded", { stage: plant.stage });
  }, [plant, openToast]);

  const handleReset = useCallback(() => {
    if (!plant?.isDead) return;
    logEvent("plant_reset", { prev_stage: plant.stage, total_days: plant.totalDaysAlive });
    setPlant(resetPlant());
  }, [plant]);

  // Splash (always shown briefly on load)
  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />;
  }

  // Onboarding (first launch only)
  if (!onboarded) {
    return <Onboarding onStart={handleOnboardingStart} />;
  }

  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-bounce">🌱</div>
      </div>
    );
  }

  const todayMissions = plant.todayMissions
    .map(id => getMissionById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getMissionById>>[];

  const allMissionsCompleted = plant.todayMissions.every(id => plant.completedMissions.includes(id));
  const adAvailable = isAdAvailable(plant);

  const streakBadge = plant.streak >= 30
    ? '🏆 월간 마스터'
    : plant.streak >= 7
    ? '⭐ 주간 달성'
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-8">
      {/* TDS Top Header */}
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
            {streakBadge && (
              <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                {streakBadge}
              </span>
            )}
          </div>
        }
        right={
          <div className="flex items-center gap-2">
            <Top.RightButton
              onClick={() => { setShowShare(true); logEvent("share_open", { stage: plant.stage }); }}
              aria-label="공유하기"
            >
              🔗
            </Top.RightButton>
            <Top.RightButton onClick={toggle} aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </Top.RightButton>
          </div>
        }
      />

      {/* Stage badge */}
      <div className="px-4 mt-1">
        <div className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{STAGE_INFO[plant.stage].name}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400">{plant.totalDaysAlive}일째</span>
        </div>
      </div>

      {/* Plant Display Card */}
      <div className="mx-4 mt-3 bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl relative overflow-hidden">
        <PlantDisplay
          stage={plant.stage}
          isWilting={plant.isWilting}
          isDead={plant.isDead}
          xp={plant.xp}
          xpRequired={plant.xpRequired}
          justLeveledUp={justLeveledUp}
        />
        {plant.isDead && (
          <div className="px-4 pb-4">
            <Button display="full" color="dark" size="large" onClick={handleReset}>
              새 씨앗 심기 🌱
            </Button>
          </div>
        )}
      </div>

      {/* Wilting warning */}
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

      {/* Today's Missions */}
      {!plant.isDead && (
        <div className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">오늘의 미션</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {plant.completedMissions.filter(id => plant.todayMissions.includes(id)).length}/{plant.todayMissions.length} 완료
            </span>
          </div>
          <div className="space-y-2">
            {todayMissions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                isCompleted={plant.completedMissions.includes(mission.id)}
                onComplete={handleMissionComplete}
              />
            ))}
          </div>
          {allMissionsCompleted && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">🎉 오늘 미션 완료! 내일 또 만나요!</p>
            </div>
          )}
        </div>
      )}

      {/* 배너 광고 */}
      {!plant.isDead && (
        <div className="mx-4 mt-3">
          <BannerAd />
        </div>
      )}

      {/* 리워드 광고 */}
      {!plant.isDead && (
        <div className="mx-4 mt-2">
          <AdButton onAdComplete={handleAdComplete} adAvailable={adAvailable} />
        </div>
      )}

      {/* TDS Toast */}
      <Toast position="bottom" open={toast.open} text={toast.message} />

      {/* Share Sheet */}
      {showShare && (
        <ShareSheet plant={plant} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
