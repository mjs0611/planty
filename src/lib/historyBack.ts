import { closeView, graniteEvent } from '@apps-in-toss/web-framework';

const GUARD_KEY = '__plantyBackGuard';
let entryPathname: string | undefined;

// 상태형 화면은 기존 가드로 브라우저 뒤로가기를 처리한다. 콜백이 없는 약관 화면은
// Next의 실제 히스토리를 되돌린다. 토스 backEvent는 기본 동작을 차단하므로 직접 처리한다.
export function installHistoryBack(onBack?: () => boolean): () => void {
  if (typeof window === 'undefined') return () => {};
  const pathname = window.location.pathname;
  entryPathname ??= pathname;
  const close = () => { void Promise.resolve().then(() => closeView()).catch(() => {}); };
  const arm = () => window.history.pushState({ ...window.history.state, [GUARD_KEY]: true }, '');
  // Next의 숨겨진 화면 복귀와 StrictMode에서 가드를 중복해서 쌓지 않는다.
  if (onBack && !window.history.state?.[GUARD_KEY]) arm();
  const onPop = () => {
    if (!onBack || window.location.pathname !== pathname) return;
    if (onBack()) { arm(); return; }
    close();
  };
  let unsubscribe: (() => void) | undefined;
  try {
    unsubscribe = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        if (onBack) {
          if (!onBack()) close();
        } else if (pathname !== entryPathname) {
          window.history.back();
        } else {
          close();
        }
      },
    });
  } catch { /* 일반 브라우저에는 네이티브 브리지가 없다. popstate는 유지한다. */ }
  if (onBack) window.addEventListener('popstate', onPop);
  return () => {
    unsubscribe?.();
    window.removeEventListener('popstate', onPop);
  };
}
