"use client";
import { Button, ProgressBar } from "@toss/tds-mobile";
import { PlantStage, PlantType } from "@/types/plant";
import { STAGE_INFO } from "@/lib/plantState";
import { PLANT_TYPE_INFO } from "@/lib/season";
import { useEffect, useState } from "react";

interface Props {
  stage: PlantStage;
  plantType: PlantType;
  isWilting: boolean;
  isDead: boolean;
  xp: number;
  xpRequired: number;
  justLeveledUp?: boolean;
  onGraduate?: () => void;
}

export default function PlantDisplay({ stage, plantType, isWilting, isDead, xp, xpRequired, justLeveledUp, onGraduate }: Props) {
  const [celebrating, setCelebrating] = useState(false);
  const info = STAGE_INFO[stage];
  const typeInfo = PLANT_TYPE_INFO[plantType];
  const progress = Math.min(xp / xpRequired, 1);

  useEffect(() => {
    if (justLeveledUp) {
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 2000);
      return () => clearTimeout(t);
    }
  }, [justLeveledUp]);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-7xl animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">🎉</div>
        </div>
      )}

      {/* Plant type badge */}
      {plantType !== 'green' && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 rounded-full px-2 py-0.5 backdrop-blur-sm">
          <span className="text-xs">{typeInfo.emoji}</span>
          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{typeInfo.name}</span>
        </div>
      )}

      {/* Plant image */}
      <div
        className={`relative w-48 h-48 select-none transition-all duration-500 ${isDead ? 'grayscale opacity-40 rotate-[15deg]' :
            !isWilting && !celebrating ? 'animate-breathe' : ''
          }`}
        style={{
          filter: isDead ? undefined :
            isWilting ? `sepia(0.6) brightness(0.85) hue-rotate(${typeInfo.hueRotate}deg)` :
              typeInfo.hueRotate ? `hue-rotate(${typeInfo.hueRotate}deg)` : undefined,
          animation: isWilting && !isDead ? 'wilt 3s ease-in-out infinite' :
            celebrating ? 'levelup-burst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
        }}
      >
        {isDead ? (
          <div className="text-[96px] leading-none flex items-center justify-center w-full h-full">🪦</div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={info.image}
            alt={info.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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

      {/* XP Progress */}
      {!isDead && stage !== 'special' && (
        <div className="w-full px-6">
          <div className="flex justify-between text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">
            <span>성장도</span>
            <span>{xp} / {xpRequired} XP</span>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-full h-3.5 overflow-hidden shadow-inner border border-emerald-200/50 dark:border-emerald-700/30">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-400 rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${progress * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Graduation */}
      {stage === 'special' && (
        <div className="w-full px-4 flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-yellow-500">✨ 황금 식물 달성!</p>
          {onGraduate && (
            <Button display="full" color="primary" size="large" onClick={onGraduate}>
              🎓 졸업하고 새 식물 키우기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
