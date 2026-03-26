import { describe, it, expect } from 'vitest';
import { seasonXpMultiplier, getCurrentWeekStr, PLANT_TYPE_ORDER } from '@/lib/season';

describe('seasonXpMultiplier', () => {
  it('spring + health 스탯 → 1.1x', () => {
    expect(seasonXpMultiplier('spring', { health: 10 })).toBe(1.1);
  });

  it('spring + water 스탯 → 1x (스탯 불일치)', () => {
    expect(seasonXpMultiplier('spring', { water: 10 })).toBe(1);
  });

  it('summer + sunlight 스탯 → 1.1x', () => {
    expect(seasonXpMultiplier('summer', { sunlight: 20 })).toBe(1.1);
  });

  it('autumn + water 스탯 → 1.1x', () => {
    expect(seasonXpMultiplier('autumn', { water: 15 })).toBe(1.1);
  });

  it('winter → 스탯 무관 1.05x', () => {
    expect(seasonXpMultiplier('winter', { health: 10 })).toBe(1.05);
    expect(seasonXpMultiplier('winter', { water: 0 })).toBe(1.05);
    expect(seasonXpMultiplier('winter', {})).toBe(1.05);
  });

  it('spring + bonusStat 값이 0이면 1x', () => {
    expect(seasonXpMultiplier('spring', { health: 0 })).toBe(1);
  });
});

describe('getCurrentWeekStr', () => {
  it('"YYYY-WNN" 형식 반환', () => {
    const week = getCurrentWeekStr();
    expect(week).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('올해 연도 포함', () => {
    const year = new Date().getFullYear().toString();
    expect(getCurrentWeekStr().startsWith(year)).toBe(true);
  });
});

describe('PLANT_TYPE_ORDER', () => {
  it('8가지 식물 타입 순서 유지 (mushroom, succulent 제외)', () => {
    expect(PLANT_TYPE_ORDER).toEqual(['green', 'flower', 'cactus', 'sunflower', 'rose', 'bamboo', 'clover', 'monstera']);
  });
});
