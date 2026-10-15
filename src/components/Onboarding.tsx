"use client";
import { useState, useRef, useEffect } from "react";
import { PlantType } from "@/types/plant";

// page.tsx의 뒤로가기 처리가 온보딩 중에 부르는 단계 되돌리기
export let onboardingBack: (() => boolean) | null = null;

interface Props {
  onStart: (plantName?: string) => void;
  plantType?: PlantType;
}

const TOTAL_STEPS = 3;
const FEATURES = [
  {
    emoji: "🌿",
    title: "미션을 마치면 자라요",
    desc: "하루 최대 12개 미션을 완료하면\n식물이 씨앗에서 황금 식물까지 자라요",
  },
  {
    emoji: "🔥",
    title: "매일 이어서 돌봐요",
    desc: "매일 빠짐없이 돌볼수록\n특별한 보너스와 배지를 얻어요",
  },
  {
    emoji: "✨",
    title: "식물을 눌러 교감해요",
    desc: "식물을 탭하거나 연타하면\n특별한 이벤트와 보상이 생겨요",
  },
];

export default function Onboarding({ onStart, plantType = "green" }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus();
    previousStep.current = step;
    onboardingBack = () => { if (step === 0) return false; setStep(s => Math.max(s - 1, 0)); return true; };
    return () => { onboardingBack = null; };
  }, [step]);

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const goPrev = () => setStep(s => Math.max(s - 1, 0));
  const handleStart = () => onStart(name.trim() || undefined);
  const ctaLabel = step < TOTAL_STEPS - 1 ? "다음" : name.trim() ? `${name.trim()}와 함께 시작하기 🌱` : "시작하기 🌱";

  return (
    <main className="onboarding"
      onTouchStart={e => {
        if ((e.target as HTMLElement).closest("input, button")) return;
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={e => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const dx = start.x - e.changedTouches[0].clientX;
        const dy = start.y - e.changedTouches[0].clientY;
        if (Math.abs(dx) <= Math.abs(dy)) return;
        if (dx > 48) goNext();
        else if (dx < -48) goPrev();
      }}
      onTouchCancel={() => { touchStart.current = null; }}
    >
      <header className="onboarding-progress">
        {step > 0 ? <button onClick={goPrev} className="text-sm font-semibold">‹ 이전</button> : <span />}
        <p aria-label={`온보딩 ${step + 1} / ${TOTAL_STEPS}단계`} className="text-sm font-semibold tabular-nums">{step + 1} / {TOTAL_STEPS}</p>
        <span />
      </header>

      {/* Only the current slide is mounted, keeping hidden inputs out of the tab order. */}
      <section className="onboarding-slide" aria-labelledby="onboarding-title" key={step}>
        {step === 0 && <>
          <div className="text-center mb-8">
            <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-3xl font-extrabold tracking-tight">🌿 플랜티</h1>
            <p className="text-base leading-relaxed mt-4" style={{ color: "var(--toss-on-surface-variant)" }}>
              매일 조금씩 돌봐주는<br />나만의 가상 식물이에요
            </p>
          </div>
          <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/plants/${plantType}/stage_1.png`} alt="화분 속 씨앗" className="w-4/5 h-4/5 object-contain drop-shadow-2xl animate-breathe" />
            <div className="absolute bottom-0 right-0 flex items-center gap-3 rounded-2xl px-4 py-3 toss-card shadow-lg">
              <span aria-hidden="true" className="text-2xl">💧</span>
              <div>
                <p className="text-sm font-semibold">수분</p>
                <div className="w-20 h-2 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: "var(--toss-surface-high)" }}>
                  <div className="h-full rounded-full w-[85%]" style={{ background: "linear-gradient(to right, #006c49, #63fdbb)" }} />
                </div>
              </div>
            </div>
          </div>
        </>}

        {step === 1 && <>
          <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold text-center mb-6">이렇게 키워요</h1>
          <div className="w-full flex flex-col gap-3">
            {FEATURES.map(f => (
              <div key={f.emoji} className="flex items-start gap-3 rounded-2xl p-4 toss-card">
                <div aria-hidden="true" className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: "var(--toss-surface-low)" }}>{f.emoji}</div>
                <div className="min-w-0">
                  <p className="text-base font-bold">{f.title}</p>
                  <p className="text-sm mt-1 leading-relaxed whitespace-pre-line" style={{ color: "var(--toss-on-surface-variant)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>}

        {step === 2 && <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/plants/${plantType}/stage_1.png`} alt="씨앗" className="w-32 h-32 object-contain drop-shadow-lg mb-6 animate-breathe" />
          <h1 id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold mb-2 text-center">이 씨앗에게<br />이름을 지어줄까요?</h1>
          <p className="text-sm mb-6 text-center" style={{ color: "var(--toss-on-surface-variant)" }}>나중에 언제든 바꿀 수 있어요</p>
          <label htmlFor="onboarding-name" className="w-full text-sm font-semibold mb-2">식물 이름 (선택)</label>
          <div className="w-full relative">
            <input id="onboarding-name" ref={nameRef} value={name} onChange={e => setName(e.target.value)}
              placeholder="예: 봄이, 초록이, 미미..." maxLength={12} aria-describedby="onboarding-name-hint"
              className="w-full rounded-2xl pl-4 pr-14 py-4 text-base"
              style={{ backgroundColor: "var(--toss-surface-low)", color: "var(--toss-on-surface)", border: "none" }}
            />
            {name && <button onClick={() => { setName(""); nameRef.current?.focus(); }} aria-label="식물 이름 지우기"
              className="absolute right-1 top-1 bottom-1 text-xl" style={{ color: "var(--toss-on-surface-variant)" }}>×</button>}
          </div>
          <div id="onboarding-name-hint" className="flex flex-wrap justify-between gap-2 w-full mt-2 text-sm" style={{ color: "var(--toss-on-surface-variant)" }}>
            <span>이름 없이도 괜찮아요</span><span>{name.length} / 12자</span>
          </div>
        </>}
      </section>

      <footer className="onboarding-footer">
        <button onClick={step < TOTAL_STEPS - 1 ? goNext : handleStart} className="primary-care-button">{ctaLabel}</button>
        {step === TOTAL_STEPS - 1 && <button onClick={() => onStart(undefined)} className="w-full text-sm mt-2" style={{ color: "var(--toss-on-surface-variant)" }}>이름 없이 시작하기</button>}
      </footer>
    </main>
  );
}
