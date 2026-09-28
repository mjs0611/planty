// 토스 뒤로가기(내비게이션 바·시스템)는 웹뷰 히스토리를 한 칸 되돌리고, 되돌릴 칸이 없으면 미니앱을 닫는다.
// 시작할 때 한 칸 쌓아 두고, popstate에서 앱 안 뒤로가기를 처리한 뒤 다시 쌓는다(심사 통과 앱들과 같은 방식).
// onBack이 false면(첫 화면) 미니앱을 닫는다.
export function installHistoryBack(onBack: () => boolean): () => void {
  if (typeof window === 'undefined') return () => {}
  const arm = () => window.history.pushState(window.history.state, '')
  arm()
  const onPop = () => {
    if (onBack()) { arm(); return }
    import('@apps-in-toss/web-framework')
      .then((m) => m.closeView())
      .catch(() => {})
  }
  window.addEventListener('popstate', onPop)
  return () => window.removeEventListener('popstate', onPop)
}
