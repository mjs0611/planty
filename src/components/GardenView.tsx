"use client";
import { PlantState, CollectedPlant, PlantType } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";
import { STAGE_INFO, getPlantImage } from "@/lib/plantState";
import { PlantStage } from "@/types/plant";
import BannerAd from "./BannerAd";

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'young', 'bud', 'flower', 'fruit', 'bloom', 'special'];

interface Props {
  plant: PlantState;
}

export default function GardenView({ plant }: Props) {
  const typeInfo = PLANT_TYPE_INFO[plant.plantType];
  const currentStageIdx = STAGE_ORDER.indexOf(plant.stage);
  const growthPct = Math.round(((currentStageIdx) / (STAGE_ORDER.length - 1)) * 100);

  const lockedTypes = PLANT_TYPE_ORDER.filter(
    t => !plant.garden.some(g => g.type === t) && t !== plant.plantType
  );
  const nextType = lockedTypes[0] ?? null;

  const totalDays = plant.garden.reduce((sum, g) => sum + g.totalDaysAlive, 0);
  const maxStreak = Math.max(plant.streak, ...plant.garden.map(g => g.maxStreak));
  const collectedCount = plant.garden.length;

  return (
    <div className="pb-8">
      {/* 배너 광고 */}
      <div className="mx-4 mt-3">
        <BannerAd />
      </div>

      {/* 헤더 */}
      <div className="mx-4 mt-4 flex items-center justify-between">
        <h2
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}
        >
          내 정원
        </h2>
        <div
          className="inline-flex items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "var(--toss-surface-high, #eae8e7)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>
            {collectedCount} / {PLANT_TYPE_ORDER.length} 수집
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-3">

        {/* 수집 완료 식물들 */}
        {plant.garden.map((p: CollectedPlant, i: number) => {
          const info = PLANT_TYPE_INFO[p.type];
          return (
            <div
              key={i}
              className="toss-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
              style={{ boxShadow: "0 4px 16px -4px rgba(0,108,73,0.08)" }}
            >
              <div className="relative">
                <div className="absolute inset-2 rounded-full blur-xl" style={{ backgroundColor: "rgba(63,224,161,0.2)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPlantImage("special", p.type)}
                  alt={info.name}
                  className="relative w-16 h-16 object-contain"
                />
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--toss-on-surface)" }}>{info.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold" style={{ color: "#e87600" }}>🔥 {p.maxStreak}일</span>
                <span className="text-[11px]" style={{ color: "var(--toss-on-surface-variant)" }}>· {p.totalDaysAlive}일</span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(0,108,73,0.10)", color: "var(--toss-secondary)" }}
              >
                ✅ 수집 완료
              </span>
            </div>
          );
        })}

        {/* 현재 키우는 식물 — col-span-2 featured */}
        <div
          className="col-span-2 toss-card rounded-2xl p-5 relative overflow-hidden"
          style={{
            boxShadow: "0 12px 32px -4px rgba(0,84,216,0.10)",
            outline: "2px solid rgba(0,78,203,0.18)",
          }}
        >
          <div className="relative z-10">
            <span
              className="text-[10px] font-black uppercase tracking-widest block mb-1"
              style={{ color: "var(--toss-primary)" }}
            >
              Growing Now
            </span>
            <h3
              className="text-xl font-bold"
              style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}
            >
              {plant.name || typeInfo.name}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: "var(--toss-on-surface-variant)" }}>
              {plant.isDead ? `${STAGE_INFO[plant.stage].name} · 다시 돌볼 수 있어요` : STAGE_INFO[plant.stage].name}
            </p>

            {/* 성장 진행 바 */}
            {!plant.isDead && (
              <div className="mt-4 w-full max-w-[160px]">
                <div
                  className="h-2 w-full rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--toss-surface-high, #eae8e7)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${growthPct}%`,
                      background: "linear-gradient(to right, #006c49, #3fe0a1)",
                    }}
                  />
                </div>
                <p className="text-[11px] font-bold mt-1" style={{ color: "var(--toss-secondary)" }}>
                  {growthPct}% 완성
                </p>
              </div>
            )}
          </div>

          {/* 식물 이미지 - 우측 하단 */}
          <div className="absolute -right-3 -bottom-3 w-28 h-28 opacity-90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPlantImage(plant.stage, plant.plantType)}
              alt={typeInfo.name}
              className="w-full h-full object-contain"
              style={{
                filter: plant.isWilting || plant.isDead ? "sepia(0.6) brightness(0.85)" : undefined,
              }}
            />
          </div>
        </div>

        {/* 다음 식물 (잠김 해제 예정) */}
        {nextType && (() => {
          const info = PLANT_TYPE_INFO[nextType as PlantType];
          return (
            <div
              key={nextType}
              className="toss-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
              style={{ aspectRatio: "1", opacity: 0.85 }}
            >
              <div>
                <span className="text-lg mb-1 block">🔓</span>
                <h3 className="text-base font-bold" style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
                  {info.name}
                </h3>
              </div>
              <p className="text-[11px] font-medium" style={{ color: "var(--toss-on-surface-variant)" }}>다음 식물</p>
              <div className="absolute -right-5 -bottom-5 w-20 h-20 opacity-25 grayscale">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPlantImage("seed", nextType as PlantType)}
                  alt={info.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          );
        })()}

        {/* 잠긴 슬롯들 */}
        {lockedTypes.slice(1).map((type) => {
          const info = PLANT_TYPE_INFO[type as PlantType];
          return (
            <div
              key={type}
              className="rounded-2xl flex flex-col items-center justify-center text-center p-4"
              style={{
                aspectRatio: "1",
                backgroundColor: "var(--toss-surface-high, #eae8e7)",
                border: "1.5px dashed rgba(115,118,135,0.25)",
                opacity: 0.5,
              }}
            >
              <span className="text-2xl mb-1">🔒</span>
              <p className="text-[10px] font-bold tracking-wider" style={{ color: "var(--toss-on-surface-variant)" }}>
                {info.emoji} {info.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* 격려 배너 */}
      {collectedCount === 0 && (
        <div
          className="mx-4 mt-3 p-5 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #004ecb 0%, #0064ff 100%)",
            boxShadow: "0 12px 32px -4px rgba(0,84,216,0.20)",
          }}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md">
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-white text-sm font-semibold leading-snug">
              황금 식물을 키워 첫 번째 식물을 수집해보세요!
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        </div>
      )}

      {/* 정원 통계 */}
      <div
        className="mx-4 mt-3 toss-card rounded-2xl p-5 flex justify-between items-center"
      >
        <div className="text-center flex-1" style={{ borderRight: "1px solid var(--toss-surface-high, #eae8e7)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--toss-on-surface-variant)" }}>
            누적 돌봄
          </p>
          <p className="text-xl font-bold" style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
            {totalDays + (plant.isDead ? 0 : 1)}일
          </p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--toss-on-surface-variant)" }}>
            최고 스트릭
          </p>
          <p className="text-xl font-bold" style={{ color: "var(--toss-secondary)", fontFamily: "var(--font-headline, sans-serif)" }}>
            {maxStreak}일
          </p>
        </div>
      </div>
    </div>
  );
}
