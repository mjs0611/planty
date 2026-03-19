"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@toss/tds-mobile";

interface Props {
  onStart: (plantName?: string) => void;
}

const TOTAL_STEPS = 3;

const FEATURES = [
  {
    emoji: "🌿",
    title: "미션 완료 → 식물 성장",
    desc: "하루 최대 12개 미션을 완료하면\n식물이 씨앗에서 황금 식물까지 자라요",
  },
  {
    emoji: "🔥",
    title: "연속 케어 스트릭",
    desc: "매일 빠짐없이 돌볼수록\n특별한 보너스와 배지를 얻어요",
  },
  {
    emoji: "✨",
    title: "식물과 교감",
    desc: "식물을 탭하거나 연타하면\n특별한 이벤트와 보상이 생겨요",
  },
];

export default function Onboarding({ onStart }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [featureVisible, setFeatureVisible] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger feature cards animation when entering step 1
  useEffect(() => {
    if (step === 1) {
      setFeatureVisible(false);
      const t = setTimeout(() => setFeatureVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const goPrev = () => setStep(s => Math.max(s - 1, 0));

  const handleStart = () => onStart(name.trim() || undefined);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 48 && step < TOTAL_STEPS - 1) goNext();
    else if (diff < -48 && step > 0) goPrev();
  };

  const ctaLabel = (() => {
    if (step < TOTAL_STEPS - 1) return "다음";
    if (name.trim()) return `${name.trim()}와 함께 시작하기 🌱`;
    return "시작하기 🌱";
  })();

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-[#09100D] dark:to-[#09100D] flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar: back + progress dots */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={goPrev}
          className={`text-gray-400 dark:text-gray-500 transition-opacity duration-200 p-1 ${step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-2 bg-emerald-500"
                  : i < step
                  ? "w-2 h-2 bg-emerald-300 dark:bg-emerald-700"
                  : "w-2 h-2 bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="w-7" /> {/* spacer */}
      </div>

      {/* Slides */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${step * 100}%)`,
            transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
            width: `${TOTAL_STEPS * 100}%`,
          }}
        >
          {/* ── Step 0: Hero ── */}
          <div className="flex flex-col items-center justify-center px-8 text-center" style={{ width: `${100 / TOTAL_STEPS}%` }}>
            <div
              className="mb-8 relative"
              style={{ animation: "breathe 4s ease-in-out infinite" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/plants/stage_1_seed_cute.png"
                alt="씨앗"
                className="w-52 h-52 object-contain drop-shadow-xl"
              />
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-emerald-300/20 blur-2xl -z-10 scale-75" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3 tracking-tight">
              플랜티 🌿
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              매일 조금씩 돌봐주는<br />나만의 가상 식물이에요
            </p>
          </div>

          {/* ── Step 1: How it works ── */}
          <div className="flex flex-col justify-center px-5" style={{ width: `${100 / TOTAL_STEPS}%` }}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
              이렇게 키워요
            </h2>
            <div className="flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={f.emoji}
                  className="flex items-start gap-4 bg-white dark:bg-gray-800/60 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50"
                  style={{
                    opacity: featureVisible ? 1 : 0,
                    transform: featureVisible ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-2xl flex-shrink-0">
                    {f.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{f.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed whitespace-pre-line">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 2: Name your plant ── */}
          <div className="flex flex-col items-center justify-center px-8 text-center" style={{ width: `${100 / TOTAL_STEPS}%` }}>
            <div
              className="mb-6 relative"
              style={{ animation: "breathe 4s ease-in-out infinite" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/plants/stage_1_seed_cute.png"
                alt="씨앗"
                className="w-36 h-36 object-contain drop-shadow-lg"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              이 씨앗에게<br />이름을 지어줄까요?
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              나중에 언제든 바꿀 수 있어요
            </p>

            <div className="w-full relative">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 봄이, 초록이, 미미..."
                maxLength={12}
                className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-400 dark:focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors text-center placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
              {name && (
                <button
                  onClick={() => setName("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 text-lg"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex justify-between w-full mt-2 px-1">
              <span className="text-[11px] text-gray-300 dark:text-gray-600">
                {name.trim() ? `"${name.trim()}"` : "이름 없이도 괜찮아요"}
              </span>
              <span className="text-[11px] text-gray-300 dark:text-gray-600">{name.length}/12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-12 pt-4 flex flex-col gap-2">
        <Button
          display="full"
          color="primary"
          size="xlarge"
          onClick={step < TOTAL_STEPS - 1 ? goNext : handleStart}
        >
          {ctaLabel}
        </Button>

        {step === TOTAL_STEPS - 1 && (
          <button
            onClick={() => onStart(undefined)}
            className="text-sm text-gray-400 dark:text-gray-500 py-2 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            이름 없이 시작하기
          </button>
        )}
      </div>
    </div>
  );
}
