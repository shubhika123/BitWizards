"use client";

import React from "react";
import { Sparkles } from "lucide-react";

type GenieEntryButtonProps = {
  active?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: "sm" | "md";
};

export function GenieEntryButton({
  active = false,
  onClick,
  className = "",
  size = "sm",
}: GenieEntryButtonProps) {
  const sizeClasses =
    size === "md"
      ? "min-h-11 px-4 py-2 text-[11px] gap-1.5"
      : "min-h-9 px-3 py-1.5 text-[10px] gap-1";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 font-bold rounded-full flex items-center transition-all cursor-pointer border ${sizeClasses} ${
        active
          ? "bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] text-white border-transparent shadow-sm"
          : "bg-white text-[#ff3f6c] border-[#eaeaec] hover:bg-pink-50 hover:border-[#ff3f6c]/30"
      } ${className}`}
    >
      <Sparkles className={`${size === "md" ? "w-4 h-4" : "w-3 h-3"} ${active ? "animate-pulse" : ""}`} />
      <span>Genie</span>
      {active && (
        <span className="text-[8px] font-black uppercase tracking-wider bg-white/25 px-1 rounded">AI</span>
      )}
    </button>
  );
}
