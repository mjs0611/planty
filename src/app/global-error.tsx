"use client";
// 앱 전체가 멈추는 오류 대신 원인과 다시 시도를 보여 준다(토스 앱 안에서만 나는 오류 추적용)
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 24, fontFamily: "system-ui, sans-serif", color: "#191F28" }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginTop: 80 }}>화면을 불러오지 못했어요</p>
        <p style={{ fontSize: 14, color: "#6B7684" }}>잠시 후 다시 시도해 주세요.</p>
        <button onClick={() => reset()} style={{ marginTop: 16, padding: "12px 20px", borderRadius: 12, border: 0, background: "#3182F6", color: "#fff", fontSize: 15 }}>다시 시도</button>
        <p style={{ marginTop: 32, fontSize: 11, color: "#B0B8C1", wordBreak: "break-all" }}>{error?.name}: {error?.message}{error?.digest ? ` (${error.digest})` : ""}</p>
      </body>
    </html>
  );
}
