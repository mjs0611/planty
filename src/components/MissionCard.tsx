"use client";
import { ListRow } from "@toss/tds-mobile";
import { Mission } from "@/types/plant";

interface Props {
  mission: Mission;
  isCompleted: boolean;
  onComplete: (missionId: string) => void;
}

export default function MissionCard({ mission, isCompleted, onComplete }: Props) {
  return (
    <ListRow
      as="button"
      onClick={() => !isCompleted && onComplete(mission.id)}
      disabled={isCompleted}
      border="none"
      verticalPadding="small"
      horizontalPadding="small"
      left={<span className="text-2xl">{mission.emoji}</span>}
      contents={
        <ListRow.Texts
          type="2RowTypeA"
          top={
            isCompleted
              ? <span style={{ textDecoration: 'line-through' }}>{mission.label}</span>
              : mission.label
          }
          topProps={{ fontWeight: 'semibold', color: isCompleted ? '#16a34a' : undefined }}
          bottom={`+${mission.xpReward} XP`}
        />
      }
      right={
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
            isCompleted ? 'border-green-500 bg-green-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {isCompleted && <span className="text-white text-xs font-bold">✓</span>}
        </div>
      }
      style={{
        borderRadius: 16,
        width: '100%',
        backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff',
        border: `2px solid ${isCompleted ? '#bbf7d0' : '#f3f4f6'}`,
        transition: 'all 0.2s',
        textAlign: 'left',
      }}
    />
  );
}
