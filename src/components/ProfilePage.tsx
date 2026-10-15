"use client";
import { PlantState } from "@/types/plant";
import { STAGE_INFO, getPlantImage } from "@/lib/plantState";
import { PLANT_TYPE_INFO } from "@/lib/season";
import { Button } from "@toss/tds-mobile";
import Link from "next/link";

interface Props {
  plant: PlantState;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onRecover: () => void;
}

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div
      className="toss-card rounded-2xl p-3 flex flex-col items-center gap-0.5 text-center"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="text-sm font-bold uppercase tracking-tight" style={{ color: "var(--toss-on-surface-variant)" }}>
        {label}
      </p>
      <p className="text-lg font-extrabold" style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}>
        {value}
      </p>
    </div>
  );
}

function SettingRow({
  label,
  value,
  onClick,
  href,
  checked,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  href?: string;
  checked?: boolean;
}) {
  const content = <>
    <span className="text-base font-medium" style={{ color: "var(--toss-on-surface)" }}>{label}</span>
    {value && <span className="text-sm font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>{value}</span>}
    {href && <span aria-hidden="true" style={{ color: "var(--toss-on-surface-variant)" }}>›</span>}
  </>;
  if (href) return <Link href={href} className="w-full min-h-12 flex items-center justify-between gap-3 px-4 py-3 text-left">{content}</Link>;
  return (
    <button
      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      role="switch" aria-checked={checked}
      aria-label={label}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export default function ProfilePage({ plant, theme, onToggleTheme, onRecover }: Props) {
  const typeInfo = PLANT_TYPE_INFO[plant.plantType];
  const stageInfo = STAGE_INFO[plant.stage];
  const progress = Math.round((plant.xp / plant.xpRequired) * 100);

  return (
    <div className="pb-8">
      {/* Plant identity card */}
      <div className="mx-4 mt-2 toss-card rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "rgba(0,100,255,0.06)",
              animation: "breathe 4s ease-in-out infinite",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getPlantImage(plant.stage, plant.plantType)}
              alt={stageInfo.name}
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xl font-black [overflow-wrap:anywhere]"
              style={{ color: "var(--toss-on-surface)", fontFamily: "var(--font-headline, sans-serif)" }}
            >
              {plant.name || stageInfo.name}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--toss-on-surface-variant)" }}>
              {stageInfo.name} · {plant.totalDaysAlive}일째 · {typeInfo.emoji} {typeInfo.name}
            </p>
            {/* XP bar */}
            <div className="mt-2">
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--toss-surface-high)" }}>
                <div
                  className="progress-fill h-full rounded-full"
                  style={{
                    transform: `scaleX(${Math.min(progress, 100) / 100})`,
                    background: "linear-gradient(to right, #004ecb, #0064ff)",
                  }}
                />
              </div>
              <p className="text-sm mt-1 font-semibold" style={{ color: "var(--toss-primary)" }}>
                {plant.xp} / {plant.xpRequired} XP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mx-4 mt-2">
        <StatCard label="연속" value={`${plant.streak}일`} emoji="🔥" />
        <StatCard label="최고 연속 기록" value={`${plant.maxStreak}일`} emoji="⭐" />
        <StatCard label="정원" value={`${plant.garden.length}그루`} emoji="🌱" />
      </div>

      {/* Settings */}
      <div className="mx-4 mt-2 toss-card rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-1">
          <p className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--toss-on-surface-variant)" }}>
            설정
          </p>
        </div>
        <SettingRow
          label="다크모드"
          value={theme === "dark" ? "켜짐 🌙" : "꺼짐 ☀️"}
          checked={theme === "dark"}
          onClick={onToggleTheme}
        />
        <div style={{ height: 1, backgroundColor: "var(--toss-surface-high)" }} className="mx-4" />
        <SettingRow label="개인정보 처리방침" href="/privacy" />
        <div style={{ height: 1, backgroundColor: "var(--toss-surface-high)" }} className="mx-4" />
        <SettingRow label="이용약관" href="/terms" />
      </div>

      {/* Danger zone */}
      {(plant.isDead || plant.isWilting) && (
        <div className="mx-4 mt-2">
          <Button display="full" color="primary" size="large" onClick={onRecover}>
            무료로 다시 돌보기
          </Button>
        </div>
      )}

      <p className="text-center text-sm mt-6 mb-2" style={{ color: "var(--toss-on-surface-variant)" }}>
        Planty v0.1.0 · Made with 🌿
      </p>
    </div>
  );
}
