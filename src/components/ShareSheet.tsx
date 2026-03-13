"use client";
import Image from "next/image";
import { BottomSheet, Button } from "@toss/tds-mobile";
import { PlantState } from "@/types/plant";
import { STAGE_INFO } from "@/lib/plantState";
import { useState } from "react";

interface Props {
  plant: PlantState;
  onClose: () => void;
}

export default function ShareSheet({ plant, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const info = STAGE_INFO[plant.stage];

  const shareText = `🌿 초록하루\n나의 식물이 "${info.name}" 단계에 도달했어요!\n🔥 ${plant.streak}일 연속 케어 중\n💧 ${plant.stats.water}  ☀️ ${plant.stats.sunlight}  💚 ${plant.stats.health}\n\n나도 식물 키워보기 → https://daily-green.vercel.app`;

  const handleShare = async () => {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: '초록하루 🌿', text: shareText });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const completedToday = plant.completedMissions.filter(id => plant.todayMissions.includes(id)).length;
  const totalMissions = plant.todayMissions.length;

  return (
    <BottomSheet open onDimmerClick={onClose}>
      <BottomSheet.Header>내 식물 공유하기</BottomSheet.Header>

      <div className="px-5 pb-2">
        {/* Share card */}
        <div className="bg-gradient-to-b from-green-50 to-blue-50 rounded-3xl p-5 flex flex-col items-center gap-3 mb-5">
          <div className="relative w-28 h-28">
            <Image src={info.image} alt={info.name} fill style={{ objectFit: 'contain' }} />
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{info.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
          </div>

          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-orange-500">🔥 {plant.streak}</p>
              <p className="text-[10px] text-gray-400">연속 케어</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-lg font-bold text-green-500">{completedToday}/{totalMissions}</p>
              <p className="text-[10px] text-gray-400">오늘 미션</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-lg font-bold text-blue-500">{plant.totalDaysAlive}</p>
              <p className="text-[10px] text-gray-400">함께한 날</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-gray-500">
            <span>💧 {plant.stats.water}</span>
            <span>☀️ {plant.stats.sunlight}</span>
            <span>💚 {plant.stats.health}</span>
          </div>
        </div>

        {/* Share button */}
        <Button display="full" color="primary" size="xlarge" onClick={handleShare}>
          {copied ? '✅ 복사됐어요!' : ((navigator as Navigator & { share?: unknown }).share ? '🔗 공유하기' : '📋 텍스트 복사하기')}
        </Button>

        <Button display="full" color="light" size="large" onClick={onClose} style={{ marginTop: 8 }}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
}
