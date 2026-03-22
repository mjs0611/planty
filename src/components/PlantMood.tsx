"use client";
import { useState, useEffect } from "react";
import { PlantState } from "@/types/plant";
import { getPlantMood } from "@/lib/mood";

interface Props {
  plant: PlantState;
  completedToday: number;
}

export default function PlantMood({ plant, completedToday }: Props) {
  const [visible, setVisible] = useState(false);
  const [mood, setMood] = useState(() => getPlantMood(plant, completedToday));

  useEffect(() => {
    setMood(getPlantMood(plant, completedToday));
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(hide);
  }, [plant.streak, plant.isWilting, plant.isDead, plant.stats.health, completedToday]);

  return (
    <div className="w-full flex flex-col items-center gap-1">
      <div
        style={{
          transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(0.9)",
          pointerEvents: "none",
        }}
        className="bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl px-4 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center gap-2 max-w-[220px]"
      >
        <span className={`text-lg ${visible ? "animate-bounce" : ""}`}>{mood.emoji}</span>
        <span className="text-[12px] text-gray-700 dark:text-gray-200 font-medium leading-tight">{mood.message}</span>
      </div>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
        className="w-3 h-3 bg-white/80 dark:bg-black/40 backdrop-blur-md border-r border-b border-white/40 dark:border-white/10 rotate-45 -mt-2 z-[-1]"
      />
    </div>
  );
}
