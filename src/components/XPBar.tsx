import { Sparkles } from "lucide-react";

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  showLevel?: boolean;
}

export const XPBar = ({ currentXP, maxXP, level, showLevel = true }: XPBarProps) => {
  const percentage = (currentXP / maxXP) * 100;

  return (
    <div className="w-full">
      {showLevel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Level {level}</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {currentXP} / {maxXP} XP
          </span>
        </div>
      )}
      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="xp-bar h-full relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  );
};
