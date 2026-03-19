import { describe, it, expect } from 'vitest';
import { weatherBonusMultiplier, getSlotMeta, WEATHER_INFO } from '@/lib/weather';

describe('weatherBonusMultiplier', () => {
  it('sunny + sunlight 스탯 → 1.5x', () => {
    expect(weatherBonusMultiplier('sunny', 'morning', { sunlight: 20 })).toBe(1.5);
  });

  it('rainy + water 스탯 → 1.5x', () => {
    expect(weatherBonusMultiplier('rainy', 'afternoon', { water: 15 })).toBe(1.5);
  });

  it('windy + health 스탯 → 1.5x', () => {
    expect(weatherBonusMultiplier('windy', 'morning', { health: 10 })).toBe(1.5);
  });

  it('moonlight + evening 슬롯 → 1.5x', () => {
    expect(weatherBonusMultiplier('moonlight', 'evening', { health: 10 })).toBe(1.5);
  });

  it('moonlight + morning 슬롯 → 1x (슬롯 불일치)', () => {
    expect(weatherBonusMultiplier('moonlight', 'morning', { health: 10 })).toBe(1);
  });

  it('sunny + water 스탯 → 1x (스탯 불일치)', () => {
    expect(weatherBonusMultiplier('sunny', 'morning', { water: 20 })).toBe(1);
  });

  it('cloudy → 항상 1x (보너스 없음)', () => {
    expect(weatherBonusMultiplier('cloudy', 'morning', { water: 20, sunlight: 20, health: 20 })).toBe(1);
  });

  it('bonusStat 스탯 값이 0이면 1x', () => {
    expect(weatherBonusMultiplier('sunny', 'morning', { sunlight: 0 })).toBe(1);
  });
});

describe('getSlotMeta', () => {
  it('morning 메타 반환', () => {
    const meta = getSlotMeta('morning');
    expect(meta.emoji).toBe('🌅');
    expect(meta.name).toBe('아침');
    expect(meta.unlockHour).toBe(7);
  });

  it('night 메타 반환', () => {
    const meta = getSlotMeta('night');
    expect(meta.emoji).toBe('🌙');
    expect(meta.unlockHour).toBe(23);
  });
});

describe('WEATHER_INFO', () => {
  it('5개 날씨 타입 정의', () => {
    expect(Object.keys(WEATHER_INFO)).toHaveLength(5);
  });
});
