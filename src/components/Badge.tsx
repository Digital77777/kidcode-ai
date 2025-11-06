import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  earned: boolean;
  rarity?: "common" | "rare" | "epic" | "legendary";
  className?: string;
}

const rarityColors = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-orange-500",
};

export const BadgeComponent = ({
  title,
  description,
  icon,
  earned,
  rarity = "common",
  className,
}: BadgeProps) => {
  return (
    <div
      className={cn(
        "playful-card flex flex-col items-center text-center p-4 transition-all duration-300",
        earned ? "hover:scale-105 cursor-pointer" : "opacity-50",
        className
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-3 relative",
          earned
            ? `bg-gradient-to-br ${rarityColors[rarity]} shadow-lg`
            : "bg-muted"
        )}
      >
        {earned ? (
          icon || <Award className="w-8 h-8 text-white" />
        ) : (
          <Lock className="w-6 h-6 text-muted-foreground" />
        )}
        {earned && (
          <div className="absolute inset-0 rounded-full animate-glow" />
        )}
      </div>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};
