"use client";
import { Mission } from "@/types/plant";
import { useState, useRef, useCallback, useEffect } from "react";
import { haptic } from "@/lib/bridge";
import { useDialogFocus } from "@/hooks/useDialogFocus";

const HOLD_MISSIONS = new Set(["sunlight", "fertilize", "mist", "hug"]);
const TAP_COUNT = 3;
const HOLD_MS = 1800;

const THEME: Record<string, { gradient: string; ring: string; dot: string }> = {
  water:     { gradient: "from-blue-50 to-sky-100 dark:from-blue-950/60 dark:to-sky-900/40",    ring: "#3B82F6", dot: "bg-blue-500" },
  sunlight:  { gradient: "from-yellow-50 to-amber-100 dark:from-yellow-950/60 dark:to-amber-900/40", ring: "#F59E0B", dot: "bg-amber-400" },
  wipe:      { gradient: "from-green-50 to-emerald-100 dark:from-green-950/60 dark:to-emerald-900/40", ring: "#10B981", dot: "bg-emerald-500" },
  talk:      { gradient: "from-indigo-50 to-violet-100 dark:from-indigo-950/60 dark:to-violet-900/40", ring: "#6366F1", dot: "bg-indigo-500" },
  fertilize: { gradient: "from-lime-50 to-green-100 dark:from-lime-950/60 dark:to-green-900/40",  ring: "#84CC16", dot: "bg-lime-500" },
  observe:   { gradient: "from-orange-50 to-amber-100 dark:from-orange-950/60 dark:to-amber-900/40", ring: "#F97316", dot: "bg-orange-400" },
  prune:     { gradient: "from-emerald-50 to-teal-100 dark:from-emerald-950/60 dark:to-teal-900/40", ring: "#14B8A6", dot: "bg-teal-500" },
  sing:      { gradient: "from-purple-50 to-fuchsia-100 dark:from-purple-950/60 dark:to-fuchsia-900/40", ring: "#A855F7", dot: "bg-purple-500" },
  mist:      { gradient: "from-cyan-50 to-sky-100 dark:from-cyan-950/60 dark:to-sky-900/40",    ring: "#06B6D4", dot: "bg-cyan-500" },
  stretch:   { gradient: "from-teal-50 to-green-100 dark:from-teal-950/60 dark:to-green-900/40", ring: "#0D9488", dot: "bg-teal-500" },
  journal:   { gradient: "from-amber-50 to-yellow-100 dark:from-amber-950/60 dark:to-yellow-900/40", ring: "#D97706", dot: "bg-amber-500" },
  hug:       { gradient: "from-rose-50 to-pink-100 dark:from-rose-950/60 dark:to-pink-900/40",   ring: "#F43F5E", dot: "bg-rose-500" },
};

const DEFAULT_THEME = { gradient: "from-emerald-50 to-green-100 dark:from-emerald-950/60 dark:to-green-900/40", ring: "#10B981", dot: "bg-emerald-500" };

const HINT: Record<string, string> = {
  water:     "탭해서 물을 줘요",
  sunlight:  "꾹 눌러서 햇빛을 비춰요",
  wipe:      "탭해서 잎을 닦아요",
  talk:      "탭해서 말을 걸어요",
  fertilize: "꾹 눌러서 영양제를 줘요",
  observe:   "탭해서 사진을 찍어요",
  prune:     "탭해서 가지를 다듬어요",
  sing:      "탭해서 노래해줘요",
  mist:      "꾹 눌러서 분무기를 뿌려요",
  stretch:   "탭해서 줄기를 세워요",
  journal:   "탭해서 일기를 써요",
  hug:       "꾹 눌러서 안아줘요",
};

const PARTICLE_EMOJI: Record<string, string> = {
  water: "💧", sunlight: "✨", wipe: "🍃", talk: "💬",
  fertilize: "💚", observe: "📸", prune: "🌿", sing: "🎵",
  mist: "🌊", stretch: "⬆️", journal: "✏️", hug: "❤️",
};

type Particle = { id: number; x: number; y: number };

interface Props {
  mission: Mission;
  onComplete: () => void;
  onClose: () => void;
}

export default function MissionInteractionModal({ mission, onComplete, onClose }: Props) {
  const dialogRef = useDialogFocus(true, onClose);
  const isHold = HOLD_MISSIONS.has(mission.id);
  const [taps, setTaps] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const theme = THEME[mission.id] ?? DEFAULT_THEME;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    haptic("confetti");
    setTimeout(() => { onComplete(); onClose(); }, 900);
  }, [onComplete, onClose]);

  const handleTap = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (done) return;
    haptic("success");
    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pid = Date.now() + Math.random();
    setParticles(p => [...p, { id: pid, x, y }]);
    setTaps(t => {
      const next = t + 1;
      if (next >= TAP_COUNT) finish();
      return next;
    });
  }, [done, finish]);

  const startHold = useCallback(() => {
    if (done || intervalRef.current) return;
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      const p = Math.min(elapsed / HOLD_MS, 1);
      setHoldProgress(p);
      if (p >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        finish();
      }
    }, 16);
  }, [done, finish]);

  const endHold = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (!doneRef.current) setHoldProgress(0);
  }, []);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!particles.length) return;
    const t = setTimeout(() => setParticles([]), 700);
    return () => clearTimeout(t);
  }, [particles]);

  const R = 54;
  const circumference = 2 * Math.PI * R;
  const particleEmoji = PARTICLE_EMOJI[mission.id] ?? "✨";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end transition-opacity duration-200 ${mounted ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mission-title" tabIndex={-1}
        className={`relative w-full max-w-[430px] mx-auto max-h-[90dvh] overflow-y-auto bg-gradient-to-b ${theme.gradient} to-white dark:to-gray-900 rounded-t-3xl shadow-2xl transition-transform duration-200 ${mounted ? "translate-y-0" : "translate-y-full"}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        <button onClick={onClose} aria-label="미션 닫기" className="absolute top-2 right-3 text-2xl leading-none font-light" style={{ color: 'var(--toss-on-surface-variant)' }}>×</button>

        {/* Mission info */}
        <div className="text-center pt-4 pb-6 px-6">
          <div aria-hidden="true" className={`mission-symbol text-7xl mb-3 inline-block transition-transform duration-200 ${done ? "scale-125" : "animate-bounce"}`}
            style={{ animationDuration: "2s" }}>
            {mission.emoji}
          </div>
          <h2 id="mission-title" className="text-xl font-bold text-gray-800 dark:text-white">{mission.label}</h2>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--toss-secondary)' }}>+{mission.xpReward} XP</p>
        </div>

        {/* Interaction area */}
        <div className="mission-interaction flex flex-col items-center pb-8 px-6 min-h-[220px] justify-center">
          {done ? (
            <div className="flex flex-col items-center gap-3 animate-fade-in-up" role="status">
              <div className="text-5xl">✅</div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">완료!</p>
              <p className="text-sm" style={{ color: 'var(--toss-on-surface-variant)' }}>잘 돌봐줬어요 💚</p>
            </div>
          ) : isHold ? (
            <div className="flex flex-col items-center gap-4">
              {/* Hold: circular progress ring */}
              <div className="relative w-40 h-40">
                <svg role="progressbar" aria-label="누르기 진행" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(holdProgress * 100)} className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r={R}
                    fill="none" strokeWidth="8"
                    stroke={theme.ring}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - holdProgress)}
                  />
                </svg>
                <button
                  className="absolute inset-3 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-5xl select-none touch-none"
                  aria-label={HINT[mission.id]} aria-describedby="mission-instruction"
                  onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture?.(e.pointerId); startHold(); }}
                  onPointerUp={endHold} onPointerCancel={endHold} onLostPointerCapture={endHold} onBlur={endHold}
                  onContextMenu={e => e.preventDefault()}
                  onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) startHold(); } }}
                  onKeyUp={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); endHold(); } }}
                >
                  {mission.emoji}
                </button>
              </div>
              <p id="mission-instruction" className="text-sm text-center" style={{ color: 'var(--toss-on-surface-variant)' }}>{HINT[mission.id]}<span className="sr-only">. 스페이스 또는 Enter 키를 계속 눌러도 돼요</span></p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Tap: large button with particles */}
              <div className="relative w-40 h-40">
                <button
                  onClick={handleTap}
                  aria-label={HINT[mission.id]} aria-describedby="mission-instruction"
                  className="w-full h-full rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-6xl select-none"
                >
                  {mission.emoji}
                </button>
                {particles.map(p => (
                  <span
                    key={p.id}
                    className="absolute text-xl pointer-events-none animate-float-up"
                    style={{ left: p.x - 10, top: p.y - 10 }}
                  >
                    {particleEmoji}
                  </span>
                ))}
              </div>
              {/* Tap progress dots */}
              <div className="flex gap-2.5 mt-1" aria-hidden="true">
                {Array.from({ length: TAP_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${i < taps ? `${theme.dot} scale-125 shadow-sm` : "bg-gray-200 dark:bg-gray-700"}`}
                  />
                ))}
              </div>
              <p id="mission-instruction" className="text-sm text-center" role="status" style={{ color: 'var(--toss-on-surface-variant)' }}>
                {taps === 0 ? HINT[mission.id] : `${TAP_COUNT - Math.min(taps, TAP_COUNT)}번 더!`}
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
