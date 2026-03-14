"use client";
import { TimeSlotMissions as TSM, TimeSlot } from "@/types/plant";
import { getMissionById } from "@/lib/missions";
import { isSlotUnlocked, getSlotMeta } from "@/lib/weather";
import MissionCard from "./MissionCard";

interface Props {
  timeSlotMissions: TSM;
  completedMissions: string[];
  onComplete: (slotId: string) => void;
  totalCompleted: number;
  total: number;
}

const SLOTS: TimeSlot[] = ["morning", "afternoon", "evening"];

export default function TimeSlotMissions({
  timeSlotMissions,
  completedMissions,
  onComplete,
  totalCompleted,
  total,
}: Props) {
  return (
    <div className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">오늘의 미션</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">{totalCompleted}/{total} 완료</span>
      </div>

      <div className="space-y-4">
        {SLOTS.map((slot) => {
          const meta = getSlotMeta(slot);
          const unlocked = isSlotUnlocked(slot);
          const missionIds = timeSlotMissions[slot];
          const slotCompleted = missionIds.filter(id =>
            completedMissions.includes(`${slot}_${id}`)
          ).length;

          return (
            <div key={slot}>
              {/* Slot header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{meta.emoji}</span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{meta.name}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {slotCompleted}/{missionIds.length}
                </span>
                {!unlocked && (
                  <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {meta.unlockHour}:00부터 열려요
                  </span>
                )}
              </div>

              {/* Missions */}
              <div className={`space-y-2 ${!unlocked ? "opacity-40 pointer-events-none" : ""}`}>
                {missionIds.map((missionId) => {
                  const mission = getMissionById(missionId);
                  if (!mission) return null;
                  const slotId = `${slot}_${missionId}`;
                  return (
                    <MissionCard
                      key={slotId}
                      mission={mission}
                      isCompleted={completedMissions.includes(slotId)}
                      onComplete={() => onComplete(slotId)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {totalCompleted >= total && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">🎉 오늘 미션 완주! 내일 또 만나요!</p>
        </div>
      )}
    </div>
  );
}
