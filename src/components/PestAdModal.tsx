"use client";
import { useState, useEffect, useCallback } from "react";
import { ProgressBar } from "@toss/tds-mobile";
import { GoogleAdMob } from "@apps-in-toss/web-framework";

const AD_GROUP_ID = process.env.NEXT_PUBLIC_TOSS_REWARDED_AD_GROUP_ID ?? "ait-ad-test-rewarded-id";

const isAdMobSupported = () => {
  try { return GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === true; }
  catch { return false; }
};

interface Props {
  onCatch: () => void;  // 광고 시청 완료 → 해충 제거
  onClose: () => void;  // 그냥 두기 → 패널티 없이 닫기
}

export default function PestAdModal({ onCatch, onClose }: Props) {
  const [phase, setPhase] = useState<"idle" | "watching">("idle");
  const [progress, setProgress] = useState(0);
  const supported = isAdMobSupported();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === "watching" && !supported) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 4;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [phase, supported]);

  useEffect(() => {
    if (progress >= 100 && phase === "watching") onCatch();
  }, [progress, phase, onCatch]);

  const handleWatch = useCallback(() => {
    if (supported) {
      setPhase("watching");
      try {
        GoogleAdMob.showAppsInTossAdMob({
          options: { adGroupId: AD_GROUP_ID },
          onEvent: (e) => {
            if (e.type === "userEarnedReward") onCatch();
            if (e.type === "dismissed") setPhase("idle");
          },
          onError: () => setPhase("idle"),
        });
      } catch { setPhase("idle"); }
    } else {
      setPhase("watching");
    }
  }, [supported, onCatch]);

  const remainingSeconds = Math.ceil(((100 - progress) / 100) * 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl mx-6 overflow-hidden shadow-2xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 px-6 pt-6 pb-4 text-center">
          <span className="text-5xl">🐛</span>
          <p className="text-base font-bold text-gray-800 dark:text-white mt-2">해충 등장!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            잡지 않으면 식물 건강이 떨어져요
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {phase === "watching" && !supported ? (
            <div className="py-3 px-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex flex-col gap-2 mb-3">
              <div className="flex justify-between text-xs text-yellow-700 dark:text-yellow-400 font-semibold">
                <span>📺 광고 시청 중...</span>
                <span>{remainingSeconds}초</span>
              </div>
              <ProgressBar progress={progress / 100} size="light" color="#F59E0B" animate />
            </div>
          ) : (
            <button
              className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-2xl text-sm mb-2 active:scale-95 transition-transform"
              onClick={handleWatch}
              disabled={phase === "watching"}
            >
              📺 광고 보고 해충 잡기
            </button>
          )}
          <button
            className="w-full py-3 text-sm text-gray-400 dark:text-gray-500 font-medium"
            onClick={onClose}
          >
            그냥 두기 (건강 -8)
          </button>
        </div>
      </div>
    </div>
  );
}
