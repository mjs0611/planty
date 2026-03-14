"use client";
import Image from "next/image";
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
    <div className="flex flex-col items-center gap-4 py-6">
      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-6xl animate-bounce">🎉</div>
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
        className={`relative w-44 h-44 select-none transition-all duration-500 ${
          isDead ? 'grayscale opacity-40 rotate-12' :
          celebrating ? 'scale-110' : ''
        }`}
        style={{
          filter: isDead ? undefined :
                  isWilting ? `sepia(0.6) brightness(0.85) hue-rotate(${typeInfo.hueRotate}deg)` :
                  typeInfo.hueRotate ? `hue-rotate(${typeInfo.hueRotate}deg)` : undefined,
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

      {/* XP Progress */}
      {!isDead && stage !== 'special' && (
        <div className="w-full px-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>성장 진행도</span>
            <span>{xp} / {xpRequired} XP</span>
          </div>
          <ProgressBar progress={progress} size="normal" color="#00C473" animate />
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
