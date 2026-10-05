"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveState } from "@/lib/plantState";
import type { PlantState } from "@/types/plant";

const DEBOUNCE_MS = 500;

export function useDebouncedSave(plant: PlantState | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const plantRef = useRef<PlantState | null>(plant);
  const [saveFailed, setSaveFailed] = useState(false);

  const retrySave = useCallback(() => {
    if (!plantRef.current) return false;
    const saved = saveState(plantRef.current);
    setSaveFailed(!saved);
    return saved;
  }, []);

  useEffect(() => {
    plantRef.current = plant;
    if (!plant) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      retrySave();
    }, DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [plant, retrySave]);

  // Closing/backgrounding before the debounce finishes must not lose the last care.
  useEffect(() => {
    const flush = () => { retrySave(); };
    const onVisibility = () => { if (document.hidden) flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (plantRef.current) saveState(plantRef.current);
    };
  }, [retrySave]);

  return { saveFailed, retrySave };
}
