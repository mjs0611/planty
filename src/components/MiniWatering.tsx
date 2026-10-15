"use client";
import { useState, useEffect, useRef } from "react";
import { PlantState } from "@/types/plant";
import { isMiniWateringAvailable } from "@/lib/plantState";
import { MINI_WATERING_COOLDOWN_MS } from "@/lib/constants";

interface Props {
  plant: PlantState;
  onWater: () => void;
  primary?: boolean;
}

function formatCooldown(lastWateringTime: string | null, now: number): string {
  if (!lastWateringTime) return "";
  const remaining = MINI_WATERING_COOLDOWN_MS - (now - new Date(lastWateringTime).getTime());
  if (remaining <= 0) return "";
  const minutes = Math.ceil(remaining / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간${m ? ` ${m}분` : ""} 후` : `${m}분 후`;
}

export default function MiniWatering({ plant, onWater, primary = true }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const [completed, setCompleted] = useState(false);
  const previousWatering = useRef(plant.lastWateringTime);
  const available = isMiniWateringAvailable(plant);
  const cooldown = formatCooldown(plant.lastWateringTime, now);

  useEffect(() => {
    if (available) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [available]);

  useEffect(() => {
    if (previousWatering.current === plant.lastWateringTime) return;
    previousWatering.current = plant.lastWateringTime;
    setCompleted(true);
    setNow(Date.now());
    const timer = setTimeout(() => setCompleted(false), 2500);
    return () => clearTimeout(timer);
  }, [plant.lastWateringTime]);

  return (
    <div className="watering-action">
      <button onClick={onWater} disabled={!available}
        data-completed={completed}
        className={primary ? "primary-care-button" : "secondary-care-button"}
        aria-describedby="watering-hint">
        <span aria-hidden="true" className={completed ? "watering-complete" : ""}>{completed ? "✓" : "💧"}</span>
        {completed ? "물을 줬어요" : available ? "물주기" : "다음 물주기 기다리는 중"}
      </button>
      <p id="watering-hint" className="text-sm text-center mt-2" style={{ color: "var(--toss-on-surface-variant)" }}>
        {available ? "수분 +8 · XP +10" : `${cooldown} 다시 물을 줄 수 있어요`}
      </p>
      <span className="sr-only" role="status">{completed ? "물을 줬어요" : ""}</span>
    </div>
  );
}
