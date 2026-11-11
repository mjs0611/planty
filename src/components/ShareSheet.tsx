"use client";
import { BottomSheet, Button } from "@toss/tds-mobile";
import { PlantState } from "@/types/plant";
import { STAGE_INFO, getPlantImage, getAllMissionIds } from "@/lib/plantState";
import { useState } from "react";
import { nativeShare } from "@/lib/bridge";
import { getTossShareLink } from "@apps-in-toss/web-framework";

interface Props {
  plant: PlantState;
  onClose: () => void;
}

export default function ShareSheet({ plant, onClose }: Props) {
  const [shared, setShared] = useState(false);
  const info = STAGE_INFO[plant.stage];

  const handleShare = async () => {
    let link = "intoss://planty";
    try {
      const tossLink = await getTossShareLink(link);
      if (typeof tossLink === "string" && tossLink.trim()) link = tossLink.trim();
    } catch { /* 공유 링크 생성 실패 시 미니앱 딥링크 유지 */ }
    const shareText = `🌿 플랜티\n나의 식물이 "${info.name}" 단계에 도달했어요!\n🔥 ${plant.streak}일 연속 케어 중\n💧 ${plant.stats.water}  ☀️ ${plant.stats.sunlight}  💚 ${plant.stats.health}\n\n나도 식물 키워보기 → ${link}`;
    await nativeShare(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const allIds = getAllMissionIds(plant.timeSlotMissions);
  const completedToday = allIds.filter(id => plant.completedMissions.includes(id)).length;
  const totalMissions = allIds.length;

  return (
    <BottomSheet open onDimmerClick={onClose}>
      <BottomSheet.Header>내 식물 공유하기</BottomSheet.Header>

      <div className="px-5 pb-2">
        {/* Share card */}
        <div className="bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-5 flex flex-col items-center gap-3 mb-4">
          <div className="w-28 h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPlantImage(plant.stage, plant.plantType)} alt={info.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-gray-800 dark:text-white">{info.name}</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--toss-on-surface-variant)' }}>{info.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full text-center">
            <div className="min-w-0">
              <p className="text-lg font-bold" style={{ color: 'var(--color-warning)' }}>🔥 {plant.streak}</p>
              <p className="text-sm" style={{ color: 'var(--toss-on-surface-variant)' }}>연속 돌봄</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold" style={{ color: 'var(--toss-secondary)' }}>{completedToday}/{totalMissions}</p>
              <p className="text-sm" style={{ color: 'var(--toss-on-surface-variant)' }}>오늘 미션</p>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold" style={{ color: 'var(--toss-primary)' }}>{plant.totalDaysAlive}</p>
              <p className="text-sm" style={{ color: 'var(--toss-on-surface-variant)' }}>함께한 날</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm" style={{ color: 'var(--toss-on-surface-variant)' }}>
            <span>💧 {plant.stats.water}</span>
            <span>☀️ {plant.stats.sunlight}</span>
            <span>💚 {plant.stats.health}</span>
          </div>
        </div>

        <Button display="full" color="primary" size="xlarge" onClick={handleShare}>
          {shared ? '✅ 공유 완료!' : '🔗 공유하기'}
        </Button>
        <Button display="full" color="light" size="large" onClick={onClose} style={{ marginTop: 8 }}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
}
