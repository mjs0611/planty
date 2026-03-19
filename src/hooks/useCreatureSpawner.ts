"use client";
import { useEffect } from "react";
import type { Creature } from "@/components/FloatingCreature";
import { CREATURE_SPAWN_MIN_MS, CREATURE_SPAWN_RANGE_MS } from "@/lib/constants";

const CREATURE_POOL: Omit<Creature, 'id' | 'x'>[] = [
  { emoji: '🦋', label: '나비',    isPest: false, xpReward: 5, duration: 12000 },
  { emoji: '🐞', label: '무당벌레', isPest: false, xpReward: 3, statEffect: { health: 5 }, duration: 12000 },
  { emoji: '🐝', label: '꿀벌',    isPest: false, xpReward: 3, statEffect: { sunlight: 5 }, duration: 10000 },
  { emoji: '🐛', label: '해충',    isPest: true,  xpReward: 0, penalty: { health: -8 }, duration: 25000 },
];

interface Params {
  isActive: boolean;
  isDead: boolean;
  creature: Creature | null;
  onSpawn: (creature: Creature) => void;
}

export function useCreatureSpawner({ isActive, isDead, creature, onSpawn }: Params) {
  useEffect(() => {
    if (!isActive || isDead || creature !== null) return;

    const delay = CREATURE_SPAWN_MIN_MS + Math.random() * CREATURE_SPAWN_RANGE_MS;
    const timer = setTimeout(() => {
      const isPest = Math.random() < 0.25;
      const picked = isPest ? CREATURE_POOL[3] : CREATURE_POOL[Math.floor(Math.random() * 3)];
      onSpawn({ ...picked, id: Date.now().toString(), x: 15 + Math.random() * 55 });
    }, delay);

    return () => clearTimeout(timer);
  }, [isActive, isDead, creature, onSpawn]);
}
