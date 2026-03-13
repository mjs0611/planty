"use client";
import Image from "next/image";
import { ProgressBar } from "@toss/tds-mobile";
import { PlantStage } from "@/types/plant";
import { STAGE_INFO } from "@/lib/plantState";
import { useEffect, useState } from "react";

interface Props {
  stage: PlantStage;
  isWilting: boolean;
  isDead: boolean;
  xp: number;
  xpRequired: number;
  justLeveledUp?: boolean;
}

export default function PlantDisplay({ stage, isWilting, isDead, xp, xpRequired, justLeveledUp }: Props) {
  const [celebrating, setCelebrating] = useState(false);
  const info = STAGE_INFO[stage];
  const progress = Math.min(xp / xpRequired, 1);

  useEffect(() => {
    if (justLeveledUp) {
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 2000);
      return () => clearTimeout(t);
    }
  }, [justLeveledUp]);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Plant image */}
      <div
        className={`relative w-44 h-44 select-none transition-all duration-500 ${
          isDead ? 'grayscale opacity-40 rotate-12' :
          celebrating ? 'scale-110' : ''
        }`}
        style={{
          filter: isWilting && !isDead ? 'sepia(0.6) brightness(0.85)' : undefined,
          animation: isWilting && !isDead ? 'wilt 2s ease-in-out infinite' :
                     celebrating ? 'levelup 0.5s ease-in-out infinite' :
                     !isDead ? 'plantFloat 3s ease-in-out infinite' : undefined,
        }}
      >
        {isDead ? (
          <div className="text-[96px] leading-none flex items-center justify-center w-full h-full">🪦</div>
        ) : (
          <Image
            src={info.image}
            alt={info.name}
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        )}
      </div>

      {/* Stage name & description */}
      <div className="text-center">
        <p className="text-lg font-bold text-gray-800 dark:text-white">{info.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isDead ? '💀 식물이 떠났어요...' : isWilting ? '😢 식물이 힘들어요!' : info.description}
        </p>
      </div>

      {/* XP Progress bar */}
      {!isDead && stage !== 'special' && (
        <div className="w-full px-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>성장 진행도</span>
            <span>{xp} / {xpRequired} XP</span>
          </div>
          <ProgressBar
            progress={progress}
            size="normal"
            color="#00C473"
            animate
          />
        </div>
      )}
      {stage === 'special' && (
        <p className="text-sm font-medium text-yellow-500">✨ 최고 단계 달성!</p>
      )}
    </div>
  );
}
