"use client";
import { PlantState } from "@/types/plant";
import { STAGE_INFO, getPlantImage } from "@/lib/plantState";
import { PLANT_TYPE_INFO } from "@/lib/season";
import { Button } from "@toss/tds-mobile";

interface Props {
  plant: PlantState;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onReset: () => void;
}

function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div
      className="toss-card rounded-2xl p-3 flex flex-col items-center gap-0.5 text-center"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: "var(--toss-on-surface-variant)" }}>
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
  danger,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left"
      onClick={onClick}
    >
      <span className="text-sm font-medium" style={{ color: danger ? "#ba1a1a" : "var(--toss-on-surface)" }}>
        {label}
      </span>
      {value && (
        <span className="text-sm font-semibold" style={{ color: "var(--toss-on-surface-variant)" }}>
          {value}
        </span>
      )}
    </button>
  );
}

export default function ProfilePage({ plant, theme, onToggleTheme, onReset }: Props) {
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
              className="text-xl font-black truncate"
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
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(to right, #004ecb, #0064ff)",
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <p className="text-[10px] mt-1 font-semibold" style={{ color: "var(--toss-primary)" }}>
                {plant.xp} / {plant.xpRequired} XP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mx-4 mt-2">
        <StatCard label="연속" value={`${plant.streak}일`} emoji="🔥" />
        <StatCard label="최고 스트릭" value={`${plant.maxStreak}일`} emoji="⭐" />
        <StatCard label="정원" value={`${plant.garden.length}그루`} emoji="🌱" />
      </div>

      {/* Settings */}
      <div className="mx-4 mt-2 toss-card rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--toss-on-surface-variant)" }}>
            설정
          </p>
        </div>
        <SettingRow
          label="다크모드"
          value={theme === "dark" ? "켜짐 🌙" : "꺼짐 ☀️"}
          onClick={onToggleTheme}
        />
        <div style={{ height: 1, backgroundColor: "var(--toss-surface-high)" }} className="mx-4" />
        <SettingRow label="개인정보 처리방침" onClick={() => window.open("/privacy", "_blank")} />
        <div style={{ height: 1, backgroundColor: "var(--toss-surface-high)" }} className="mx-4" />
        <SettingRow label="이용약관" onClick={() => window.open("/terms", "_blank")} />
      </div>

      {/* Danger zone */}
      {plant.isDead && (
        <div className="mx-4 mt-2">
          <Button display="full" color="dark" size="large" onClick={onReset}>
            🌱 새 씨앗 심기
          </Button>
        </div>
      )}

      <p className="text-center text-xs mt-6 mb-2" style={{ color: "var(--toss-on-surface-variant)" }}>
        Planty v0.1.0 · Made with 🌿
      </p>
    </div>
  );
}
