"use client";
import { useEffect, useRef, useState } from "react";

export interface Creature {
  id: string;
  emoji: string;
  label: string;
  isPest: boolean;
  xpReward: number;
  statEffect?: { water?: number; sunlight?: number; health?: number };
  penalty?: { health: number };
  x: number; // % from left within container
  duration: number; // ms before auto-dismiss
}

interface Props {
  creature: Creature;
  onTap: (caught: boolean) => void;
  onPestTap?: () => void; // 해충 탭 시 광고 모달 트리거
}

export default function FloatingCreature({ creature, onTap, onPestTap }: Props) {
  const [tapped, setTapped] = useState(false);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExpired(true);
      setTimeout(() => onTap(false), 400);
    }, creature.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature.id]);

  const handleTap = () => {
    if (tapped || expired) return;
    if (creature.isPest && onPestTap) {
      // 해충: 타이머만 멈추고 모달에 위임
      if (timerRef.current) clearTimeout(timerRef.current);
      setTapped(true);
      onPestTap();
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setTapped(true);
    setTimeout(() => onTap(true), 300);
  };

  const dismissed = tapped || expired;

  return (
    <div
      className="absolute z-20 cursor-pointer select-none"
      style={{
        left: `${creature.x}%`,
        top: '18%',
        opacity: dismissed ? 0 : 1,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: dismissed ? 'scale(1.4) translateY(-8px)' : 'scale(1)',
        animation: dismissed ? undefined : 'float 2s ease-in-out infinite',
      }}
      onClick={handleTap}
    >
      <span className="text-4xl drop-shadow-lg">{creature.emoji}</span>
      {creature.isPest && !dismissed && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-red-500 font-bold whitespace-nowrap animate-pulse bg-white/80 dark:bg-black/60 px-1 rounded">
          잡아요!
        </div>
      )}
    </div>
  );
}
