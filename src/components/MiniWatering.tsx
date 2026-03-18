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
    <div className="flex items-center justify-between glass-panel rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex justify-center items-center">
          <span className="text-xl">💧</span>
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
            미니 워터링
          </p>
          <p className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            {available ? "물 주고 +5 XP 받기" : `${cooldown} 다시 열려요`}
          </p>
        </div>
      </div>
      <button
        onClick={onWater}
        disabled={!available}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 transform active:scale-95 shadow-sm ${available
            ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
            : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"
          }`}
      >
        {available ? "💧 물주기" : "⏳ 대기중"}
      </button>
    </div>
  );
}
