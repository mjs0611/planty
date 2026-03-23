"use client";
import { Button } from "@toss/tds-mobile";
import { PlantStage, PlantType } from "@/types/plant";
import { STAGE_INFO } from "@/lib/plantState";
import { PLANT_TYPE_INFO } from "@/lib/season";
import PlantCharacter from "./PlantCharacter";
import { COMBO_MILESTONE_NUMBERS, COMBO_MILESTONES } from "@/lib/constants";
import { CutePopper, CuteHeart, CuteSparkle } from "./icons";
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
  onTapStatBoost?: () => void; // 탭 시 건강 증가 알림
  compact?: boolean;
}

type Particle = { id: number; x: number; y: number; node: React.ReactNode; big: boolean };

export default function PlantDisplay({
  stage, plantType, isWilting, isDead, xp, xpRequired,
  justLeveledUp, onGraduate, onComboTap, onTapStatBoost, compact = false,
}: Props) {
  const [celebrating, setCelebrating] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const info = STAGE_INFO[stage];
  const typeInfo = PLANT_TYPE_INFO[plantType];

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

    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (comboResetRef.current) clearTimeout(comboResetRef.current);

    setCombo(prev => {
      const next = prev + 1;
      const isMil = COMBO_MILESTONE_NUMBERS.has(next);
      const node = isMil ? <CuteSparkle className="w-8 h-8 drop-shadow-md" color="#FDE047" /> : <CuteHeart className="w-5 h-5 drop-shadow-sm" />;
      setParticles(p => [...p, { id: Date.now() + Math.random(), x, y, node, big: isMil }]);

      setComboBadgeKey(k => k + 1);

      if (isMil) {
        setIsMilestone(true);
        setTimeout(() => setIsMilestone(false), 500);
      }

      onComboTap?.(next);
      return next;
    });

    // 매 탭마다 건강 증가 시도
    onTapStatBoost?.();

    doSquish();
    comboResetRef.current = setTimeout(() => setCombo(0), 1500);
  }, [isDead, doSquish, onComboTap, onTapStatBoost]);

  // 외부에서 건강 증가가 일어났을 때 행복 애니메이션 트리거
  // onTapStatBoost가 호출된 직후 parent에서 상태 업데이트 → 여기선 자체적으로 타이밍 처리
  const triggerHappy = useCallback(() => {
    setIsHappy(true);
    // 행복 파티클 추가
    const cx = containerRef.current ? containerRef.current.offsetWidth / 2 : 80;
    const cy = containerRef.current ? containerRef.current.offsetHeight / 2 : 80;
    setParticles(p => [
      ...p,
      { id: Date.now() + 0.1, x: cx - 20, y: cy - 30, node: <CuteHeart className="w-6 h-6 drop-shadow-md" color="#F43F5E" />, big: false },
      { id: Date.now() + 0.2, x: cx + 10, y: cy - 50, node: <CuteSparkle className="w-6 h-6 drop-shadow-md" color="#FDE047" />, big: false },
    ]);
    setTimeout(() => setIsHappy(false), 700);
  }, []);

  // onTapStatBoost가 호출될 때마다 행복 애니메이션
  const prevTapRef = useRef(0);
  const handleTapWithHappy = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    prevTapRef.current = Date.now();
    handlePlantTap(e);
    // 100ms 후 부모가 state 업데이트 → 건강이 실제로 올랐을 가능성이 높으면 happy 트리거
    setTimeout(() => triggerHappy(), 80);
  }, [handlePlantTap, triggerHappy]);

  useEffect(() => {
    if (!particles.length) return;
    const t = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(t);
  }, [particles]);

  useEffect(() => () => {
    if (comboResetRef.current) clearTimeout(comboResetRef.current);
  }, []);

  // ── Compact mode ─────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className="relative flex-shrink-0" ref={containerRef} onClick={handleTapWithHappy}>
        <div
          ref={squishRef}
          className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer select-none overflow-visible"
          style={{
            backgroundColor: "rgba(0,100,255,0.06)",
            animation: !isDead && !isWilting ? "planet-float 4.5s ease-in-out infinite" : undefined,
            transformOrigin: "center bottom",
            filter: isDead ? "grayscale(80%) opacity(0.5)" : isWilting ? "sepia(0.5) brightness(0.85)" : undefined,
          }}
        >
          {isDead ? (
            <span className="text-4xl">🪦</span>
          ) : (
            <PlantCharacter stage={stage} plantType={plantType} isWilting={isWilting} isDead={isDead} isHappy={isHappy} className="w-16 h-16" />
          )}
        </div>
        {particles.map(p => (
          <span
            key={p.id}
            className="absolute pointer-events-none animate-float-up z-20"
            style={{ left: p.x - 12, top: p.y - 12 }}
          >
            {p.node}
          </span>
        ))}
        {combo > 1 && !isDead && (
          <div
            key={comboBadgeKey}
            className="absolute -top-2 -right-2 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[24px] text-center animate-combo-pop bg-yellow-400 text-yellow-900"
          >
            x{combo}
          </div>
        )}
      </div>
    );
  }

  // ── Combo badge color ─────────────────────────────────────────────────────
  const badgeColor =
    combo >= 30 ? "bg-yellow-400 text-yellow-900 shadow-[0_0_12px_rgba(250,204,21,0.6)]" :
    combo >= 20 ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" :
    combo >= 10 ? "bg-orange-400 text-white shadow-[0_0_8px_rgba(251,146,60,0.5)]" :
    combo >= 5  ? "bg-emerald-400 text-white shadow-sm" :
                  "bg-emerald-200 text-emerald-800";

  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]"><CutePopper className="w-32 h-32" /></div>
        </div>
      )}

      {/* Plant type badge */}
      {plantType !== "green" && (
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2 py-0.5 backdrop-blur-sm"
          style={{ backgroundColor: "var(--toss-surface-lowest)", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <span className="text-xs">{typeInfo.emoji}</span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>{typeInfo.name}</span>
        </div>
      )}

      {/* Tappable plant area */}
      <div
        ref={containerRef}
        className="relative w-64 h-64 cursor-pointer select-none mx-auto"
        onClick={handleTapWithHappy}
      >
        {/* Squish wrapper */}
        <div ref={squishRef} className="w-full h-full">
          <div
            className={`relative w-full h-full transition-all duration-500 ${
              isDead ? "grayscale opacity-40 rotate-[15deg]" :
              !isWilting && !celebrating && !isHappy ? "animate-planet-float" : ""
            }`}
            style={{
              filter: isDead ? undefined :
                isHappy ? "brightness(1.15) drop-shadow(0 0 14px rgba(63,224,161,0.7))" :
                isWilting ? "sepia(0.6) brightness(0.85)" :
                isMilestone ? "brightness(1.35) drop-shadow(0 0 12px rgba(255,255,255,0.6))" :
                undefined,
              animation: isWilting && !isDead ? "wilt 3s ease-in-out infinite" :
                celebrating ? "levelup-burst 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" :
                isHappy ? "happy-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            }}
          >
            {isDead ? (
              <div className="text-[96px] leading-none flex items-center justify-center w-full h-full">🪦</div>
            ) : (
              <PlantCharacter stage={stage} plantType={plantType} isWilting={isWilting} isDead={isDead} isHappy={isHappy} className="w-full h-full" />
            )}
          </div>
        </div>

        {/* Tap particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="absolute pointer-events-none animate-float-up z-20"
            style={{
              left: p.x - (p.big ? 16 : 10),
              top: p.y - (p.big ? 16 : 10),
            }}
          >
            {p.node}
          </span>
        ))}

        {/* Combo badge */}
        {combo > 1 && !isDead && (
          <div
            key={comboBadgeKey}
            className={`absolute -top-10 left-1/2 -translate-x-1/2 text-sm font-black rounded-full px-2 py-0.5 min-w-[40px] text-center animate-combo-pop z-20 ${badgeColor}`}
          >
            x{combo}
          </div>
        )}
      </div>

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
