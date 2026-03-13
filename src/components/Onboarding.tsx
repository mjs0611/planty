"use client";
import Image from "next/image";
import { Button } from "@toss/tds-mobile";

interface Props {
  onStart: () => void;
}

const FEATURES = [
  { emoji: "🌱", title: "매일 미션", desc: "하루 3가지 미션을 완료해 식물을 돌봐요" },
  { emoji: "🔥", title: "연속 케어", desc: "매일 빠짐없이 돌보면 스트릭이 쌓여요" },
  { emoji: "🌸", title: "8단계 성장", desc: "씨앗에서 황금 식물까지 함께 성장해요" },
];

export default function Onboarding({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="relative w-44 h-44 mb-6">
          <Image
            src="/plants/stage_1_seed.png"
            alt="씨앗"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center leading-tight">
          초록하루에<br />오신 걸 환영해요 🌿
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
          매일 작은 습관으로 식물과 함께 성장해요
        </p>
      </div>

      {/* Features */}
      <div className="flex-1 px-5 space-y-3">
        {FEATURES.map((f) => (
          <div
            key={f.emoji}
            className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
          >
            <span className="text-3xl">{f.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{f.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 pb-10 pt-6">
        <Button display="full" color="primary" size="xlarge" onClick={onStart}>
          시작하기 🌱
        </Button>
        <p className="text-[11px] text-center text-gray-400 dark:text-gray-600 mt-3">
          매일 미션을 잊으면 식물이 시들 수 있어요
        </p>
      </div>
    </div>
  );
}
