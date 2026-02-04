import { cn } from "@/lib/utils";

interface CheeseBadgeProps {
  name: string;
  color: string;
  liters?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CheeseBadge({
  name,
  color,
  liters,
  size = "md",
  className,
}: CheeseBadgeProps) {
  // Determine if the color is light or dark for text contrast
  const isLightColor = (hexColor: string) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const textColor = isLightColor(color) ? "text-gray-800" : "text-white";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-transform hover:scale-105",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        textColor,
        className
      )}
      style={{ backgroundColor: color }}
    >
      {name}
      {liters !== undefined && (
        <span className={cn("opacity-80", size === "sm" ? "text-[10px]" : "text-xs")}>
          {liters}Lt
        </span>
      )}
    </span>
  );
}
