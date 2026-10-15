"use client";
import { Button } from "@toss/tds-mobile";
import { useDialogFocus } from "@/hooks/useDialogFocus";

export default function PestModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLElement>(true, onClose);
  return (
    <div className="dialog-backdrop fixed inset-0 z-[70] bg-black/50 p-4 flex items-center justify-center overflow-y-auto" onClick={onClose}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pest-title" tabIndex={-1}
        className="dialog-panel toss-card rounded-3xl p-5 w-full max-w-sm max-h-[calc(100dvh-32px)] overflow-y-auto" onClick={event => event.stopPropagation()}>
        <h2 id="pest-title" className="text-xl font-bold mb-3" style={{ color: "var(--toss-on-surface)" }}>해충을 보내요</h2>
        <p className="text-base leading-relaxed mb-5" style={{ color: "var(--toss-on-surface-variant)" }}>무료로 해충을 보내고 돌봄을 이어가요. 닫아도 식물 건강이 줄지 않아요.</p>
        <Button display="full" color="primary" size="large" onClick={onClose}>무료로 보내기</Button>
      </section>
    </div>
  );
}
