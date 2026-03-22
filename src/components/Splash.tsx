import { useEffect, useState } from "react";
import { CuteSproutSplash } from "./icons";

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #f0faf4 0%, #e0f5ea 100%)",
        transition: "opacity 400ms ease-out",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1), opacity 600ms ease",
          transform: visible ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.95)",
          opacity: visible ? 1 : 0,
        }}
        className="flex flex-col items-center gap-4"
      >
        <div className="drop-shadow-[0_8px_16px_rgba(34,197,94,0.3)]">
          <CuteSproutSplash className="w-32 h-32" />
        </div>
        <div className="text-center">
          <p
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#1b4332", fontFamily: "var(--font-headline, 'Plus Jakarta Sans', sans-serif)" }}
          >
            플랜티
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(27,67,50,0.55)" }}>
            매일 돌봐주는 나의 가상 식물
          </p>
        </div>
      </div>
    </div>
  );
}
