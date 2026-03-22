import React from "react";

export function CuteHeart({ className = "w-6 h-6", color = "#EC4899" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 28 C 16 28, 4 19, 4 10 C 4 5, 8 2, 12 2 C 14.5 2, 16 4, 16 4 C 16 4, 17.5 2, 20 2 C 24 2, 28 5, 28 10 C 28 19, 16 28, 16 28 Z" fill={color} />
      <path d="M9 7 C 11 5, 14 6, 14 6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function CuteSparkle({ className = "w-6 h-6", color = "#FBBF24" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 C 16 12, 20 16, 30 16 C 20 16, 16 20, 16 30 C 16 20, 12 16, 2 16 C 12 16, 16 12, 16 2 Z" fill={color} />
      <circle cx="16" cy="16" r="4" fill="white" opacity="0.6" />
    </svg>
  );
}

export function CutePopper({ className = "w-24 h-24" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 48 L 32 28 L 46 38 L 36 58 Z" fill="#60A5FA" />
      <path d="M20 50 L 30 30 L 44 40 L 34 60 Z" fill="#3B82F6" />
      <path d="M30 30 C 34 28, 38 30, 44 40 L 40 44 C 36 38, 30 36, 30 30 Z" fill="#2563EB" />
      
      <circle cx="20" cy="15" r="3" fill="#FBBF24" />
      <circle cx="45" cy="10" r="2.5" fill="#F87171" />
      <circle cx="55" cy="25" r="3.5" fill="#34D399" />
      <rect x="35" y="8" width="3" height="6" fill="#A78BFA" transform="rotate(30 36 11)" />
      
      <path d="M30 30 L 15 10" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
      <path d="M35 33 L 45 5" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
      <path d="M40 37 L 60 20" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
    </svg>
  );
}

export function CuteSproutSplash({ className = "w-32 h-32" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#86EFAC" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#glow)" />
      
      <path d="M25 65 Q 50 45 75 65 L 65 94 L 35 94 Z" fill="#D97706" />
      <path d="M22 65 C 22 58, 78 58, 78 65 C 78 72, 22 72, 22 65 Z" fill="#B45309" />
      <path d="M25 65 C 25 62, 75 62, 75 65 C 75 68, 25 68, 25 65 Z" fill="#92400E" />
      
      <path d="M50 62 C 50 40, 43 35, 43 35" stroke="#4ADE80" strokeWidth="5" strokeLinecap="round" />
      
      <path d="M45 40 C 25 40, 20 20, 43 20 C 48 25, 47 38, 45 40 Z" fill="#22C55E" />
      <path d="M46 36 C 65 30, 68 12, 53 18 C 48 22, 45 34, 46 36 Z" fill="#4ADE80" />
      <path d="M40 33 C 35 28, 33 25, 40 25" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M50 28 C 55 23, 58 20, 50 20" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
      
      <circle cx="42" cy="78" r="3" fill="#1E3A8A" />
      <circle cx="58" cy="78" r="3" fill="#1E3A8A" />
      <circle cx="43" cy="77" r="1" fill="white" />
      <circle cx="59" cy="77" r="1" fill="white" />
      <circle cx="37" cy="80" r="3" fill="#F87171" opacity="0.5" />
      <circle cx="63" cy="80" r="3" fill="#F87171" opacity="0.5" />
      <path d="M46 82 Q 50 86 54 82" stroke="#1E3A8A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
