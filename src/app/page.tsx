"use client";
import { useEffect, useState, useCallback } from "react";
import { PlantState } from "@/types/plant";
import { loadState, saveState, completeMission, applyAdBoost, resetPlant, STAGE_INFO } from "@/lib/plantState";
import { getMissionById } from "@/lib/missions";
import PlantDisplay from "@/components/PlantDisplay";
import StatBar from "@/components/StatBar";
import MissionCard from "@/components/MissionCard";
import AdButton from "@/components/AdButton";
import { useTheme } from "@/lib/theme";

export default function HomePage() {
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setPlant(loadState());
  }, []);

  useEffect(() => {
    if (plant) saveState(plant);
  }, [plant]);

  const handleMissionComplete = useCallback((missionId: string) => {
    if (!plant) return;
    const mission = getMissionById(missionId);
    if (!mission) return;
    const prevStage = plant.stage;
    const newState = completeMission(plant, missionId, mission.statEffect, mission.xpReward);
    if (newState.stage !== prevStage) setJustLeveledUp(true);
    setPlant(newState);
    setTimeout(() => setJustLeveledUp(false), 2500);
  }, [plant]);

  const handleAdComplete = useCallback(() => {
    if (!plant) return;
    setPlant(applyAdBoost(plant));
  }, [plant]);

  const handleReset = useCallback(() => {
    if (!plant?.isDead) return;
    setPlant(resetPlant());
  }, [plant]);

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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-8">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">초록하루 🌿</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">🔥 {plant.streak}일 연속 케어</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-lg"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Plant Display Card */}
      <div className="mx-4 mt-4 bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl relative overflow-hidden">
        <PlantDisplay
          stage={plant.stage}
          isWilting={plant.isWilting}
          isDead={plant.isDead}
          xp={plant.xp}
          xpRequired={plant.xpRequired}
          justLeveledUp={justLeveledUp}
        />

        {/* Dead plant reset button */}
        {plant.isDead && (
          <button
            onClick={handleReset}
            className="mx-4 mb-4 w-[calc(100%-2rem)] py-3 bg-gray-800 text-white rounded-2xl font-semibold text-sm"
          >
            새 씨앗 심기 🌱
          </button>
        )}
      </div>

      {/* Stats */}
      {!plant.isDead && (
        <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-3xl p-4 space-y-3 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">식물 상태</h2>
          <StatBar emoji="💧" label="수분" value={plant.stats.water} color="linear-gradient(90deg, #60A5FA, #3B82F6)" />
          <StatBar emoji="☀️" label="햇빛" value={plant.stats.sunlight} color="linear-gradient(90deg, #FCD34D, #F59E0B)" />
          <StatBar emoji="💚" label="건강" value={plant.stats.health} color="linear-gradient(90deg, #34D399, #00C473)" />
        </div>
      )}

      {/* Today's Missions */}
      {!plant.isDead && (
        <div className="mx-4 mt-4 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm">
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

      {/* Ad Button */}
      {!plant.isDead && (
        <div className="mx-4 mt-4">
          <AdButton onAdComplete={handleAdComplete} disabled={plant.isDead} />
        </div>
      )}

      {/* Wilting warning */}
      {plant.isWilting && !plant.isDead && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">⚠️ 식물이 힘들어요! 빨리 돌봐주세요.</p>
        </div>
      )}

      {/* Stage milestone */}
      {justLeveledUp && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#00C473] to-[#0066FF] rounded-3xl text-center">
          <p className="text-white font-bold text-base">🎊 레벨 업!</p>
          <p className="text-white/80 text-sm mt-1">{STAGE_INFO[plant.stage].name}으로 성장했어요!</p>
        </div>
      )}
    </div>
  );
}
