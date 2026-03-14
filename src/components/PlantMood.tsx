"use client";
import { useState, useEffect } from "react";
import { PlantState } from "@/types/plant";
import { getPlantMood, isMoodInteractAvailable } from "@/lib/mood";

interface Props {
  plant: PlantState;
  completedToday: number;
  onInteract: () => void;
}

export default function PlantMood({ plant, completedToday, onInteract }: Props) {
  const [visible, setVisible] = useState(false);
  const [mood, setMood] = useState(() => getPlantMood(plant, completedToday));
  const canInteract = isMoodInteractAvailable(plant);

  // Show bubble briefly on mount, then periodically
  useEffect(() => {
    setMood(getPlantMood(plant, completedToday));
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(hide);
  }, [plant.streak, plant.isWilting, plant.isDead, completedToday]);

  const handleTap = () => {
    if (!canInteract) return;
    onInteract();
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  };

  return (
    <button
      onClick={handleTap}
      className="w-full flex flex-col items-center gap-1 focus:outline-none"
      aria-label="식물 감정 확인"
    >
      {/* Speech bubble */}
      <div
        style={{
          transition: "opacity 300ms ease, transform 300ms ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          pointerEvents: "none",
        }}
        className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl px-3 py-1.5 shadow-sm flex items-center gap-1.5 max-w-[200px]"
      >
        <span className="text-base">{mood.emoji}</span>
        <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium leading-tight">{mood.message}</span>
      </div>
      {/* Triangle pointer */}
      <div
        style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
        className="w-2 h-2 bg-white dark:bg-gray-700 border-r border-b border-gray-100 dark:border-gray-600 rotate-45 -mt-1.5"
      />
      {canInteract && !visible && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">탭해서 말 걸기</span>
      )}
    </button>
  );
}
