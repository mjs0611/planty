"use client";
import { ProgressBar } from "@toss/tds-mobile";

interface Props {
  emoji: string;
  label: string;
  value: number; // 0-100
  color: string; // hex color
}

export default function StatBar({ emoji, label, value, color }: Props) {
  const isLow = value < 30;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-6">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1.5">
          <span className={`font-medium ${isLow ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
          <span className={`font-medium ${isLow ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{Math.round(value)}%</span>
        </div>
        <ProgressBar
          progress={value / 100}
          size="normal"
          color={color}
          animate
        />
      </div>
    </div>
  );
}
