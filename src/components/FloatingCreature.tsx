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
  onPestTap?: () => void;
}

export default function FloatingCreature({ creature, onTap, onPestTap }: Props) {
  const [tapped, setTapped] = useState(false);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExpired(true);
      if (handledRef.current) return;
      handledRef.current = true;
      settleRef.current = setTimeout(() => onTap(false), 400);
    }, creature.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); if (settleRef.current) clearTimeout(settleRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature.id]);

  const handleTap = () => {
    if (handledRef.current || tapped || expired) return;
    handledRef.current = true;
    if (creature.isPest && onPestTap) {
      // 해충: 타이머만 멈추고 모달에 위임
      if (timerRef.current) clearTimeout(timerRef.current);
      setTapped(true);
      onPestTap();
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setTapped(true);
    settleRef.current = setTimeout(() => onTap(true), 300);
  };

  const dismissed = tapped || expired;

  return (
    <button type="button" aria-label={creature.isPest ? "해충 무료 보내기" : `${creature.label} 잡기`}
      className="absolute z-20 cursor-pointer select-none min-h-11 min-w-11"
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
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-red-600 font-bold whitespace-nowrap bg-white dark:bg-black px-2 py-1 rounded">
          무료 보내기
        </span>
      )}
    </button>
  );
}
