import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({
  listeners: new Set<() => void>(),
  closeView: vi.fn(async () => {}),
  subscribe: vi.fn(),
}));
vi.mock('@apps-in-toss/web-framework', () => ({
  closeView: sdk.closeView,
  graniteEvent: { addEventListener: sdk.subscribe },
}));

let installHistoryBack: typeof import('@/lib/historyBack')['installHistoryBack'];
const cleanups: Array<() => void> = [];
const nextState = { __NA: true, __PRIVATE_NEXTJS_INTERNALS_TREE: ['root'] };
const nativeBack = () => sdk.listeners.forEach(listener => listener());
const traverse = async (action: () => void) => {
  const popped = new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
  action();
  await popped;
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  sdk.subscribe.mockImplementation((event: string, { onEvent }: { onEvent: () => void }) => {
    expect(event).toBe('backEvent');
    sdk.listeners.add(onEvent);
    return () => sdk.listeners.delete(onEvent);
  });
  window.history.replaceState(nextState, '', '/');
  ({ installHistoryBack } = await import('@/lib/historyBack'));
});
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  sdk.listeners.clear();
  vi.restoreAllMocks();
});

describe('Toss and browser back navigation', () => {
  it('consumes native back once without browser traversal; closes only at the first screen', async () => {
    const onBack = vi.fn().mockReturnValueOnce(true).mockReturnValue(false);
    const back = vi.spyOn(window.history, 'back');
    cleanups.push(installHistoryBack(onBack));
    nativeBack();
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
    expect(sdk.closeView).not.toHaveBeenCalled();
    nativeBack();
    await vi.waitFor(() => expect(sdk.closeView).toHaveBeenCalledOnce());
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it('keeps Next router state, rearms browser back, and avoids duplicate guards on effect replay', async () => {
    const onBack = vi.fn(() => true);
    const push = vi.spyOn(window.history, 'pushState');
    const cleanup = installHistoryBack(onBack);
    expect(window.history.state).toMatchObject(nextState);
    expect(push).toHaveBeenCalledTimes(1);
    cleanup();
    cleanups.push(installHistoryBack(onBack));
    expect(push).toHaveBeenCalledTimes(1);
    expect(sdk.listeners.size).toBe(1);
    await traverse(() => window.history.back());
    expect(onBack).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledTimes(2);
    expect(window.history.state).toMatchObject(nextState);
    expect(sdk.closeView).not.toHaveBeenCalled();
  });

  it.each(['/terms', '/privacy'])('returns from %s to the profile URL through real history', async pathname => {
    const onBack = vi.fn(() => true);
    const cleanupHome = installHistoryBack(onBack);
    window.history.replaceState(window.history.state, '', '/?tab=profile');
    cleanupHome();
    window.history.pushState(nextState, '', pathname);
    cleanups.push(installHistoryBack());
    await traverse(nativeBack);
    expect(window.location.pathname + window.location.search).toBe('/?tab=profile');
    expect(onBack).not.toHaveBeenCalled();
    expect(sdk.closeView).not.toHaveBeenCalled();
    const push = vi.spyOn(window.history, 'pushState');
    cleanups.push(installHistoryBack(onBack));
    expect(push).not.toHaveBeenCalled();
  });

  it('does not dispatch app back when a popstate changes the Next route', () => {
    const onBack = vi.fn(() => false);
    cleanups.push(installHistoryBack(onBack));
    window.history.replaceState(nextState, '', '/terms');
    window.dispatchEvent(new PopStateEvent('popstate', { state: nextState }));
    expect(onBack).not.toHaveBeenCalled();
    expect(sdk.closeView).not.toHaveBeenCalled();
  });

  it.each(['/terms', '/privacy'])('closes a direct entry to %s instead of leaving the miniapp', async pathname => {
    window.history.replaceState(nextState, '', pathname);
    const back = vi.spyOn(window.history, 'back');
    cleanups.push(installHistoryBack());
    nativeBack();
    await vi.waitFor(() => expect(sdk.closeView).toHaveBeenCalledOnce());
    expect(back).not.toHaveBeenCalled();
  });

  it('keeps browser back working when the native bridge is absent, and cleans up listeners', async () => {
    sdk.subscribe.mockImplementation(() => { throw new Error('outside Toss'); });
    const onBack = vi.fn(() => false);
    const cleanup = installHistoryBack(onBack);
    await traverse(() => window.history.back());
    await vi.waitFor(() => expect(sdk.closeView).toHaveBeenCalledOnce());
    expect(onBack).toHaveBeenCalledOnce();
    cleanup();
    window.dispatchEvent(new PopStateEvent('popstate'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
