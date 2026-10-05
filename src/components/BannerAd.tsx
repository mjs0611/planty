"use client";
import { useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { useTheme } from "@/lib/theme";

const AD_GROUP_ID = process.env.NEXT_PUBLIC_TOSS_BANNER_AD_GROUP_ID ?? "";
let initialized = false;

function tryInitialize() {
  if (initialized) return;
  try {
    if (TossAds.initialize.isSupported()) {
      TossAds.initialize({});
      initialized = true;
    }
  } catch {
    // 앱 외부 환경에서는 무시
  }
}

export default function BannerAd({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const destroyRef = useRef<(() => void) | null>(null);
  const [visible, setVisible] = useState(true);
  // isSupported를 state로 관리해 마운트 후 프레임워크 준비 여부 재확인
  const [isSupported, setIsSupported] = useState(false);
  const { theme } = useTheme();

  // 마운트 직후 지원 여부 확인 (프레임워크 초기화 완료 시점 대응)
  useEffect(() => {
    const check = () => {
      try {
        return TossAds.attachBanner.isSupported() === true;
      } catch {
        return false;
      }
    };

    if (check()) {
      setIsSupported(true);
      return;
    }
    // 프레임워크 초기화 지연 대응: 최대 2초간 100ms 간격으로 재시도
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (check()) {
        setIsSupported(true);
        clearInterval(interval);
      } else if (attempts >= 20) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isSupported || !AD_GROUP_ID) return;
    destroyRef.current?.();
    destroyRef.current = null;
    let active = true;
    let failed = false;
    const hide = () => {
      if (!active || failed) return;
      failed = true;
      setVisible(false); // Hide the label and host container together on no-fill/error.
      const destroy = destroyRef.current;
      destroyRef.current = null;
      try { destroy?.(); } catch { /* The empty wrapper stays hidden. */ }
    };
    tryInitialize();
    try {
      const result = TossAds.attachBanner(AD_GROUP_ID, containerRef.current, {
        theme: theme === "dark" ? "dark" : "light",
        tone: "blackAndWhite",
        variant: "expanded",
        callbacks: {
          onNoFill: hide,
          onAdFailedToRender: hide,
        },
      });
      if (failed) result.destroy(); else destroyRef.current = result.destroy;
    } catch {
      hide();
    }
    return () => {
      active = false;
      destroyRef.current?.();
      destroyRef.current = null;
    };
  }, [theme, isSupported]);

  if (!visible) return null;

  // 토스 앱 외부 (개발 환경) — 레이아웃 확인용 플레이스홀더
  if (!isSupported || !AD_GROUP_ID) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div className={`rounded-2xl overflow-hidden ${className ?? ""}`}>
        <div className="h-14 bg-slate-100 dark:bg-slate-800/40 border border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center">
          <span className="text-[10px] text-gray-300 dark:text-slate-600">[dev] 배너 광고 영역</span>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="광고" className={`rounded-2xl overflow-hidden border ${className ?? ""}`} style={{ borderColor: "var(--toss-outline-variant)" }}>
      <p className="px-3 py-1 text-xs" style={{ color: "var(--toss-on-surface-variant)" }}>광고</p>
      <div ref={containerRef} />
    </section>
  );
}
