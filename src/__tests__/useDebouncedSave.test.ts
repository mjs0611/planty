import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { getInitialState } from '@/lib/plantState';
import { STORAGE_KEY } from '@/lib/constants';
import type { PlantState } from '@/types/plant';

let container: HTMLDivElement;
let root: Root;
let controls: ReturnType<typeof useDebouncedSave>;
function Harness({ plant }: { plant: PlantState }) {
  controls = useDebouncedSave(plant);
  return createElement('span', null, controls.saveFailed ? 'failed' : 'ok');
}

beforeEach(() => {
  vi.useFakeTimers(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value) });
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount()); container.remove();
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
});

describe('기록 저장 안내와 마지막 돌봄', () => {
  it('빠른 연속 변화는 마지막 상태를 저장한다', () => {
    const initial = getInitialState();
    act(() => root.render(createElement(Harness, { plant: initial })));
    act(() => vi.advanceTimersByTime(300));
    const latest = { ...initial, name: '마지막이름', xp: 20 };
    act(() => root.render(createElement(Harness, { plant: latest })));
    act(() => vi.advanceTimersByTime(500));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ name: '마지막이름', xp: 20 });
  });

  it('500ms 전에 앱을 닫아도 마지막 상태를 저장한다', () => {
    const plant = { ...getInitialState(), name: '복귀식물' };
    act(() => root.render(createElement(Harness, { plant })));
    act(() => window.dispatchEvent(new Event('pagehide')));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ name: '복귀식물' });
  });

  it('저장 실패 안내는 성공한 재시도 뒤에만 사라진다', () => {
    const blocked = vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError'); });
    const plant = getInitialState();
    act(() => root.render(createElement(Harness, { plant })));
    act(() => vi.advanceTimersByTime(500));
    expect(container.textContent).toBe('failed');
    act(() => { expect(controls.retrySave()).toBe(false); });
    expect(container.textContent).toBe('failed');
    blocked.mockRestore();
    act(() => { expect(controls.retrySave()).toBe(true); });
    expect(container.textContent).toBe('ok');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ stage: plant.stage });
  });
});
