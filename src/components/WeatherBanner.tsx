"use client";
import { getCurrentWeather, WEATHER_INFO } from "@/lib/weather";

export default function WeatherBanner() {
  const weather = getCurrentWeather();
  const info = WEATHER_INFO[weather];

  return (
    <div className="mx-4 mt-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-3 py-2 shadow-sm">
      <span className="text-lg">{info.emoji}</span>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{info.name}</span>
      {info.desc && (
        <>
          <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
          <span className="text-xs text-[#00C473] font-medium">{info.desc}</span>
        </>
      )}
    </div>
  );
}
