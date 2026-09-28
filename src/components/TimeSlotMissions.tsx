"use client";
import { useEffect, useState, type MutableRefObject } from "react";
import { TimeSlotMissions as TSM, TimeSlot, Mission } from "@/types/plant";
import { getMissionById } from "@/lib/missions";
import { getCurrentTimeSlot, getSlotMeta } from "@/lib/weather";
import MissionCard from "./MissionCard";
import MissionInteractionModal from "./MissionInteractionModal";

interface Props {
  timeSlotMissions: TSM;
  completedMissions: string[];
  onComplete: (slotId: string) => void;
  totalCompleted: number;
  total: number;
  /** 토스 뒤로가기: 열린 미션 모달을 닫았으면 true */
  backRef?: MutableRefObject<(() => boolean) | null>;
}

const ALL_SLOTS: TimeSlot[] = ["morning", "afternoon", "evening", "night"];

export default function TimeSlotMissions({
  timeSlotMissions,
  completedMissions,
  onComplete,
  totalCompleted,
  total,
  backRef,
}: Props) {
  const currentSlot = getCurrentTimeSlot();
  const [activeSlot, setActiveSlot] = useState<TimeSlot>(currentSlot);
  const meta = getSlotMeta(activeSlot);
  const missionIds = timeSlotMissions[activeSlot] ?? [];
  const slotCompleted = missionIds.filter(id =>
    completedMissions.includes(`${activeSlot}_${id}`)
  ).length;
  const allSlotsCompleted = totalCompleted >= total;

  const [selected, setSelected] = useState<{ mission: Mission; slotId: string } | null>(null);
  useEffect(() => {
    if (!backRef) return;
    backRef.current = () => {
      if (!selected) return false;
      setSelected(null);
      return true;
    };
    return () => { backRef.current = null; };
  });

  return (
    <div className="mx-4 mt-4 toss-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h3
          className="text-lg font-black"
          style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}
        >
          오늘의 미션
        </h3>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}
        >
          {total - totalCompleted > 0 ? `${total - totalCompleted}개 남음` : "🎉 완료!"}
        </span>
      </div>

      {/* Segmented control tabs */}
      <div
        className="flex gap-1 mx-4 mb-3 p-1 rounded-full"
        style={{ backgroundColor: "var(--toss-surface-high, #eae8e7)" }}
      >
        {ALL_SLOTS.map((slot) => {
          const m = getSlotMeta(slot);
          const isActive = slot === activeSlot;
          const slotMissionIds = timeSlotMissions[slot] ?? [];
          const slotDone =
            slotMissionIds.length > 0 &&
            slotMissionIds.every(id => completedMissions.includes(`${slot}_${id}`));
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className="flex-1 text-center py-2 rounded-full text-[11px] font-bold transition-all duration-200"
              style={{
                backgroundColor: isActive ? "var(--toss-card-bg, #ffffff)" : "transparent",
                color: isActive
                  ? "var(--toss-on-surface, #1b1c1c)"
                  : slotDone
                  ? "var(--toss-secondary, #006c49)"
                  : "var(--toss-on-surface-variant, #424656)",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              }}
            >
              {slotDone ? "✅" : m.emoji} {m.name}
            </button>
          );
        })}
      </div>

      {/* Mission list */}
      <div>
        {missionIds.map((missionId, idx) => {
          const mission = getMissionById(missionId);
          if (!mission) return null;
          const slotId = `${activeSlot}_${missionId}`;
          return (
            <div key={slotId}>
              {idx > 0 && (
                <div className="mx-6" style={{ height: 1, backgroundColor: "var(--toss-surface-high)" }} />
              )}
              <MissionCard
                mission={mission}
                isCompleted={completedMissions.includes(slotId)}
                onSelect={() => setSelected({ mission, slotId })}
              />
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {slotCompleted === missionIds.length && missionIds.length > 0 && (
        <div className="mx-4 mb-3 mt-1 p-3 rounded-xl text-center"
          style={{ backgroundColor: "rgba(0,108,73,0.08)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--toss-secondary)" }}>
            {allSlotsCompleted ? "🎉 오늘 미션 완주! 내일 또 만나요!" : `✅ ${meta.name} 미션 완료!`}
          </p>
        </div>
      )}

      {selected && (
        <MissionInteractionModal
          mission={selected.mission}
          onComplete={() => {
            onComplete(selected.slotId);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
