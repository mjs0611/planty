import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getTossShareLink } from '@apps-in-toss/web-framework';
import ShareSheet from '@/components/ShareSheet';
import { nativeShare } from '@/lib/bridge';
import { getInitialState } from '@/lib/plantState';

vi.mock('@apps-in-toss/web-framework', () => ({ getTossShareLink: vi.fn() }));
vi.mock('@/lib/bridge', () => ({ nativeShare: vi.fn() }));
vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: Object.assign(({ children }: { children: ReactNode }) => <div>{children}</div>, {
    Header: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  }),
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => <button onClick={onClick}>{children}</button>,
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  vi.resetAllMocks();
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

async function sharePlant() {
  act(() => root.render(<ShareSheet plant={{ ...getInitialState(), streak: 7 }} onClose={vi.fn()} />));
  const button = Array.from(container.querySelectorAll('button')).find(node => node.textContent?.includes('공유하기'))!;
  await act(async () => { button.click(); });
  return vi.mocked(nativeShare).mock.calls[0][0];
}

describe('plant sharing', () => {
  it('shares the Toss link with the plant progress', async () => {
    vi.mocked(getTossShareLink).mockResolvedValue('https://toss.im/share/planty');
    const message = await sharePlant();
    expect(getTossShareLink).toHaveBeenCalledExactlyOnceWith('intoss://planty');
    expect(message).toContain('7일 연속 케어 중');
    expect(message).toContain('나도 식물 키워보기 → https://toss.im/share/planty');
    expect(container.textContent).toContain('공유 완료!');
  });

  it.each(['', '   '])('keeps a usable deep link when the SDK returns an empty link (%j)', async link => {
    vi.mocked(getTossShareLink).mockResolvedValue(link);
    expect(await sharePlant()).toContain('나도 식물 키워보기 → intoss://planty');
  });

  it('keeps a usable deep link when Toss link creation fails', async () => {
    vi.mocked(getTossShareLink).mockRejectedValue(new Error('bridge unavailable'));
    expect(await sharePlant()).toContain('나도 식물 키워보기 → intoss://planty');
    expect(nativeShare).toHaveBeenCalledOnce();
  });
});
