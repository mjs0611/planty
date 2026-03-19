"use client";
import { Button } from "@toss/tds-mobile";
import { PlantStage, PlantType } from "@/types/plant";
import { STAGE_INFO } from "@/lib/plantState";
import { PLANT_TYPE_INFO } from "@/lib/season";
import { COMBO_MILESTONE_NUMBERS, COMBO_MILESTONES } from "@/lib/constants";
import { useEffect, useState, useRef, useCallback } from "react";

interface Props {
  stage: PlantStage;
  plantType: PlantType;
  isWilting: boolean;
  isDead: boolean;
  xp: number;
  xpRequired: number;
  justLeveledUp?: boolean;
  onGraduate?: () => void;
  onComboTap?: (combo: number) => void;
}

type Particle = { id: number; x: number; y: number; emoji: string; big: boolean };

export default function PlantDisplay({
  stage, plantType, isWilting, isDead, xp, xpRequired,
  justLeveledUp, onGraduate, onComboTap,
}: Props) {
  const [celebrating, setCelebrating] = useState(false);
  const info = STAGE_INFO[stage];
  const typeInfo = PLANT_TYPE_INFO[plantType];
  const progress = Math.min(xp / xpRequired, 1);

  // Combo state
  const [combo, setCombo] = useState(0);
  const [comboBadgeKey, setComboBadgeKey] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const comboResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const squishRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (justLeveledUp) {
      setCelebrating(true);
      const t = setTimeout(() => setCelebrating(false), 2000);
      return () => clearTimeout(t);
    }
  }, [justLeveledUp]);

  const doSquish = useCallback(() => {
    const el = squishRef.current;
    if (!el) return;
    el.style.transition = "transform 0.07s ease-in";
    el.style.transform = "scale(0.86)";
    setTimeout(() => {
      if (!squishRef.current) return;
      squishRef.current.style.transition = "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)";
      squishRef.current.style.transform = "scale(1)";
    }, 75);
  }, []);

  const handlePlantTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDead) return;

    // Particle position relative to container
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (comboResetRef.current) clearTimeout(comboResetRef.current);

    setCombo(prev => {
      const next = prev + 1;
      const isMil = COMBO_MILESTONE_NUMBERS.has(next);

      // Particle
      const milestoneEntry = COMBO_MILESTONES.find(m => m.combo === next);
      const emoji = isMil ? (milestoneEntry?.emoji ?? "✨") : "💚";
      setParticles(p => [...p, { id: Date.now() + Math.random(), x, y, emoji, big: isMil }]);

      // Badge pop
      setComboBadgeKey(k => k + 1);

      // Milestone flash
      if (isMil) {
        setIsMilestone(true);
        setTimeout(() => setIsMilestone(false), 500);
      }

      onComboTap?.(next);
      return next;
    });

    doSquish();

    comboResetRef.current = setTimeout(() => setCombo(0), 1500);
  }, [isDead, doSquish, onComboTap]);

  // Clean up particles
  useEffect(() => {
    if (!particles.length) return;
    const t = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(t);
  }, [particles]);

  useEffect(() => () => {
    if (comboResetRef.current) clearTimeout(comboResetRef.current);
  }, []);

  // Combo badge color
  const badgeColor =
    combo >= 30 ? "bg-yellow-400 text-yellow-900 shadow-[0_0_12px_rgba(250,204,21,0.6)]" :
    combo >= 20 ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" :
    combo >= 10 ? "bg-orange-400 text-white shadow-[0_0_8px_rgba(251,146,60,0.5)]" :
    combo >= 5  ? "bg-emerald-400 text-white shadow-sm" :
                  "bg-emerald-200 text-emerald-800";

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-7xl animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">🎉</div>
        </div>
      )}

      {/* Plant type badge */}
      {plantType !== "green" && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 rounded-full px-2 py-0.5 backdrop-blur-sm">
          <span className="text-xs">{typeInfo.emoji}</span>
          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{typeInfo.name}</span>
        </div>
      )}

      {/* Tappable plant area */}
      <div
        ref={containerRef}
        className="relative w-48 h-48 cursor-pointer select-none"
        onClick={handlePlantTap}
      >
        {/* Squish wrapper */}
        <div ref={squishRef} className="w-full h-full">
          <div
            className={`relative w-full h-full transition-all duration-500 ${
              isDead ? "grayscale opacity-40 rotate-[15deg]" :
              !isWilting && !celebrating ? "animate-breathe" : ""
            }`}
            style={{
              filter: isDead ? undefined :
                isWilting ? `sepia(0.6) brightness(0.85) hue-rotate(${typeInfo.hueRotate}deg)` :
                isMilestone ? `hue-rotate(${typeInfo.hueRotate}deg) brightness(1.35) drop-shadow(0 0 12px rgba(255,255,255,0.6))` :
                typeInfo.hueRotate ? `hue-rotate(${typeInfo.hueRotate}deg)` : undefined,
              animation: isWilting && !isDead ? "wilt 3s ease-in-out infinite" :
                celebrating ? "levelup-burst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            }}
          >
            {isDead ? (
              <div className="text-[96px] leading-none flex items-center justify-center w-full h-full">🪦</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.image} alt={info.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            )}
          </div>
        </div>

        {/* Tap particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="absolute pointer-events-none animate-float-up"
            style={{
              left: p.x - (p.big ? 16 : 10),
              top: p.y - (p.big ? 16 : 10),
              fontSize: p.big ? "2rem" : "1.1rem",
              zIndex: 20,
            }}
          >
            {p.emoji}
          </span>
        ))}

        {/* Combo badge */}
        {combo > 1 && !isDead && (
          <div
            key={comboBadgeKey}
            className={`absolute -top-3 -right-3 text-xs font-bold rounded-full px-2 py-0.5 min-w-[32px] text-center animate-combo-pop ${badgeColor}`}
          >
            x{combo}
          </div>
        )}

        {/* Tap hint when idle */}
        {combo === 0 && !isDead && !isWilting && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-300 dark:text-gray-600 whitespace-nowrap pointer-events-none">
            탭해서 교감하기
          </div>
        )}
      </div>

      {/* Stage name & description */}
      <div className="text-center mt-2">
        <p className="text-lg font-bold text-gray-800 dark:text-white">{info.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isDead ? "💀 식물이 떠났어요..." : isWilting ? "😢 식물이 힘들어요!" : info.description}
        </p>
      </div>

      {/* XP Progress */}
      {!isDead && stage !== "special" && (
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
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Graduation */}
      {stage === "special" && (
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
