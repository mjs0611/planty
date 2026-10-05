"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@toss/tds-mobile";
import { GoogleAdMob } from "@apps-in-toss/web-framework";
import { AdStatus, createRewardedAdSession } from "@/lib/rewardedAd";

export type RegisterAdBack = (close: () => void) => (() => void);
interface Props {
  title: string;
  description: string;
  rewardText: string;
  getOwnerKey: () => string;
  isEligible: () => boolean;
  canReward: () => boolean;
  onReward: (ownerKey: string) => boolean;
  onClose: () => void;
  registerBack: RegisterAdBack;
}
const AD_GROUP_ID = process.env.NEXT_PUBLIC_TOSS_REWARDED_AD_GROUP_ID ?? "";

export default function RewardedAdDialog(props: Props) {
  const latest = useRef(props);
  latest.current = props;
  const session = useRef<ReturnType<typeof createRewardedAdSession> | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<AdStatus>({ phase: "loading", rewardGranted: false });
  const close = useCallback(() => { session.current?.cancel(); latest.current.onClose(); }, []);
  const prepare = useCallback(() => {
    session.current?.cancel();
    const next = createRewardedAdSession({
      groupId: AD_GROUP_ID,
      sdk: GoogleAdMob,
      getOwnerKey: () => latest.current.getOwnerKey(),
      isEligible: () => latest.current.isEligible(),
      canReward: () => latest.current.canReward(),
      onReward: owner => latest.current.onReward(owner),
      onStatus: setStatus,
    });
    session.current = next;
    next.load();
  }, []);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    prepare(); // Preparation is not an impression. Never show from a loaded callback.
    const unregister = latest.current.registerBack(close);
    dialog.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const onVisibility = () => {
      // Native full-screen ads may hide the WebView; SDK dismissal owns watching.
      if (document.hidden && session.current?.getStatus().phase !== "watching") close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab") return;
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
      const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", onKey);
    return () => {
      session.current?.cancel(); unregister();
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [close, prepare]);

  const messages: Record<AdStatus["phase"], string> = {
    loading: "광고를 준비하고 있어요. 준비가 끝나도 직접 선택하기 전에는 재생하지 않아요.",
    ready: "‘광고 보기’를 누르면 재생돼요. 길이는 광고마다 달라요.",
    watching: "광고 시청 완료가 확인돼야 보상을 받아요. 중간에 닫으면 보상을 받지 못할 수 있어요.",
    completed: "보상을 받았어요. 이어서 무료로 식물을 돌봐주세요.",
    dismissed: "시청 완료가 확인되지 않아 보상을 받지 못했어요. 무료 돌봄은 계속할 수 있어요.",
    error: "광고를 준비하거나 재생하지 못했어요. 보상은 지급하지 않았어요. 무료 돌봄은 계속할 수 있어요.",
    unsupported: "이 환경에서는 광고를 볼 수 없어 보상을 받지 못해요. 무료 돌봄은 계속할 수 있어요.",
    busy: "다른 광고 안내가 열려 있어요. 해당 안내를 닫은 뒤 다시 시도해 주세요.",
    ineligible: "식물이나 보상 가능 상태가 달라져 보상을 지급하지 않았어요. 안내를 닫고 현재 식물을 확인해 주세요.",
  };
  const retry = !status.rewardGranted && ["error", "dismissed", "busy"].includes(status.phase);
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/50 p-4 flex items-center justify-center" onClick={close}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="rewarded-ad-title"
        className="toss-card rounded-3xl p-5 w-full max-w-sm max-h-[calc(100dvh-32px)] overflow-y-auto shadow-2xl"
        onClick={event => event.stopPropagation()}>
        <p className="text-sm font-bold mb-2" style={{ color: "var(--toss-primary)" }}>선택형 광고</p>
        <h2 id="rewarded-ad-title" className="text-xl font-bold mb-3" style={{ color: "var(--toss-on-surface)" }}>{props.title}</h2>
        <p className="text-base leading-relaxed mb-4" style={{ color: "var(--toss-on-surface)" }}>{props.description}</p>
        <p role="status" className="text-sm leading-relaxed mb-5" style={{ color: "var(--toss-on-surface-variant)" }}>
          {status.rewardGranted ? "보상을 받았어요. 광고가 닫히면 이어서 돌봐주세요." : messages[status.phase]}
        </p>
        <div className="flex flex-col gap-3">
          {status.phase === "ready" && <Button display="full" color="primary" size="large" onClick={() => session.current?.show()}>광고 보기</Button>}
          {(status.phase === "loading" || status.phase === "watching") && <Button display="full" color="light" size="large" disabled>{status.phase === "loading" ? "광고 준비 중" : "광고 시청 중"}</Button>}
          {retry && <Button display="full" color="primary" size="large" onClick={prepare}>다시 준비</Button>}
          <Button display="full" color="light" size="large" onClick={close}>{status.rewardGranted ? "돌봄 계속" : "무료로 닫기"}</Button>
        </div>
      </div>
    </div>
  );
}
