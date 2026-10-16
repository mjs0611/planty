import { CuteSproutSplash } from "./icons";

// Visible only while local state is being restored; no artificial startup delay.
export default function Splash() {
  return (
    <div role="status" aria-label="식물을 불러오고 있어요" className="min-h-dvh flex flex-col items-center gap-4 pt-4" style={{ backgroundColor: "var(--toss-surface)", color: "var(--toss-on-surface)" }}>
      <CuteSproutSplash className="w-20 h-20" />
      <p className="text-3xl font-bold tracking-tight">플랜티</p>
      <p className="text-base" style={{ color: "var(--toss-on-surface-variant)" }}>매일 돌봐주는 나의 가상 식물</p>
    </div>
  );
}
