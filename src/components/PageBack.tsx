"use client";
import { useEffect } from "react";

// 약관·개인정보 페이지: 토스 뒤로가기로 이전 화면에 돌아가고, 이전 기록이 없을 때만 미니앱 종료
export default function PageBack() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { graniteEvent, closeView } = await import("@apps-in-toss/web-framework");
        if (cancelled) return;
        cleanup = graniteEvent.addEventListener("backEvent", {
          onEvent: () => {
            if (window.history.length > 1) window.history.back();
            else closeView();
          },
        });
      } catch { /* 앱 외부 */ }
    })();
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return null;
}
