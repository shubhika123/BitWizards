"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, MapPin, Compass } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";

export default function BazaarHeader() {
  const { user } = useAuthStore();
  const {
    step,
    activeCity,
    activeState,
    themeColors,
    setSelectedRadius,
  } = useBazaarStore();

  // Steps 2-6 render their own headers; only the discover feed uses this one.
  if (!themeColors || step !== 1) return null;

  const displayCity = user?.city || activeCity || "Your city";
  const displayLabel = activeState && displayCity === activeCity
    ? `${displayCity}, ${activeState}`
    : displayCity;

  return (
    <>
      <header className="w-full px-3.5 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <span className="font-extrabold text-xs text-gray-800 tracking-wider uppercase">
            APNA BAZAAR
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-600 scale-95">
          <Heart className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
          <ShoppingBag className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
        </div>
      </header>

      {/* Registered city strip — display only; edit it from My Profile. */}
      <div className="px-3.5 py-1.5 border-b border-gray-100 bg-[#FAFAFA] text-gray-600 relative z-40">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#ff3f6c]" />
            <span className="shrink-0">Delivering to</span>
            <span className="truncate font-black text-slate-700">{displayLabel}</span>
          </div>

          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    useBazaarStore.getState().setUserLocation(
                      position.coords.latitude,
                      position.coords.longitude
                    );
                  },
                  (error) => {
                    console.warn("Geolocation failed", error);
                    setSelectedRadius(5);
                  }
                );
              }
            }}
            className="shrink-0 border border-gray-200 bg-white text-slate-600 px-2 py-0.5 rounded-md text-[8.5px] font-black flex items-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-3xs"
          >
            <Compass className="w-3 h-3 text-gray-500" />
            <span>Near Me</span>
          </button>
        </div>
      </div>
    </>
  );
}
