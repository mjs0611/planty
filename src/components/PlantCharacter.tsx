"use client";
import React from "react";
import type { PlantStage, PlantType } from "@/types/plant";

interface Props {
  stage: PlantStage;
  plantType: PlantType;
  isWilting?: boolean;
  isDead?: boolean;
  isHappy?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SN: Record<PlantStage, number> = {
  seed: 1, sprout: 2, young: 3, bud: 4,
  flower: 5, fruit: 6, bloom: 7, special: 8,
};

// Plant leaf/petal colors by type
const LC: Record<PlantType, { m: string; l: string; d: string; s: string }> = {
  green:     { m: "#58B56C", l: "#80D090", d: "#38804A", s: "#489048" },
  flower:    { m: "#EE82B4", l: "#FFAAD2", d: "#C85890", s: "#58B56C" },
  cactus:    { m: "#3E9A54", l: "#5CBE72", d: "#246A38", s: "#2E7840" },
  sunflower: { m: "#F5C030", l: "#FFE068", d: "#C09010", s: "#8B7020" },
  rose:      { m: "#E84060", l: "#FF8090", d: "#B82040", s: "#58B56C" },
  bamboo:    { m: "#5DB56C", l: "#80D090", d: "#3A7A48", s: "#4A8844" },
  mushroom:  { m: "#C49A60", l: "#DEC090", d: "#9A7040", s: "#7A5030" },
  succulent: { m: "#7AC0A8", l: "#A0E0CC", d: "#4A9080", s: "#3A7060" },
  clover:    { m: "#4ECC68", l: "#78EC8C", d: "#28A040", s: "#38904A" },
  monstera:  { m: "#3A9050", l: "#5CB870", d: "#1A6030", s: "#2A7040" },
};

// Terracotta clay pot base colors
const P = {
  b: "#B5713A", bh: "#D49050", be: "#8B4010",
  r: "#C07840", rh: "#DCAA72",
  sl: "#5C2C10", sh: "#7A4022",
};

// ─── Stage 1: Seed ───────────────────────────────────────────────────
function SeedTop({ c }: { c: typeof LC[PlantType] }) {
  return (
    <g>
      <ellipse cx="100" cy="86" rx="10" ry="6" fill={c.d} opacity="0.65" />
      <ellipse cx="100" cy="84" rx="7" ry="5" fill={c.m} opacity="0.8" />
    </g>
  );
}

// ─── Stage 2: Sprout (matches reference image style) ─────────────────
function SproutTop({ c }: { c: typeof LC[PlantType] }) {
  return (
    <g>
      {/* stem */}
      <path d="M100 88 Q97 74 93 58" stroke={c.s} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      {/* left leaf */}
      <g transform="rotate(-32 80 54)">
        <ellipse cx="80" cy="54" rx="12" ry="16" fill={c.m} />
        <ellipse cx="79" cy="52" rx="7" ry="10" fill={c.l} opacity="0.55" />
      </g>
      {/* right leaf with cute face */}
      <g transform="rotate(18 110 42)">
        <ellipse cx="110" cy="42" rx="14" ry="18" fill={c.m} />
        <ellipse cx="109" cy="40" rx="9" ry="12" fill={c.l} opacity="0.5" />
        <circle cx="105" cy="37" r="2.2" fill={c.d} />
        <circle cx="114" cy="38" r="2.2" fill={c.d} />
        <path d="M103 45 Q109 50 115 45" stroke={c.d} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

// ─── Stage 3: Young ──────────────────────────────────────────────────
function YoungTop({ c, t }: { c: typeof LC[PlantType]; t: PlantType }) {
  if (t === "cactus") {
    return (
      <g>
        <rect x="89" y="52" width="22" height="38" rx="11" fill={c.m} />
        <path d="M89 68 Q74 64 72 55 Q71 47 78 47" stroke={c.m} strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M111 70 Q126 66 128 57 Q129 49 122 49" stroke={c.m} strokeWidth="12" strokeLinecap="round" fill="none" />
        <rect x="88" y="54" width="20" height="34" rx="9" fill={c.l} opacity="0.27" />
        {[60, 68, 76].map(y => (
          <React.Fragment key={y}>
            <line x1="89" y1={y} x2="83" y2={y - 3} stroke={c.d} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="111" y1={y} x2="117" y2={y - 3} stroke={c.d} strokeWidth="1.5" strokeLinecap="round" />
          </React.Fragment>
        ))}
      </g>
    );
  }
  return (
    <g>
      <path d="M100 88 Q100 76 100 62" stroke={c.s} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M100 82 Q88 70 80 58" stroke={c.s} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M100 78 Q112 66 120 54" stroke={c.s} strokeWidth="4" strokeLinecap="round" fill="none" />
      <g transform="rotate(-20 80 56)">
        <ellipse cx="80" cy="56" rx="12" ry="15" fill={c.m} />
        <ellipse cx="79" cy="54" rx="7" ry="9" fill={c.l} opacity="0.55" />
      </g>
      <g transform="rotate(20 120 52)">
        <ellipse cx="120" cy="52" rx="12" ry="15" fill={c.m} />
        <ellipse cx="119" cy="50" rx="7" ry="9" fill={c.l} opacity="0.55" />
      </g>
      <ellipse cx="100" cy="60" rx="13" ry="16" fill={c.m} />
      <ellipse cx="99" cy="58" rx="8" ry="10" fill={c.l} opacity="0.55" />
    </g>
  );
}

// ─── Stage 4: Bud ────────────────────────────────────────────────────
function BudTop({ c, t }: { c: typeof LC[PlantType]; t: PlantType }) {
  const budColor = t === "cactus" ? "#FF8FAA" : c.m;
  const budHi = t === "cactus" ? "#FFB5C5" : c.l;
  return (
    <g>
      <path d="M100 88 Q98 73 96 56" stroke={c.s} strokeWidth="5" strokeLinecap="round" fill="none" />
      <g transform="rotate(-28 82 70)">
        <ellipse cx="82" cy="70" rx="10" ry="14" fill={c.m} />
        <ellipse cx="81" cy="68" rx="6" ry="8.5" fill={c.l} opacity="0.5" />
      </g>
      <ellipse cx="96" cy="46" rx="11" ry="13" fill={budColor} />
      <ellipse cx="95" cy="43" rx="7" ry="8.5" fill={budHi} opacity="0.55" />
      <path d="M90 54 Q96 60 102 54" stroke={c.s} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─── Stage 5: Flower ─────────────────────────────────────────────────
function FlowerTop({ c, t }: { c: typeof LC[PlantType]; t: PlantType }) {
  const angles8 = [0, 45, 90, 135, 180, 225, 270, 315];
  if (t === "cactus") {
    return (
      <g>
        <rect x="88" y="44" width="24" height="48" rx="12" fill={c.m} />
        <rect x="87" y="46" width="22" height="44" rx="10" fill={c.l} opacity="0.24" />
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <g key={i} transform={`rotate(${a} 100 42)`}>
            <ellipse cx="100" cy="31" rx="6" ry="10" fill="#FF8FAA" opacity="0.9" />
          </g>
        ))}
        <circle cx="100" cy="42" r="9" fill="#FFE040" />
        <circle cx="100" cy="42" r="6" fill="#F5C030" />
      </g>
    );
  }
  return (
    <g>
      <path d="M100 88 Q100 76 100 60" stroke={c.s} strokeWidth="5" strokeLinecap="round" fill="none" />
      {angles8.map((a, i) => (
        <g key={i} transform={`rotate(${a} 100 52)`}>
          <ellipse cx="100" cy="37" rx={t === "flower" ? 9 : 8} ry={t === "flower" ? 14 : 12} fill={c.m} opacity="0.88" />
          <ellipse cx="100" cy="38" rx={t === "flower" ? 5 : 4} ry={t === "flower" ? 8 : 7} fill={c.l} opacity="0.45" />
        </g>
      ))}
      <circle cx="100" cy="52" r="11" fill="#F5D050" />
      <circle cx="100" cy="52" r="7.5" fill="#F0B830" />
    </g>
  );
}

// ─── Stage 6: Fruit ──────────────────────────────────────────────────
function FruitTop({ c, t }: { c: typeof LC[PlantType]; t: PlantType }) {
  const fc = t === "flower" ? "#FF6B8A" : t === "cactus" ? "#FF9040" : "#E05050";
  const fh = t === "flower" ? "#FF95B0" : t === "cactus" ? "#FFBA80" : "#F07070";
  const fruits = [{ cx: 88, cy: 52 }, { cx: 100, cy: 48 }, { cx: 112, cy: 52 }];
  return (
    <g>
      <path d="M100 88 Q94 73 88 58" stroke={c.s} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M100 88 Q100 72 100 56" stroke={c.s} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M100 88 Q106 73 112 58" stroke={c.s} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <g transform="rotate(-18 82 70)"><ellipse cx="82" cy="70" rx="10" ry="13" fill={c.m} /></g>
      <g transform="rotate(18 118 70)"><ellipse cx="118" cy="70" rx="10" ry="13" fill={c.m} /></g>
      {fruits.map((f, i) => (
        <g key={i}>
          <circle cx={f.cx} cy={f.cy} r="10.5" fill={fc} />
          <circle cx={f.cx - 2} cy={f.cy - 2} r="5.5" fill={fh} opacity="0.55" />
          <path d={`M${f.cx} ${f.cy - 10} Q${f.cx + 2} ${f.cy - 15} ${f.cx + 4} ${f.cy - 13}`}
            stroke={c.s} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

// ─── Stage 7: Bloom ──────────────────────────────────────────────────
function BloomTop({ c, t }: { c: typeof LC[PlantType]; t: PlantType }) {
  if (t === "cactus") {
    const fp = [{ x: 100, y: 34 }, { x: 68, y: 32 }, { x: 132, y: 36 }];
    return (
      <g>
        <path d="M100 88 Q86 70 78 52" stroke={c.s} strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="88" y="36" width="24" height="54" rx="12" fill={c.m} />
        <path d="M88 56 Q70 52 68 42 Q67 34 75 34" stroke={c.m} strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M112 58 Q130 54 132 44 Q133 36 125 36" stroke={c.m} strokeWidth="14" strokeLinecap="round" fill="none" />
        <rect x="87" y="38" width="22" height="50" rx="10" fill={c.l} opacity="0.24" />
        {fp.map((p, i) => (
          <g key={i}>
            {[0, 60, 120, 180, 240, 300].map((a, j) => (
              <g key={j} transform={`rotate(${a} ${p.x} ${p.y})`}>
                <ellipse cx={p.x} cy={p.y - 11} rx="5" ry="9" fill="#FF8FAA" opacity="0.9" />
              </g>
            ))}
            <circle cx={p.x} cy={p.y} r="8" fill="#FFE040" />
          </g>
        ))}
      </g>
    );
  }
  const stems = [
    "M100 88 Q87 74 78 56", "M100 88 Q96 73 94 56",
    "M100 88 Q104 73 106 56", "M100 88 Q113 74 122 56",
  ];
  if (t === "flower") {
    const fp = [{ cx: 80, cy: 46, r: 15 }, { cx: 100, cy: 40, r: 16 }, { cx: 118, cy: 44, r: 15 }];
    return (
      <g>
        {stems.map((d, i) => <path key={i} d={d} stroke={c.s} strokeWidth="4" strokeLinecap="round" fill="none" />)}
        {fp.map((f, i) => (
          <g key={i}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, j) => (
              <g key={j} transform={`rotate(${a} ${f.cx} ${f.cy})`}>
                <ellipse cx={f.cx} cy={f.cy - f.r * 0.72} rx="7" ry="11" fill={c.m} opacity="0.88" />
              </g>
            ))}
            <circle cx={f.cx} cy={f.cy} r="9" fill="#F5D050" />
          </g>
        ))}
      </g>
    );
  }
  const lp = [
    { cx: 76, cy: 50, rx: 13, ry: 17, rot: -35 }, { cx: 94, cy: 43, rx: 14, ry: 18, rot: -10 },
    { cx: 113, cy: 44, rx: 14, ry: 18, rot: 20 }, { cx: 124, cy: 52, rx: 12, ry: 16, rot: 32 },
    { cx: 88, cy: 62, rx: 11, ry: 15, rot: -20 }, { cx: 112, cy: 60, rx: 11, ry: 15, rot: 15 },
  ];
  return (
    <g>
      {stems.map((d, i) => <path key={i} d={d} stroke={c.s} strokeWidth="4" strokeLinecap="round" fill="none" />)}
      {lp.map((l, i) => (
        <g key={i} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}>
          <ellipse cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill={c.m} />
          <ellipse cx={l.cx - 1} cy={l.cy - 2} rx={l.rx * 0.58} ry={l.ry * 0.58} fill={c.l} opacity="0.5" />
        </g>
      ))}
    </g>
  );
}

// ─── Stage 8: Special (Golden) ───────────────────────────────────────
function SpecialTop() {
  const gm = "#F5C030"; const gl = "#FFE068"; const gd = "#C09010";
  const lp = [
    { cx: 76, cy: 50, rx: 14, ry: 18, rot: -35 }, { cx: 94, cy: 43, rx: 15, ry: 19, rot: -10 },
    { cx: 113, cy: 44, rx: 15, ry: 19, rot: 20 }, { cx: 124, cy: 52, rx: 13, ry: 17, rot: 32 },
  ];
  const sparks = [{ x: 65, y: 36 }, { x: 136, y: 33 }, { x: 100, y: 26 }, { x: 55, y: 62 }, { x: 145, y: 58 }, { x: 82, y: 30 }, { x: 118, y: 28 }];
  return (
    <g>
      <ellipse cx="100" cy="55" rx="50" ry="42" fill="#FFD700" opacity="0.09" />
      <ellipse cx="100" cy="55" rx="36" ry="30" fill="#FFD700" opacity="0.13" />
      {["M100 88 Q88 74 79 56", "M100 88 Q96 73 95 56", "M100 88 Q104 73 106 56", "M100 88 Q113 74 122 56"].map((d, i) => (
        <path key={i} d={d} stroke={gd} strokeWidth="5" strokeLinecap="round" fill="none" />
      ))}
      {lp.map((l, i) => (
        <g key={i} transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}>
          <ellipse cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry} fill={gm} />
          <ellipse cx={l.cx - 1} cy={l.cy - 2} rx={l.rx * 0.58} ry={l.ry * 0.58} fill={gl} opacity="0.6" />
        </g>
      ))}
      {sparks.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`} opacity="0.9">
          <path d="M0-5L0 5M-5 0L5 0M-3.5-3.5L3.5 3.5M-3.5 3.5L3.5-3.5" stroke="#FFE060" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────────
export default function PlantCharacter({
  stage, plantType,
  isWilting = false, isDead = false, isHappy = false,
  className, style,
}: Props) {
  const uid = React.useId().replace(/:/g, "_");
  const c = LC[plantType];
  const sn = SN[stage];

  // Mouth curve varies by mood
  const mouth = isDead
    ? "M82 174 Q100 164 118 174"    // frown
    : isWilting
    ? "M84 173 Q100 167 116 173"    // slight frown
    : isHappy
    ? "M80 168 Q100 188 120 168"    // big smile
    : "M82 172 Q100 184 118 172";   // normal smile

  return (
    <svg
      viewBox="0 0 200 215"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
      aria-label={`${plantType} ${stage}`}
    >
      <defs>
        {/* Pot body radial gradient — upper-left highlight */}
        <radialGradient id={`pb${uid}`} cx="34%" cy="28%" r="72%">
          <stop offset="0%" stopColor={P.bh} />
          <stop offset="52%" stopColor={P.b} />
          <stop offset="100%" stopColor={P.be} />
        </radialGradient>
        {/* Rim gradient */}
        <radialGradient id={`rm${uid}`} cx="50%" cy="20%" r="78%">
          <stop offset="0%" stopColor={P.rh} />
          <stop offset="68%" stopColor={P.r} />
          <stop offset="100%" stopColor={P.be} />
        </radialGradient>
        {/* Soil gradient */}
        <radialGradient id={`sl${uid}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={P.sh} />
          <stop offset="100%" stopColor={P.sl} />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="100" cy="209" rx="60" ry="6" fill="rgba(0,0,0,0.11)" />

      {/* ── Pot body ── spherical-ish trapezoid */}
      <path
        d="M30 92 C24 108, 24 150, 28 178 Q28 200, 46 200 L154 200 Q172 200, 172 178 C176 150, 176 108, 170 92 Z"
        fill={`url(#pb${uid})`}
      />

      {/* Rim outer ring (side band) */}
      <ellipse cx="100" cy="92" rx="72" ry="13" fill={`url(#rm${uid})`} />
      {/* Rim top face */}
      <ellipse cx="100" cy="86" rx="60" ry="9" fill={P.r} />
      <ellipse cx="100" cy="85" rx="57" ry="7.5" fill={P.rh} opacity="0.32" />

      {/* Soil */}
      <ellipse cx="100" cy="92" rx="57" ry="8" fill={`url(#sl${uid})`} />
      <ellipse cx="100" cy="90" rx="46" ry="5" fill={P.sh} opacity="0.2" />

      {/* ── Plant top (varies by stage × type) ── */}
      {sn === 1 && <SeedTop c={c} />}
      {sn === 2 && <SproutTop c={c} />}
      {sn === 3 && <YoungTop c={c} t={plantType} />}
      {sn === 4 && <BudTop c={c} t={plantType} />}
      {sn === 5 && <FlowerTop c={c} t={plantType} />}
      {sn === 6 && <FruitTop c={c} t={plantType} />}
      {sn === 7 && <BloomTop c={c} t={plantType} />}
      {sn === 8 && <SpecialTop />}

      {/* ── Pot face ── */}
      {/* Left eye */}
      <circle cx="83" cy="152" r="5.5" fill={P.sl} />
      <circle cx="85" cy="150" r="1.8" fill="rgba(255,255,255,0.35)" />
      {/* Right eye */}
      <circle cx="117" cy="152" r="5.5" fill={P.sl} />
      <circle cx="119" cy="150" r="1.8" fill="rgba(255,255,255,0.35)" />
      {/* Mouth */}
      <path d={mouth} stroke={P.sl} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
