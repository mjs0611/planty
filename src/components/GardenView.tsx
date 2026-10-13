"use client";
import type { PlantState } from "@/types/plant";
import { PLANT_TYPE_INFO, PLANT_TYPE_ORDER } from "@/lib/season";
import { getGardenSummary, getPlantImage, STAGE_INFO } from "@/lib/plantState";
import BannerAd from "./BannerAd";
import GrowthProgress from "./GrowthProgress";

export default function GardenView({ plant, onCare }: { plant: PlantState; onCare: () => void }) {
  const summary = getGardenSummary(plant);
  const typeInfo = PLANT_TYPE_INFO[plant.plantType];
  const nextInfo = PLANT_TYPE_INFO[summary.nextType];
  const remainingTypes = PLANT_TYPE_ORDER.filter(type => !plant.garden.some(p => p.type === type));
  return (
    <div className="pb-8 garden-view">
      <div className="mx-4 mt-3"><BannerAd /></div>
      <header className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-extrabold">내 정원</h2>
        <p className="text-sm font-semibold">{summary.collectedTypes}종 · {summary.completedPlants}그루</p>
      </header>
      <section className="mx-4 mt-3 toss-card rounded-2xl p-5" aria-label="정원에서 이어서 돌보기">
        <div className="garden-current">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getPlantImage(plant.stage, plant.plantType)} alt={`${typeInfo.name} ${STAGE_INFO[plant.stage].name}`} width={80} height={80} />
          <div className="min-w-0">
            <p className="growth-detail">지금 키우는 식물</p>
            <h3 className="text-lg font-bold [overflow-wrap:anywhere]">{plant.name || typeInfo.name}</h3>
            <p className="text-sm">{STAGE_INFO[plant.stage].name}</p>
          </div>
        </div>
        <GrowthProgress plant={plant} />
        <button className="garden-care-button" onClick={onCare}>
          {plant.isDead || plant.isWilting ? '이 식물 다시 돌보기' : plant.stage === 'special' ? '황금 식물 모으러 가기' : '이 식물 이어서 돌보기'}
        </button>
        <p className="growth-detail mt-3">모아둔 식물은 정원에 계속 남아요.</p>
      </section>
      <section className="mx-4 mt-3 toss-card rounded-2xl p-4" aria-label="다음 수집 목표">
        <p className="text-base font-bold">{plant.stage === 'special' ? '지금 식물을 모으면' : '황금 식물을 모으면'}</p>
        <p className="text-sm mt-1">{nextInfo.emoji} {nextInfo.name} 키우기를 시작해요.</p>
        {summary.completedPlants === 0 && <p className="growth-detail mt-2">첫 황금 식물이 이 정원을 채워요.</p>}
      </section>
      {summary.completedPlants > 0 && (
        <section className="mx-4 mt-5" aria-label="모아둔 식물">
          <h3 className="text-lg font-bold mb-3">모아둔 식물 {summary.completedPlants}그루</h3>
          <div className="garden-collection-grid">
            {plant.garden.map((p, i) => {
              const info = PLANT_TYPE_INFO[p.type];
              const date = new Date(p.completedAt);
              const dateLabel = Number.isFinite(date.getTime()) ? date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
              return (
                <article key={i} className="toss-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getPlantImage('special', p.type)} alt={`수집한 ${info.name}`} width={72} height={72} />
                  <p className="text-base font-bold">{info.name}</p>
                  {dateLabel && <p className="growth-detail">{dateLabel}에 모았어요.</p>}
                  <span className="text-sm" style={{ color: 'var(--toss-secondary)' }}>수집 완료</span>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {remainingTypes.length > 0 && (
        <section className="mx-4 mt-5" aria-label="앞으로 모을 식물">
          <h3 className="text-base font-bold mb-2">앞으로 모을 식물</h3>
          <div className="flex flex-wrap gap-2">
            {remainingTypes.map(type => <span className="toss-card rounded-xl px-3 py-2 text-sm" key={type}>{PLANT_TYPE_INFO[type].emoji} {PLANT_TYPE_INFO[type].name}</span>)}
          </div>
        </section>
      )}
      <p className="mx-4 mt-5 text-sm growth-detail">가장 오래 이어서 돌본 기록 · {summary.maxStreak}일</p>
    </div>
  );
}
