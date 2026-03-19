"use client";
import { useState, useRef, useCallback } from "react";

const TOAST_DURATION_MS = 2500;

export function useToast() {
  const [toast, setToast] = useState({ open: false, message: "" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openToast = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ open: true, message });
    timerRef.current = setTimeout(
      () => setToast(prev => ({ ...prev, open: false })),
      TOAST_DURATION_MS,
    );
  }, []);

  return { toast, openToast };
}
