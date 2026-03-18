"use client";
import { CollectedPlant, PlantType } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";
import { STAGE_INFO } from "@/lib/plantState";

interface Props {
  garden: CollectedPlant[];
  currentType: PlantType;
}

export default function GardenView({ garden, currentType }: Props) {
  return (
    <div className="px-4 mt-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <span>🌱</span> 내 정원
        </h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {garden.length} / {PLANT_TYPE_ORDER.length} 수집
        </span>
      </div>

      {garden.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <p className="text-4xl mb-3">🌿</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">아직 졸업한 식물이 없어요</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">황금 식물을 키워 첫 번째 식물을 수집해보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {garden.map((plant, i) => {
            const info = PLANT_TYPE_INFO[plant.type];
            const stageImg = STAGE_INFO['special'].image;
            return (
              <div key={i} className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2">
                <div
                  className="w-24 h-24"
                  style={{ filter: `hue-rotate(${info.hueRotate}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stageImg} alt={info.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-800 dark:text-white">{info.emoji} {info.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">🔥 최고 {plant.maxStreak}일</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{plant.totalDaysAlive}일 함께</p>
                </div>
              </div>
            );
          })}
          {/* 잠긴 슬롯 */}
          {PLANT_TYPE_ORDER.filter(t => !garden.some(g => g.type === t) && t !== currentType).map(type => {
            const info = PLANT_TYPE_INFO[type];
            return (
              <div key={type} className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40">
                <div className="w-24 h-24 flex items-center justify-center text-4xl">🔒</div>
                <p className="text-xs font-semibold text-gray-500">{info.emoji} {info.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
