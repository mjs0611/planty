"use client";
import { getCurrentWeather, WEATHER_INFO } from "@/lib/weather";

export default function WeatherBanner() {
  const weather = getCurrentWeather();
  const info = WEATHER_INFO[weather];
  const hasBonus = !!(info.bonusStat || info.bonusSlot);

  return (
    <div className="mx-4 mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 toss-card">
      <span className="text-2xl">{info.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black" style={{ color: "var(--toss-on-surface)" }}>{info.name}</p>
        <p className="text-xs font-medium" style={{ color: "var(--toss-on-surface-variant)" }}>{info.desc}</p>
      </div>
      {hasBonus && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}>
          XP ×1.5
        </span>
      )}
    </div>
  );
}
