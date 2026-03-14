"use client";
import { useState, useEffect } from "react";
import { PlantState } from "@/types/plant";
import { isMiniWateringAvailable } from "@/lib/plantState";

interface Props {
  plant: PlantState;
  onWater: () => void;
}

function formatCooldown(lastWateringTime: string | null): string {
  if (!lastWateringTime) return "";
  const elapsed = Date.now() - new Date(lastWateringTime).getTime();
  const remaining = 3 * 60 * 60 * 1000 - elapsed;
  if (remaining <= 0) return "";
  const h = Math.floor(remaining / (60 * 60 * 1000));
  const m = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return h > 0 ? `${h}시간 ${m}분 후` : `${m}분 후`;
}

export default function MiniWatering({ plant, onWater }: Props) {
  const [cooldown, setCooldown] = useState(() => formatCooldown(plant.lastWateringTime));
  const available = isMiniWateringAvailable(plant);

  useEffect(() => {
    if (available) { setCooldown(""); return; }
    const interval = setInterval(() => {
      const cd = formatCooldown(plant.lastWateringTime);
      setCooldown(cd);
      if (!cd) clearInterval(interval);
    }, 30000);
    return () => clearInterval(interval);
  }, [plant.lastWateringTime, available]);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">💧</span>
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">미니 워터링</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {available ? "물 주고 +5 XP 받기" : `${cooldown} 다시 열려요`}
          </p>
        </div>
      </div>
      <button
        onClick={onWater}
        disabled={!available}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          available
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 active:scale-95"
            : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
        }`}
      >
        {available ? "💧 주기" : "⏳"}
      </button>
    </div>
  );
}
