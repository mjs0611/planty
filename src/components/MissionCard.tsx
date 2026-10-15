"use client";
import { Mission } from "@/types/plant";

interface Props {
  mission: Mission;
  isCompleted: boolean;
  onSelect: () => void;
}

function getIconBg(emoji: string): string {
  if (["💧", "🌊", "🚿"].some(e => emoji.includes(e[0]))) return "rgba(0,100,255,0.08)";
  if (["☀️", "🌤", "🌞"].some(e => emoji.includes(e[0]))) return "rgba(255,149,0,0.10)";
  if (["🌿", "🍃", "🌱", "🌾"].some(e => emoji.includes(e[0]))) return "rgba(0,108,73,0.10)";
  return "rgba(0,78,203,0.06)";
}

export default function MissionCard({ mission, isCompleted, onSelect }: Props) {
  return (
    <button
      onClick={() => !isCompleted && onSelect()}
      disabled={isCompleted}
      className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors duration-150"
    >
      {/* Icon + text */}
      <div className="flex flex-1 min-w-0 items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{
            backgroundColor: isCompleted ? "var(--toss-surface-high, #eae8e7)" : getIconBg(mission.emoji),
          }}
        >
          {mission.emoji}
        </div>
        <div className="min-w-0 [overflow-wrap:anywhere]">
          <p
            className="text-[16px] font-bold leading-snug"
            style={{
              color: "var(--toss-on-surface)",
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {mission.label}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-bold" style={{ color: isCompleted ? "var(--toss-on-surface-variant)" : "var(--toss-primary)" }}>
              +{mission.xpReward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Action */}
      {isCompleted ? (
        <div
          className="flex items-center gap-1 font-bold text-sm px-3 py-2 rounded-[8px] flex-shrink-0"
          style={{ backgroundColor: "var(--toss-surface-low)", color: "var(--toss-secondary)" }}
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>완료</span>
        </div>
      ) : (
        <span
          className="text-sm font-bold px-3 py-2 rounded-[8px] flex-shrink-0 transition-transform"
          style={{ backgroundColor: "var(--toss-surface-low)", color: "var(--toss-on-surface-variant)" }}
        >
          하기
        </span>
      )}
    </button>
  );
}
