import React from "react";
import { Sparkles, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";
import Image from "next/image";

export default function BazaarHeader() {
  const { user } = useAuthStore();
  const {
    activeCity,
    activeState,
    themeColors,
    showCityDropdown,
    setShowCityDropdown,
  } = useBazaarStore();

  if (!themeColors) return null;

  return (
    <header className={`w-full px-3.5 py-3 flex items-center justify-between border-b sticky top-0 z-30 transition-all duration-300 ${themeColors.headerBg}`}>
      {/* City Locator */}
      <div className="flex flex-col max-w-[50%]">
        <span className={`font-extrabold text-sm tracking-wide ${themeColors.headerText} flex items-center gap-1.5`}>
          Apna Bazaar <Sparkles className="w-3.5 h-3.5" />
        </span>
        <div className="flex items-center gap-1.5 truncate relative">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-purple-600" />
          <span className="truncate cursor-pointer flex items-center gap-1 text-xs text-gray-700" onClick={() => !user?.city && setShowCityDropdown(!showCityDropdown)}>
            Delivering to {activeCity}{activeState ? `, ${activeState}` : ""}
            {!user?.city && <span className="text-[8px] text-gray-400 font-bold">▼</span>}
          </span>
        </div>
      </div>
    </header>
  );
}
