"use client";
import { PlantState, CollectedPlant, PlantType } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";
import { STAGE_INFO, getPlantImage } from "@/lib/plantState";
import { PlantStage } from "@/types/plant";

const STAGE_ORDER: PlantStage[] = ['seed', 'sprout', 'young', 'bud', 'flower', 'fruit', 'bloom', 'special'];
import BannerAd from "./BannerAd";

interface Props {
  plant: PlantState;
}

export default function GardenView({ plant }: Props) {
  const typeInfo = PLANT_TYPE_INFO[plant.plantType];

  const lockedTypes = PLANT_TYPE_ORDER.filter(
    t => !plant.garden.some(g => g.type === t) && t !== plant.plantType
  );
  const nextType = lockedTypes[0] ?? null;

  // 정원 통계
  const totalDays = plant.garden.reduce((sum, g) => sum + g.totalDaysAlive, 0);
  const maxStreak = Math.max(plant.streak, ...plant.garden.map(g => g.maxStreak));
  const collectedCount = plant.garden.length;
  const currentStageIdx = STAGE_ORDER.indexOf(plant.stage);
  const growthPct = plant.isDead ? 0 : Math.round(((currentStageIdx) / (STAGE_ORDER.length - 1)) * 100);

  return (
    <div className="pb-8">
      {/* 배너 광고 */}
      <div className="mx-4 mt-3">
        <BannerAd />
      </div>

      {/* 정원 통계 요약 */}
      <div className="mx-4 mt-2 toss-card rounded-3xl p-4"
        style={{ boxShadow: "0 4px 20px -4px rgba(0,108,73,0.08)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3"
          style={{ color: "var(--toss-secondary)" }}>내 정원 기록</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black" style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
              {collectedCount}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>수집한 식물</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black" style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
              {maxStreak}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>최고 연속일</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-2xl font-black" style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
              {totalDays + (plant.isDead ? 0 : 1)}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>누적 돌봄 일</span>
          </div>
        </div>

        {/* 현재 식물 진행 바 */}
        {!plant.isDead && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold" style={{ color: "var(--toss-on-surface-variant)" }}>
                {typeInfo.emoji} {typeInfo.name} 성장 진행도
              </span>
              <span className="text-[10px] font-bold" style={{ color: "var(--toss-secondary)" }}>{growthPct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--toss-surface-high)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${growthPct}%`,
                  background: "linear-gradient(to right, #006c49, #3fe0a1)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {STAGE_ORDER.map((s, i) => {
                const passed = i <= currentStageIdx;
                return (
                  <div key={s} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: passed ? "var(--toss-secondary)" : "var(--toss-surface-high)" }}
                    />
                    {i === currentStageIdx && (
                      <span className="text-[8px] font-bold" style={{ color: "var(--toss-secondary)" }}>
                        {STAGE_INFO[s].name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 식물 컬렉션 */}
      <div className="mx-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold"
            style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
            🌿 식물 도감
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(0,108,73,0.08)", color: "var(--toss-secondary)" }}>
            {collectedCount + 1} / {PLANT_TYPE_ORDER.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 수집 완료 식물 */}
          {plant.garden.map((p: CollectedPlant, i: number) => {
            const info = PLANT_TYPE_INFO[p.type];
            return (
              <div key={i} className="toss-card rounded-2xl p-3 flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div className="absolute inset-2 rounded-full blur-xl" style={{ backgroundColor: "rgba(63,224,161,0.2)" }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPlantImage("special", p.type)}
                    alt={info.name}
                    className="relative w-14 h-14 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold" style={{ color: "var(--toss-on-surface)" }}>{info.emoji} {info.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold" style={{ color: "#e87600" }}>🔥 {p.maxStreak}일</span>
                    <span className="text-[10px]" style={{ color: "var(--toss-on-surface-variant)" }}>· {p.totalDaysAlive}일 돌봄</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(0,108,73,0.10)", color: "var(--toss-secondary)" }}>
                  ✅ 수집 완료
                </span>
              </div>
            );
          })}

          {/* 현재 키우는 중 */}
          <div className="toss-card rounded-2xl p-3 flex flex-col items-center gap-1.5 relative"
            style={{ outline: "2px solid rgba(0,78,203,0.25)" }}>
            <span className="absolute top-2 left-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--toss-primary)" }}>
              성장 중
            </span>
            <div className="relative">
              <div className="absolute inset-2 rounded-full blur-xl" style={{ backgroundColor: "rgba(0,78,203,0.12)" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPlantImage(plant.isDead ? "seed" : plant.stage, plant.plantType)}
                alt={typeInfo.name}
                className="relative w-14 h-14 object-contain"
                style={{
                  filter: plant.isWilting && !plant.isDead ? "sepia(0.6) brightness(0.85)" : undefined,
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold" style={{ color: "var(--toss-on-surface)" }}>{typeInfo.emoji} {typeInfo.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--toss-secondary)" }}>
                {plant.isDead ? "💀 시들었어요" : `${STAGE_INFO[plant.stage].name}`}
              </p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(0,78,203,0.08)", color: "var(--toss-primary)" }}>
              🌱 키우는 중
            </span>
          </div>

          {/* 다음 식물 (잠김) */}
          {nextType && (() => {
            const info = PLANT_TYPE_INFO[nextType as PlantType];
            return (
              <div key={nextType} className="toss-card rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ opacity: 0.5 }}>
                <div className="w-14 h-14 flex items-center justify-center text-4xl">{info.emoji}</div>
                <div className="text-center">
                  <p className="text-xs font-semibold" style={{ color: "var(--toss-on-surface)" }}>{info.name}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--toss-on-surface-variant)" }}>황금 식물 달성 후 해금</p>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--toss-surface-high)", color: "var(--toss-on-surface-variant)" }}>
                  🔒 미해금
                </span>
              </div>
            );
          })()}

          {/* 추가 잠긴 슬롯 */}
          {lockedTypes.slice(1).map((type) => {
            const info = PLANT_TYPE_INFO[type as PlantType];
            return (
              <div key={type} className="toss-card rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ opacity: 0.3 }}>
                <div className="w-14 h-14 flex items-center justify-center text-3xl">🔒</div>
                <p className="text-xs font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>{info.emoji} {info.name}</p>
              </div>
            );
          })}
        </div>

        {collectedCount === 0 && (
          <p className="text-center text-xs mt-4" style={{ color: "var(--toss-on-surface-variant)" }}>
            황금 식물을 키워 첫 번째 식물을 수집해보세요 🌟
          </p>
        )}
      </div>

      {/* 성장 팁 */}
      <div className="mx-4 mt-3 rounded-2xl p-3"
        style={{ backgroundColor: "rgba(0,108,73,0.06)" }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5"
          style={{ color: "var(--toss-secondary)" }}>가드닝 팁</p>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--toss-on-surface)" }}>
          {plant.streak >= 14
            ? "🌟 2주 연속 달성! 이 페이스라면 곧 황금 식물을 볼 수 있어요."
            : plant.streak >= 7
            ? "⭐ 7일 연속 돌봄 중! 꾸준함이 황금 식물로 가는 지름길이에요."
            : collectedCount >= 1
            ? `🏆 ${collectedCount}종 수집 완료! 다음 식물도 기대해봐요.`
            : "💡 매일 미션을 완료하면 식물이 더 빠르게 성장해요."}
        </p>
      </div>
    </div>
  );
}
