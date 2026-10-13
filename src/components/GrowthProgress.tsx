"use client";
import type { PlantState } from '@/types/plant';
import { getGrowthGoal, getPlantImage, STAGE_INFO, type GrowthFeedback } from '@/lib/plantState';

export default function GrowthProgress({ plant, feedback }: { plant: PlantState; feedback?: GrowthFeedback | null }) {
  const goal = getGrowthGoal(plant);
  const grew = feedback && feedback.fromStage !== feedback.toStage;
  return (
    <section className="growth-progress" aria-label="성장 목표">
      {feedback && (
        <div className="growth-feedback" role="status" aria-live="polite">
          <p className="font-semibold">{feedback.source} · +{feedback.xpGained} XP</p>
          {grew && (
            <div className="growth-comparison">
              {[feedback.fromStage, feedback.toStage].map((stage, i) => (
                <div className="growth-stage" key={stage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getPlantImage(stage, feedback.plantType)} alt={`${i === 0 ? '돌보기 전' : '돌본 뒤'} ${STAGE_INFO[stage].name}`} width={56} height={56} />
                  <span>{STAGE_INFO[stage].name}</span>
                </div>
              ))}
              <span className="growth-arrow" aria-hidden="true">→</span>
            </div>
          )}
        </div>
      )}
      {goal ? (
        <div className="growth-goal-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getPlantImage(goal.nextStage, plant.plantType)} alt={`다음 모습: ${STAGE_INFO[goal.nextStage].name}`} width={56} height={56} />
          <div className="min-w-0">
            <p className="font-bold">{STAGE_INFO[goal.nextStage].name}까지 {goal.remainingXp} XP</p>
            <p className="growth-detail">돌볼수록 이 모습에 가까워져요.</p>
          </div>
        </div>
      ) : <p className="font-bold">황금 식물을 정원에 모을 수 있어요.</p>}
    </section>
  );
}
