"use client";
import { useEffect, useState } from "react";
import { AD_COOLDOWN_MS, AD_XP_REWARD } from "@/lib/constants";
import RewardedAdDialog, { RegisterAdBack } from "@/components/RewardedAdDialog";

interface Props {
  onAdComplete: (ownerKey: string) => boolean;
  getOwnerKey: () => string;
  isEligible: () => boolean;
  canReward: () => boolean;
  registerBack: RegisterAdBack;
  adAvailable: boolean;
  adLastWatched?: string | null;
  weatherDisabled?: boolean;
}

export default function AdButton({ onAdComplete, getOwnerKey, isEligible, canReward, registerBack, adAvailable, adLastWatched, weatherDisabled }: Props) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const lastWatched = adLastWatched ? new Date(adLastWatched).getTime() : null;
  const remaining = lastWatched === null ? 0 : Math.max(0, AD_COOLDOWN_MS - (now - lastWatched));
  // Derive eligibility from a ticking clock; a stale parent memo cannot freeze the cooldown.
  const available = lastWatched === null ? adAvailable : Number.isFinite(remaining) && remaining === 0;
  const disabled = weatherDisabled || !available;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} disabled={disabled}
        className="w-full min-h-12 rounded-2xl p-3 text-left border active:scale-[0.99] disabled:opacity-60"
        style={{ backgroundColor: "var(--toss-surface-low)", borderColor: "var(--toss-outline-variant)", color: "var(--toss-on-surface)" }}>
        <span className="block text-base font-bold">광고 보상 안내</span>
        <span className="block text-sm leading-relaxed mt-1" style={{ color: "var(--toss-on-surface-variant)" }}>
          {weatherDisabled ? "햇빛이 있을 때 이용할 수 있어요 · 무료 돌봄은 가능해요" : available ? `광고 시청 완료 시 성장 XP +${AD_XP_REWARD} · 선택 사항` : Number.isFinite(remaining) ? `${minutes}분 ${String(seconds).padStart(2, "0")}초 후 이용 가능` : "보상 가능 시간을 확인하지 못했어요"}
        </span>
      </button>
      {open && <RewardedAdDialog title="성장 광고 안내" description={`광고 시청 완료가 확인되면 현재 식물에 성장 XP +${AD_XP_REWARD}을 받아요. 광고 없이도 무료로 돌볼 수 있어요.`}
        rewardText={`성장 XP +${AD_XP_REWARD}`} getOwnerKey={getOwnerKey} isEligible={isEligible} canReward={canReward}
        onReward={onAdComplete} registerBack={registerBack} onClose={() => setOpen(false)} />}
    </>
  );
}
