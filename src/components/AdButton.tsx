"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, ProgressBar } from "@toss/tds-mobile";
import { GoogleAdMob } from "@apps-in-toss/web-framework";
import { AD_COOLDOWN_MS } from "@/lib/constants";

interface Props {
  onAdComplete: () => void;
  adAvailable: boolean;
  adLastWatched?: string | null;
  compact?: boolean;
  weatherDisabled?: boolean;
}

const AD_GROUP_ID = process.env.NEXT_PUBLIC_TOSS_REWARDED_AD_GROUP_ID ?? "ait-ad-test-rewarded-id";

const isAdMobSupported = () => {
  try {
    return GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === true;
  } catch {
    return false;
  }
};

function useCountdown(adLastWatched: string | null | undefined, adAvailable: boolean) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (adAvailable || !adLastWatched) {
      setRemainingMs(0);
      return;
    }
    const calc = () => {
      const elapsed = Date.now() - new Date(adLastWatched).getTime();
      return Math.max(0, AD_COOLDOWN_MS - elapsed);
    };
    setRemainingMs(calc());
    const interval = setInterval(() => {
      const ms = calc();
      setRemainingMs(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [adLastWatched, adAvailable]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  return { remainingMs, minutes, seconds };
}

export default function AdButton({ onAdComplete, adAvailable, adLastWatched, compact, weatherDisabled }: Props) {
  const [phase, setPhase] = useState<"idle" | "loading" | "watching" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const supported = isAdMobSupported();
  const { remainingMs, minutes, seconds } = useCountdown(adLastWatched, adAvailable);

  const loadAd = useCallback(() => {
    if (!supported || !adAvailable) return;
    setPhase("loading");
    try {
      GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (e) => {
          if (e.type === "loaded") setPhase("idle");
        },
        onError: () => setPhase("idle"),
      });
    } catch {
      setPhase("idle");
    }
  }, [supported, adAvailable]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  // 개발 환경 모의 광고 진행
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === "watching" && !supported) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 4; // 200ms × 25 = 5초
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [phase, supported]);

  useEffect(() => {
    if (progress >= 100 && phase === "watching") {
      setPhase("done");
      onAdComplete();
    }
  }, [progress, phase, onAdComplete]);

  const handleWatch = () => {
    if (!adAvailable || phase === "watching" || phase === "loading") return;
    if (supported) {
      setPhase("watching");
      try {
        GoogleAdMob.showAppsInTossAdMob({
          options: { adGroupId: AD_GROUP_ID },
          onEvent: (e) => {
            if (e.type === "userEarnedReward") onAdComplete();
            if (e.type === "dismissed") {
              setPhase("idle");
              loadAd();
            }
          },
          onError: () => setPhase("idle"),
        });
      } catch {
        setPhase("idle");
      }
    } else {
      setPhase("watching");
    }
  };

  if (compact) {
    const isWorking = phase === "loading" || phase === "watching";
    let statusText = "";
    let emoji = "☀️";
    
    if (isWorking) {
      statusText = "처리중";
      emoji = "⏳";
    } else if (weatherDisabled) {
      statusText = "해 없음";
      emoji = "☁️";
    } else if (adAvailable) {
      statusText = "광고 보고 광합성";
    } else {
      statusText = `${minutes}분 ${seconds}초`;
    }
    
    const isDisabled = weatherDisabled || !adAvailable || isWorking;

    return (
      <button
        onClick={handleWatch}
        disabled={isDisabled}
        className={`rounded-full px-3 py-1.5 flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 ${!isDisabled ? '' : 'grayscale opacity-60 cursor-not-allowed'}`}
        style={!isDisabled ? { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", boxShadow: "0 4px 12px rgba(249,115,22,0.35)" } : { backgroundColor: "var(--toss-surface-high)", color: "var(--toss-on-surface-variant)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-none">{emoji}</span>
          <span className="text-[10px] whitespace-nowrap font-bold">{statusText}</span>
        </div>
      </button>
    );
  }

  const watchingSeconds = Math.ceil(((100 - progress) / 100) * 5);

  if (phase === "loading") {
    return (
      <Button display="full" color="light" size="large" disabled>
        ⏳ 광고 불러오는 중...
      </Button>
    );
  }

  if (phase === "watching" && !supported) {
    return (
      <div className="flex flex-col gap-2">
        <Button display="full" color="light" size="large" disabled>
          📺 광고 시청 중... ({watchingSeconds}초)
        </Button>
        <ProgressBar progress={progress / 100} size="light" animate />
      </div>
    );
  }

  if (!adAvailable && remainingMs > 0) {
    return (
      <Button display="full" color="light" size="large" disabled>
        ⏱ {minutes}분 {String(seconds).padStart(2, "0")}초 후 광고 볼 수 있어요
      </Button>
    );
  }

  return (
    <Button display="full" color="primary" size="large" onClick={handleWatch}>
      📺 광고 보고 성장 XP +10 받기
    </Button>
  );
}
