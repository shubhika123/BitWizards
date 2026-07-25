"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, MapPin, Compass, Pencil, Check, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";

/** Same home-city list used at registration — not the bazaar seller cities API. */
const HOME_CITIES = [
  "Amritsar",
  "Belgaum",
  "Coimbatore",
  "Kolkata",
  "Ludhiana",
  "Madurai",
  "Mumbai",
  "Mysuru",
  "Patna",
  "Salem",
  "Vijayawada",
  "Vizag",
];

export default function BazaarHeader() {
  const { user, updateCity, loading: authLoading } = useAuthStore();
  const {
    step,
    activeCity,
    activeState,
    themeColors,
    setActiveCity,
    setSelectedRadius,
  } = useBazaarStore();

  const [editing, setEditing] = useState(false);
  const [draftCity, setDraftCity] = useState("");
  const [saveError, setSaveError] = useState("");

  // Steps 2-6 render their own headers; only the discover feed uses this one.
  if (!themeColors || step !== 1) return null;

  const displayCity = user?.city || activeCity || "Your city";
  const displayLabel = activeState && displayCity === activeCity
    ? `${displayCity}, ${activeState}`
    : displayCity;

  const openEditor = () => {
    setDraftCity(user?.city || activeCity || "");
    setSaveError("");
    setEditing(true);
  };

  const cancelEditor = () => {
    setEditing(false);
    setSaveError("");
  };

  const saveCity = async () => {
    const next = draftCity.trim();
    if (!next) {
      setSaveError("Please choose a city");
      return;
    }
    try {
      setSaveError("");
      if (user?.user_id) {
        await updateCity(next);
      } else {
        // Guest fallback — persist locally only
        localStorage.setItem("selectedCity", next);
      }
      setActiveCity(next);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not update city");
    }
  };

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

      {/* Registered city strip — display + edit (not bazaar city picker) */}
      <div className="px-3.5 py-1.5 border-b border-gray-100 bg-[#FAFAFA] text-gray-600 relative z-40">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#ff3f6c]" />
            <span className="shrink-0">Delivering to</span>
            <span className="truncate font-black text-slate-700">{displayLabel}</span>
            {!editing && (
              <button
                type="button"
                onClick={openEditor}
                className="shrink-0 inline-flex items-center gap-0.5 text-[#ff3f6c] hover:text-[#e0355f] font-black uppercase tracking-wider ml-1"
                aria-label="Edit delivery city"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
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

        {editing && (
          <div className="mt-2 flex flex-col gap-2 pb-1">
            <p className="text-[9px] font-medium text-gray-400">
              Your home city from registration — Local Bazaar shows sellers near this city.
            </p>
            <div className="flex gap-2">
              <select
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c]"
                aria-label="Edit home city"
              >
                <option value="" disabled>
                  Select your city
                </option>
                {HOME_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                {/* Keep current city visible even if not in the default list */}
                {draftCity && !HOME_CITIES.includes(draftCity) && (
                  <option value={draftCity}>{draftCity}</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => void saveCity()}
                disabled={authLoading}
                className="bg-[#ff3f6c] hover:bg-[#e0355f] text-white px-3 rounded-lg disabled:opacity-50 active:scale-95 transition-all"
                aria-label="Save city"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={cancelEditor}
                disabled={authLoading}
                className="bg-white border border-gray-200 text-slate-500 px-3 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
                aria-label="Cancel city edit"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            {saveError && (
              <p className="text-[10px] font-bold text-red-500">{saveError}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
