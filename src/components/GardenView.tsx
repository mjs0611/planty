"use client";
import { CollectedPlant, PlantType } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";
import { STAGE_INFO } from "@/lib/plantState";

interface Props {
  garden: CollectedPlant[];
  currentType: PlantType;
}

export default function GardenView({ garden, currentType }: Props) {
  const currentInfo = PLANT_TYPE_INFO[currentType];
  const currentStageImg = STAGE_INFO['seed'].image;

  // 아직 수집하지 않았고, 현재 키우는 타입도 아닌 것들 (순서 유지)
  const lockedTypes = PLANT_TYPE_ORDER.filter(
    t => !garden.some(g => g.type === t) && t !== currentType
  );
  const nextType = lockedTypes[0] ?? null;

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

      <div className="grid grid-cols-2 gap-3">
        {/* 수집 완료 */}
        {garden.map((plant, i) => {
          const info = PLANT_TYPE_INFO[plant.type];
          const stageImg = STAGE_INFO['special'].image;
          return (
            <div key={i} className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2">
              <div className="w-24 h-24" style={{ filter: `hue-rotate(${info.hueRotate}deg)` }}>
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

        {/* 현재 키우는 중 */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 ring-2 ring-emerald-400/60 dark:ring-emerald-500/50 relative">
          <span className="absolute top-2 left-2 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
            키우는 중
          </span>
          <div className="w-24 h-24" style={{ filter: `hue-rotate(${currentInfo.hueRotate}deg)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentStageImg} alt={currentInfo.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-800 dark:text-white">{currentInfo.emoji} {currentInfo.name}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">성장 중...</p>
          </div>
        </div>

        {/* 다음 식물 */}
        {nextType && (() => {
          const info = PLANT_TYPE_INFO[nextType];
          return (
            <div key={nextType} className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 opacity-60 relative">
              <span className="absolute top-2 left-2 text-[9px] font-bold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                다음
              </span>
              <div className="w-24 h-24 flex items-center justify-center text-5xl">
                {info.emoji}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{info.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{info.desc}</p>
              </div>
            </div>
          );
        })()}

        {/* 잠긴 슬롯 (다음 제외) */}
        {lockedTypes.slice(1).map(type => {
          const info = PLANT_TYPE_INFO[type];
          return (
            <div key={type} className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 opacity-30">
              <div className="w-24 h-24 flex items-center justify-center text-4xl">🔒</div>
              <p className="text-xs font-semibold text-gray-500">{info.emoji} {info.name}</p>
            </div>
          );
        })}
      </div>

      {garden.length === 0 && lockedTypes.length === PLANT_TYPE_ORDER.length - 1 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          황금 식물을 키워 첫 번째 식물을 수집해보세요!
        </p>
      )}
    </div>
  );
}
