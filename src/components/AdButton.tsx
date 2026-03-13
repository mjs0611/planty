"use client";
import { useState, useEffect } from "react";
import { Button, ProgressBar } from "@toss/tds-mobile";

interface Props {
  onAdComplete: () => void;
  adAvailable: boolean;
}

export default function AdButton({ onAdComplete, adAvailable }: Props) {
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (watching) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 4;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [watching]);

  useEffect(() => {
    if (progress >= 100 && watching) {
      setWatching(false);
      setProgress(0);
      onAdComplete();
    }
  }, [progress, watching, onAdComplete]);

  const handleWatch = () => {
    if (!adAvailable || watching) return;
    setWatching(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Simulated banner ad */}
      <div className="relative h-16 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center gap-3 px-4">
        <span className="text-2xl">🌿</span>
        <div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">초록하루 프리미엄</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">광고 없이 즐기고 싶다면?</p>
        </div>
        <span className="ml-auto text-[9px] text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-gray-600 rounded px-1">광고</span>
      </div>

      {/* Reward area */}
      <div className="p-3">
        {watching ? (
          <div className="py-3 px-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-yellow-700 dark:text-yellow-400 font-medium">
              <span>📺 광고 시청 중...</span>
              <span>{Math.round((100 - progress) / 20)}초</span>
            </div>
            <ProgressBar
              progress={progress / 100}
              size="light"
              color="#F59E0B"
              animate
            />
          </div>
        ) : adAvailable ? (
          <Button
            display="full"
            color="primary"
            size="large"
            onClick={handleWatch}
          >
            📺 광고 보고 스탯 +20 받기
          </Button>
        ) : (
          <div className="py-3 px-4 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center gap-2">
            <span>✅</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">1시간 후 광고 다시 볼 수 있어요</span>
          </div>
        )}
      </div>
    </div>
  );
}
