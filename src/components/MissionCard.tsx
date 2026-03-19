"use client";
import { Mission } from "@/types/plant";

interface Props {
  mission: Mission;
  isCompleted: boolean;
  onSelect: () => void;
}

export default function MissionCard({ mission, isCompleted, onSelect }: Props) {
  return (
    <button
      onClick={() => !isCompleted && onSelect()}
      disabled={isCompleted}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 transform active:scale-[0.98] ${
        isCompleted
          ? "bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 opacity-90"
          : "bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="text-2xl drop-shadow-sm flex-shrink-0 bg-white/50 dark:bg-black/20 w-10 h-10 rounded-xl flex justify-center items-center">
        {mission.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate transition-colors ${isCompleted ? "text-emerald-600 dark:text-emerald-400 line-through decoration-emerald-300" : "text-gray-800 dark:text-gray-100"}`}>
          {mission.label}
        </p>
        <p className="text-[11px] font-bold text-emerald-500/80 dark:text-emerald-400/80 mt-0.5 tracking-wide">
          +{mission.xpReward} XP
        </p>
      </div>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 ${
        isCompleted
          ? "border-emerald-500 bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          : "border-gray-300 dark:border-gray-600"
      }`}>
        {isCompleted
          ? <span className="text-white text-xs font-bold animate-fade-in-up">✓</span>
          : <span className="text-gray-300 dark:text-gray-600 text-[10px]">▶</span>
        }
      </div>
    </button>
  );
}
