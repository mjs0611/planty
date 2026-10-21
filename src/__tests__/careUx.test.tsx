import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MiniWatering from '@/components/MiniWatering';
import MissionInteractionModal from '@/components/MissionInteractionModal';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { getInitialState } from '@/lib/plantState';
import { getMissionById } from '@/lib/missions';
import { MINI_WATERING_COOLDOWN_MS } from '@/lib/constants';

vi.mock('@/lib/bridge', () => ({ haptic: vi.fn() }));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const render = (node: ReactNode) => act(() => root.render(node));
const click = (button: HTMLElement) => act(() => button.click());
const key = (target: EventTarget, type: 'keydown' | 'keyup', value: string, shiftKey = false) =>
  act(() => { target.dispatchEvent(new KeyboardEvent(type, { key: value, shiftKey, bubbles: true, cancelable: true })); });
const buttonWithText = (text: string) => {
  const button = Array.from(container.querySelectorAll('button')).find(node => node.textContent?.includes(text));
  if (!button) throw new Error(`Missing button: ${text}`);
  return button;
};

describe('watering feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T10:00:00+09:00'));
  });

  it('shows success and the new cooldown immediately after a confirmed state update', () => {
    const plant = getInitialState();
    const onWater = vi.fn();
    render(<MiniWatering plant={plant} onWater={onWater} />);
    expect(container.textContent).toContain('수분 +8 · XP +10');
    click(buttonWithText('물주기'));
    expect(onWater).toHaveBeenCalledOnce();
    expect(container.textContent).not.toContain('물을 줬어요');
    render(<MiniWatering plant={{ ...plant, lastWateringTime: new Date().toISOString() }} onWater={onWater} />);
    expect(buttonWithText('물을 줬어요').disabled).toBe(true);
    expect(container.textContent).toContain('2시간 후 다시 물을 줄 수 있어요');
    act(() => vi.advanceTimersByTime(2500));
    expect(buttonWithText('다음 물주기 기다리는 중').disabled).toBe(true);
  });

  it('re-enables watering at the existing cooldown boundary without a parent update', () => {
    const lastWateringTime = new Date(Date.now() - MINI_WATERING_COOLDOWN_MS + 1000).toISOString();
    render(<MiniWatering plant={{ ...getInitialState(), lastWateringTime }} onWater={vi.fn()} />);
    expect(container.textContent).not.toContain('물을 줬어요');
    expect(container.textContent).toContain('1분 후 다시 물을 줄 수 있어요');
    expect(buttonWithText('다음 물주기 기다리는 중').disabled).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(buttonWithText('물주기').disabled).toBe(false);
    expect(container.textContent).toContain('수분 +8 · XP +10');
  });
});

describe('dialog keyboard navigation', () => {
  it('traps both tab directions, closes with Escape, and restores the trigger', () => {
    const close = vi.fn();
    function Dialog() {
      const ref = useDialogFocus(true, close);
      return <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}><button disabled>준비 중</button><input aria-label="이름" /><button>저장하기</button></div>;
    }
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    render(<Dialog />);
    const input = container.querySelector('input')!;
    const save = buttonWithText('저장하기');
    expect(document.activeElement).toBe(input);
    key(input, 'keydown', 'Tab', true);
    expect(document.activeElement).toBe(save);
    key(save, 'keydown', 'Tab');
    expect(document.activeElement).toBe(input);
    const overlay = document.createElement('div');
    overlay.setAttribute('aria-modal', 'true');
    document.body.append(overlay);
    key(input, 'keydown', 'Escape');
    expect(close).not.toHaveBeenCalled();
    overlay.remove();
    key(input, 'keydown', 'Escape');
    expect(close).toHaveBeenCalledOnce();
    render(null);
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('supports keyboard holds and cancels incomplete holds without completing a mission', () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    render(<MissionInteractionModal mission={getMissionById('sunlight')!} onComplete={complete} onClose={vi.fn()} />);
    const hold = container.querySelector<HTMLButtonElement>('[aria-label="꾹 눌러서 햇빛을 비춰요"]')!;
    key(hold, 'keydown', ' ');
    act(() => vi.advanceTimersByTime(800));
    key(hold, 'keyup', ' ');
    act(() => vi.advanceTimersByTime(2000));
    expect(complete).not.toHaveBeenCalled();
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('0');
    key(hold, 'keydown', 'Enter');
    act(() => vi.advanceTimersByTime(1820));
    expect(container.textContent).toContain('완료!');
    act(() => vi.advanceTimersByTime(900));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('stops a pointer hold when the gesture is cancelled', () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    render(<MissionInteractionModal mission={getMissionById('sunlight')!} onComplete={complete} onClose={vi.fn()} />);
    const hold = container.querySelector<HTMLButtonElement>('[aria-label="꾹 눌러서 햇빛을 비춰요"]')!;
    act(() => { hold.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true })); });
    act(() => vi.advanceTimersByTime(800));
    act(() => { hold.dispatchEvent(new Event('pointercancel', { bubbles: true })); });
    act(() => vi.advanceTimersByTime(3000));
    expect(complete).not.toHaveBeenCalled();
  });
});
