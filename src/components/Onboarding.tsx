"use client";
import { useState, useRef, useEffect } from "react";
import { PlantType } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";

interface Props {
  onStart: (plantName?: string, plantType?: PlantType) => void;
}

const TOTAL_STEPS = 4;

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
  const [selectedType, setSelectedType] = useState<PlantType>("green");
  const [featureVisible, setFeatureVisible] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (step === 1) {
      setFeatureVisible(false);
      const t = setTimeout(() => setFeatureVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const goPrev = () => setStep(s => Math.max(s - 1, 0));
  const handleStart = () => onStart(name.trim() || undefined, selectedType);

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
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "#fbf9f8" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-14 pb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              backgroundColor:
                i === step ? "#004ecb" : i < step ? "#b3c5ff" : "#eae8e7",
            }}
          />
        ))}
      </div>

      {/* Back button */}
      <div className="h-10 flex items-center px-5">
        <button
          onClick={goPrev}
          className="transition-opacity duration-200 p-1"
          style={{
            opacity: step === 0 ? 0 : 1,
            pointerEvents: step === 0 ? "none" : "auto",
            color: "#424656",
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex h-full"
          style={{
            transform: `translateX(-${step * (100 / TOTAL_STEPS)}%)`,
            transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
            width: `${TOTAL_STEPS * 100}%`,
          }}
        >
          {/* ── Step 0: Hero ── */}
          <div
            className="flex flex-col items-center justify-center px-8"
            style={{ width: `${100 / TOTAL_STEPS}%` }}
          >
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <h1
                className="text-3xl font-extrabold tracking-tight"
                style={{
                  color: "#1b1c1c",
                  fontFamily: "var(--font-headline, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                🌿 플랜티
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "#424656" }}>
                매일 조금씩 돌봐주는<br />나만의 가상 식물이에요
              </p>
            </div>

            <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-40 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(99,253,187,0.35), transparent 70%)" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/plants/green/stage_1.png"
                alt="씨앗"
                className="w-4/5 h-4/5 object-contain drop-shadow-2xl relative z-10"
                style={{ animation: "breathe 4s ease-in-out infinite" }}
              />
              <div
                className="absolute -bottom-4 right-0 z-20 flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0 12px 32px -4px rgba(0,84,216,0.10)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#63fdbb" }}
                >
                  <span className="text-base">💧</span>
                </div>
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "#424656" }}
                  >
                    Health
                  </p>
                  <div
                    className="w-20 h-2 rounded-full mt-1 overflow-hidden"
                    style={{ backgroundColor: "#eae8e7" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "85%",
                        background: "linear-gradient(to right, #006c49, #63fdbb)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 1: How it works ── */}
          <div
            className="flex flex-col justify-center px-5"
            style={{ width: `${100 / TOTAL_STEPS}%` }}
          >
            <h2
              className="text-2xl font-extrabold text-center mb-6"
              style={{
                color: "#1b1c1c",
                fontFamily: "var(--font-headline, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              이렇게 키워요
            </h2>
            <div className="flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={f.emoji}
                  className="flex items-start gap-4 rounded-2xl p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 16px -4px rgba(0,84,216,0.06)",
                    opacity: featureVisible ? 1 : 0,
                    transform: featureVisible ? "translateY(0)" : "translateY(16px)",
                    transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.4s ease ${i * 0.1}s`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: "#f5f3f3" }}
                  >
                    {f.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#1b1c1c" }}>{f.title}</p>
                    <p
                      className="text-xs mt-1 leading-relaxed whitespace-pre-line"
                      style={{ color: "#424656" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 2: Choose plant type ── */}
          <div
            className="flex flex-col items-center justify-center px-8 text-center"
            style={{ width: `${100 / TOTAL_STEPS}%` }}
          >
            <h2
              className="text-2xl font-extrabold mb-2"
              style={{
                color: "#1b1c1c",
                fontFamily: "var(--font-headline, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              어떤 식물을<br />키울까요?
            </h2>
            <p className="text-sm mb-8" style={{ color: "#424656" }}>
              황금 식물로 키운 뒤 다음 종류로 이어져요
            </p>

            <div className="flex flex-col gap-3 w-full">
              {PLANT_TYPE_ORDER.map(type => {
                const info = PLANT_TYPE_INFO[type];
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.98]"
                    style={{
                      backgroundColor: isSelected ? "rgba(0,78,203,0.06)" : "#ffffff",
                      border: `2px solid ${isSelected ? "#004ecb" : "#eae8e7"}`,
                      boxShadow: isSelected ? "0 4px 16px -4px rgba(0,84,216,0.12)" : "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/plants/${type}/stage_1.png`}
                      alt={info.name}
                      className="w-14 h-14 object-contain flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: "#1b1c1c" }}>
                        {info.emoji} {info.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#424656" }}>{info.desc}</p>
                    </div>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#004ecb" }}
                      >
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step 3: Name your plant ── */}
          <div
            className="flex flex-col items-center justify-center px-8 text-center"
            style={{ width: `${100 / TOTAL_STEPS}%` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/plants/${selectedType}/stage_1.png`}
              alt="씨앗"
              className="w-32 h-32 object-contain drop-shadow-lg mb-6"
              style={{ animation: "breathe 4s ease-in-out infinite" }}
            />
            <h2
              className="text-2xl font-extrabold mb-2"
              style={{
                color: "#1b1c1c",
                fontFamily: "var(--font-headline, 'Plus Jakarta Sans', sans-serif)",
              }}
            >
              이 씨앗에게<br />이름을 지어줄까요?
            </h2>
            <p className="text-sm mb-6" style={{ color: "#424656" }}>
              나중에 언제든 바꿀 수 있어요
            </p>

            <div className="w-full relative">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 봄이, 초록이, 미미..."
                maxLength={12}
                className="w-full rounded-2xl px-4 py-4 text-base focus:outline-none transition-all duration-200 text-center"
                style={{
                  backgroundColor: "#f5f3f3",
                  color: "#1b1c1c",
                  border: "none",
                  fontFamily: "inherit",
                }}
                onFocus={e => {
                  e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,78,203,0.25)";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "#f5f3f3";
                }}
              />
              {name && (
                <button
                  onClick={() => setName("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                  style={{ color: "#9ca3af" }}
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex justify-between w-full mt-2 px-1">
              <span className="text-[11px]" style={{ color: "#9ca3af" }}>
                {name.trim() ? `"${name.trim()}"` : "이름 없이도 괜찮아요"}
              </span>
              <span className="text-[11px]" style={{ color: "#9ca3af" }}>{name.length}/12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-12 pt-4 flex flex-col gap-2">
        <button
          onClick={step < TOTAL_STEPS - 1 ? goNext : handleStart}
          className="w-full py-5 rounded-2xl text-base font-bold text-white transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #004ecb 0%, #0064ff 100%)",
            boxShadow: "0 12px 32px -4px rgba(0,84,216,0.20)",
            fontFamily: "var(--font-headline, sans-serif)",
          }}
        >
          {ctaLabel}
        </button>

        {step === TOTAL_STEPS - 1 && (
          <button
            onClick={() => onStart(undefined, selectedType)}
            className="text-sm py-2 transition-colors"
            style={{ color: "#424656" }}
          >
            이름 없이 시작하기
          </button>
        )}
      </div>

      {/* Ambient blobs */}
      <div
        className="fixed top-[15%] left-[8%] w-16 h-16 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: "rgba(99,253,187,0.18)" }}
      />
      <div
        className="fixed bottom-[22%] right-[5%] w-28 h-28 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: "rgba(179,197,255,0.18)" }}
      />
    </div>
  );
}
