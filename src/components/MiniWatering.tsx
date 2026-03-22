"use client";
import { useState, useEffect } from "react";
import { PlantState } from "@/types/plant";
import { isMiniWateringAvailable } from "@/lib/plantState";
import { MINI_WATERING_COOLDOWN_MS } from "@/lib/constants";

interface Props {
  plant: PlantState;
  onWater: () => void;
  compact?: boolean;
}

function formatCooldown(lastWateringTime: string | null): string {
  if (!lastWateringTime) return "";
  const elapsed = Date.now() - new Date(lastWateringTime).getTime();
  const remaining = MINI_WATERING_COOLDOWN_MS - elapsed;
  if (remaining <= 0) return "";
  const h = Math.floor(remaining / (60 * 60 * 1000));
  const m = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return h > 0 ? `${h}시간 ${m}분 후` : `${m}분 후`;
}

export default function MiniWatering({ plant, onWater, compact }: Props) {
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

  if (compact) {
    return (
      <button
        onClick={onWater}
        disabled={!available}
        className={`rounded-full px-3 py-1.5 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${available ? '' : 'grayscale opacity-60 cursor-not-allowed'}`}
        style={available ? { background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", boxShadow: "0 4px 12px rgba(59,130,246,0.35)" } : { backgroundColor: "var(--toss-surface-high)", color: "var(--toss-on-surface-variant)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-none">💧</span>
          <span className="text-[10px] font-bold">{available ? "물주기" : cooldown}</span>
        </div>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl px-4 py-3"
      style={{ backgroundColor: "var(--toss-surface-low)" }}>
      <div className="flex items-center gap-2">
        <span className="text-lg">💧</span>
        <div>
          <p className="text-xs font-bold" style={{ color: "var(--toss-on-surface)" }}>물주기</p>
          <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--toss-on-surface-variant)" }}>
            {available ? "수분 +8 · XP +10" : `${cooldown} 후 가능`}
          </p>
        </div>
      </div>
      <button
        onClick={onWater}
        disabled={!available}
        className="px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
        style={available ? {
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
        } : {
          backgroundColor: "var(--toss-surface-high)",
          color: "var(--toss-on-surface-variant)",
          cursor: "not-allowed",
        }}
      >
        {available ? "💧 주기" : "⏳ 대기"}
      </button>
    </div>
  );
}
