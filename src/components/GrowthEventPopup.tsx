"use client";
import { useEffect, useState } from "react";
import { GrowthEvent } from "@/types/plant";

interface Props {
  event: GrowthEvent | null;
  onDismiss: () => void;
}

export default function GrowthEventPopup({ event, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return;
    setVisible(true);
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(onDismiss, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [event, onDismiss]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ transition: "opacity 400ms ease", opacity: visible ? 1 : 0 }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl px-6 py-5 shadow-2xl flex flex-col items-center gap-2 mx-8"
        style={{
          transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
          transform: visible ? "scale(1)" : "scale(0.8)",
        }}
      >
        <span className="text-5xl">{event.emoji}</span>
        <p className="text-base font-bold text-gray-800 dark:text-white text-center">{event.message}</p>
        <p className="text-sm text-[#00C473] font-semibold">+{event.xpBonus} XP 보너스!</p>
      </div>
    </div>
  );
}
