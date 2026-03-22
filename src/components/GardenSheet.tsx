"use client";
import { BottomSheet, Button } from "@toss/tds-mobile";
import { CollectedPlant, PlantType } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";
import { getPlantImage } from "@/lib/plantState";

interface Props {
  garden: CollectedPlant[];
  currentType: PlantType;
  onClose: () => void;
}

export default function GardenSheet({ garden, currentType, onClose }: Props) {
  return (
    <BottomSheet open onDimmerClick={onClose}>
      <BottomSheet.Header>내 정원 🌱</BottomSheet.Header>
      <div className="px-5 pb-6">
        {garden.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🌿</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">아직 졸업한 식물이 없어요</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">황금 식물을 키워 첫 번째 식물을 수집해보세요!</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {garden.length}종 수집 · {PLANT_TYPE_ORDER.length}종 목표
            </p>
            <div className="grid grid-cols-2 gap-3">
              {garden.map((plant, i) => {
                const info = PLANT_TYPE_INFO[plant.type];
                return (
                  <div key={i} className="bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-3 flex flex-col items-center gap-2">
                    <div className="w-20 h-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getPlantImage('special', plant.type)} alt={info.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800 dark:text-white">{info.emoji} {info.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">🔥 최고 {plant.maxStreak}일 · {plant.totalDaysAlive}일 함께</p>
                    </div>
                  </div>
                );
              })}
              {/* Locked slots */}
              {PLANT_TYPE_ORDER.filter(t => !garden.some(g => g.type === t) && t !== currentType).map(type => {
                const info = PLANT_TYPE_INFO[type];
                return (
                  <div key={type} className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 flex flex-col items-center gap-2 opacity-40">
                    <div className="w-20 h-20 flex items-center justify-center text-4xl">🔒</div>
                    <p className="text-xs font-semibold text-gray-500">{info.emoji} {info.name}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <Button display="full" color="light" size="large" onClick={onClose} style={{ marginTop: 16 }}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
}
