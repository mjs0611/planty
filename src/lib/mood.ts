import type { PlantState } from '@/types/plant';

export interface PlantMood {
  emoji: string;
  message: string;
}

export function getPlantMood(state: PlantState, completedToday: number): PlantMood {
  if (state.isDead) return { emoji: '🥀', message: '다시 심어줘요...' };
  if (state.isWilting) return { emoji: '🥺', message: '돌봐줘요, 힘들어요...' };

  if (state.streak >= 30) return { emoji: '🏆', message: '우린 최고의 파트너예요!' };
  if (state.streak >= 7)  return { emoji: '🥰', message: '매일 와줘서 행복해요!' };

  const hour = new Date().getHours();
  if (hour >= 22) return { emoji: '😴', message: '오늘도 수고했어요... Zzz' };
  if (hour < 6)   return { emoji: '🌙', message: '조용한 밤이에요...' };
  if (hour < 9)   return { emoji: '🌅', message: '좋은 아침! 오늘도 잘 부탁해요' };

  if (completedToday === 0) return { emoji: '👀', message: '오늘 미션 아직이에요...' };
  if (completedToday >= 9)  return { emoji: '🎉', message: '오늘 미션 완주! 최고예요!' };

  if (state.stats.water < 40)    return { emoji: '💧', message: '목말라요~' };
  if (state.stats.sunlight < 40) return { emoji: '☀️', message: '햇빛이 보고 싶어요!' };
  if (state.stats.health < 40)   return { emoji: '😷', message: '몸이 좀 안 좋아요...' };

  const cheerful: PlantMood[] = [
    { emoji: '🌿', message: '오늘도 쑥쑥 자라고 있어요!' },
    { emoji: '😊', message: '돌봐줘서 정말 고마워요!' },
    { emoji: '✨', message: '오늘 기분 너무 좋아요!' },
    { emoji: '🌱', message: '더 크고 싶어요!' },
    { emoji: '💚', message: '같이 있어서 행복해요!' },
  ];
  return cheerful[hour % cheerful.length];
}

export function isMoodInteractAvailable(state: PlantState): boolean {
  if (!state.lastMoodInteractTime) return true;
  return Date.now() - new Date(state.lastMoodInteractTime).getTime() >= 2 * 60 * 60 * 1000;
}
