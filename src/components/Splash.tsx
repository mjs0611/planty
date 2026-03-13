"use client";
import { useEffect, useState } from "react";

interface Props {
  onDone: () => void;
}

export default function Splash({ onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), 1400);
    const doneTimer = setTimeout(onDone, 1800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#00C473]"
      style={{
        transition: "opacity 400ms ease-out",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        className="flex flex-col items-center gap-4"
        style={{
          transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1), opacity 600ms ease",
          transform: visible ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.95)",
          opacity: visible ? 1 : 0,
        }}
      >
        <span className="text-7xl">🌿</span>
        <div className="text-center">
          <p className="text-3xl font-bold text-white tracking-tight">초록하루</p>
          <p className="text-sm text-white/70 mt-1">매일 돌봐주는 나의 가상 식물</p>
        </div>
      </div>
    </div>
  );
}
