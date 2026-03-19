"use client";
import { useEffect, useRef } from "react";
import { saveState } from "@/lib/plantState";
import type { PlantState } from "@/types/plant";

const DEBOUNCE_MS = 500;

export function useDebouncedSave(plant: PlantState | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plantRef = useRef<PlantState | null>(plant);

  useEffect(() => {
    plantRef.current = plant;
    if (!plant) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveState(plant), DEBOUNCE_MS);
  }, [plant]);

  // 언마운트 시 pending 저장 flush
  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      if (plantRef.current) saveState(plantRef.current);
    }
  }, []);
}
