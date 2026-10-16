import { act, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '@/app/page';
import TermsPage from '@/app/terms/page';
import PrivacyPage from '@/app/privacy/page';
import { ONBOARDED_KEY } from '@/lib/constants';

const sdk = vi.hoisted(() => ({ listeners: new Set<() => void>(), closeView: vi.fn(async () => {}) }));
vi.mock('@apps-in-toss/web-framework', () => ({
  closeView: sdk.closeView,
  graniteEvent: { addEventListener: (_event: string, { onEvent }: { onEvent: () => void }) => {
    sdk.listeners.add(onEvent);
    return () => sdk.listeners.delete(onEvent);
  } },
}));
vi.mock('@toss/tds-mobile', () => ({
  Button: ({ children, onClick, disabled }: ButtonHTMLAttributes<HTMLButtonElement>) => <button onClick={onClick} disabled={disabled}>{children}</button>,
  Toast: () => null,
}));
vi.mock('@/lib/bridge', () => ({ haptic: vi.fn(), logEvent: vi.fn() }));
vi.mock('@/components/BannerAd', () => ({ default: () => null }));
vi.mock('@/components/AdButton', () => ({ default: () => null }));
vi.mock('@/components/PlantDisplay', () => ({ default: () => null }));
vi.mock('@/components/ShareSheet', () => ({ default: ({ onClose }: { onClose: () => void }) => <div role="dialog" aria-label="공유"><button onClick={onClose}>닫기</button></div> }));

let container: HTMLDivElement;
let root: Root;
const render = (node: ReactNode) => act(() => root.render(node));
const click = (button: HTMLElement) => act(() => button.click());
const nativeBack = () => act(() => sdk.listeners.forEach(listener => listener()));
const clickText = (text: string, selector = 'button') => {
  const button = Array.from(container.querySelectorAll<HTMLElement>(selector)).find(node => node.textContent?.trim() === text);
  if (!button) throw new Error(`Missing button: ${text}`);
  click(button);
};
const currentTab = () => container.querySelector('nav [aria-current="page"]')?.textContent;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-16T10:00:00+09:00'));
  sdk.closeView.mockClear();
  window.history.replaceState({ __NA: true }, '', '/');
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  expect(sdk.listeners.size).toBe(0);
  container.remove();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('screen back routing', () => {
  it('routes native back through onboarding without losing the typed name', async () => {
    render(<HomePage />);
    clickText('다음');
    clickText('다음');
    const input = container.querySelector('input')!;
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '초록이');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(container.querySelector('header')).toBeNull();
    expect(container.textContent).not.toContain('이전');
    nativeBack();
    expect(container.textContent).toContain('2 / 3');
    expect(document.activeElement?.textContent).toBe('이렇게 키워요');
    clickText('다음');
    expect(container.querySelector('input')?.value).toBe('초록이');
    nativeBack();
    nativeBack();
    expect(container.textContent).toContain('1 / 3');
    expect(sdk.closeView).not.toHaveBeenCalled();
    await act(async () => { nativeBack(); });
    expect(sdk.closeView).toHaveBeenCalledOnce();
  });

  it('returns through visited tabs, preserving their URLs, before closing at home', async () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    render(<HomePage />);
    expect(container.querySelector('header')).toBeNull();
    clickText('정원', 'nav button');
    clickText('프로필', 'nav button');
    expect(window.location.search).toBe('?tab=profile');
    expect(window.history.state.__NA).toBe(true);
    nativeBack();
    expect(currentTab()).toBe('정원');
    expect(window.location.search).toBe('?tab=garden');
    nativeBack();
    expect(currentTab()).toBe('홈');
    expect(window.location.search).toBe('');
    expect(sdk.closeView).not.toHaveBeenCalled();
    await act(async () => { nativeBack(); });
    expect(sdk.closeView).toHaveBeenCalledOnce();
  });

  it('dismisses sharing, name editing, and a mission before leaving the current tab', () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    render(<HomePage />);
    click(container.querySelector<HTMLButtonElement>('[aria-label="공유 화면 열기"]')!);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    nativeBack();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    clickText('이름 짓기 ✏️');
    expect(container.querySelector('[aria-labelledby="plant-name-title"]')).not.toBeNull();
    nativeBack();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    const mission = Array.from(container.querySelectorAll<HTMLButtonElement>('[aria-labelledby="missions-title"] button'))
      .find(button => !button.disabled && button.textContent?.includes('하기'))!;
    click(mission);
    expect(container.querySelector('[aria-labelledby="mission-title"]')).not.toBeNull();
    nativeBack();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(currentTab()).toBe('홈');
    expect(sdk.closeView).not.toHaveBeenCalled();
  });

  it.each([
    ['/terms', TermsPage, '서비스 이용약관'],
    ['/privacy', PrivacyPage, '개인정보처리방침'],
  ] as const)('returns from %s to the profile even when the home component remounts', async (pathname, Page, title) => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    render(<HomePage />);
    clickText('정원', 'nav button');
    clickText('프로필', 'nav button');
    expect(container.querySelector(`a[href="${pathname}"]`)).not.toBeNull();
    window.history.pushState({ __NA: true }, '', pathname);
    render(<Page />);
    expect(container.querySelector('h1')?.textContent?.trim()).toBe(title);
    expect(container.textContent).not.toContain('프로필로 돌아가기');
    // History traversal uses the event loop, so restore real timers for this integration check.
    vi.useRealTimers();
    await act(async () => {
      const popped = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
      sdk.listeners.forEach(listener => listener());
      await popped;
    });
    expect(window.location.pathname + window.location.search).toBe('/?tab=profile');
    render(<HomePage />);
    expect(currentTab()).toBe('프로필');
    nativeBack();
    expect(currentTab()).toBe('정원');
    nativeBack();
    expect(currentTab()).toBe('홈');
    expect(sdk.closeView).not.toHaveBeenCalled();
  });
});
