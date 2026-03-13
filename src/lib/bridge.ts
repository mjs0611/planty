/**
 * @apps-in-toss/web-framework 브릿지 함수 래퍼
 * 토스 앱 외부 환경에서도 graceful하게 동작하도록 try-catch + 폴백 처리
 */

import type { HapticFeedbackType } from "@apps-in-toss/web-bridge";

// 토스 앱 환경 여부 (SSR 안전)
export function isInTossApp(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const { generateHapticFeedback } = require("@apps-in-toss/web-framework");
    return typeof generateHapticFeedback?.isSupported === "function"
      ? generateHapticFeedback.isSupported()
      : false;
  } catch {
    return false;
  }
}

/** 네이티브 공유 → 폴백: navigator.share → clipboard */
export async function nativeShare(message: string): Promise<void> {
  try {
    const { share } = await import("@apps-in-toss/web-framework");
    await share({ message });
  } catch {
    // 앱 외부: Web Share API 또는 클립보드
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      await nav.share({ title: "초록하루 🌿", text: message });
    } else {
      await navigator.clipboard.writeText(message);
    }
  }
}

/** 햅틱 피드백 — 앱 외부에서는 무시 */
export async function haptic(type: HapticFeedbackType): Promise<void> {
  try {
    const { generateHapticFeedback } = await import("@apps-in-toss/web-framework");
    await generateHapticFeedback({ type });
  } catch {
    // 앱 외부에서는 무시
  }
}

/** 이벤트 로그 — 앱 외부에서는 console.debug */
export async function logEvent(
  log_name: string,
  params: Record<string, string | number | boolean | null | undefined> = {}
): Promise<void> {
  try {
    const { eventLog } = await import("@apps-in-toss/web-framework");
    await eventLog({ log_name, log_type: "event", params });
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.debug("[eventLog]", log_name, params);
    }
  }
}
