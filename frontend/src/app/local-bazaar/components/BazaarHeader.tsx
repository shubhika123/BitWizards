"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Select, { StylesConfig, SingleValue } from "react-select";
import { ArrowLeft, Search, Heart, ShoppingBag, MapPin, Compass } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";
import { API_BASE_URL } from "@/lib/apiConfig";

type CityOption = {
  value: string;
  label: string;
  state: string;
};

const selectStyles: StylesConfig<CityOption, false> = {
  container: (base) => ({ ...base, minWidth: 150, maxWidth: 220, flex: "0 1 auto" }),
  control: (base, state) => ({
    ...base,
    minHeight: 24,
    height: 24,
    borderColor: state.isFocused ? "#ff3f6c" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 1px #ff3f6c" : "none",
    backgroundColor: "#fff",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    cursor: "pointer",
    "&:hover": { borderColor: "#ff3f6c" },
  }),
  valueContainer: (base) => ({ ...base, padding: "0 6px", height: 24 }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    caretColor: "transparent",
    color: "transparent",
  }),
  indicatorsContainer: (base) => ({ ...base, height: 24 }),
  dropdownIndicator: (base) => ({ ...base, padding: 2, color: "#9ca3af" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (base) => ({ ...base, zIndex: 9999, fontSize: 11, fontWeight: 700 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#ffe4ec" : state.isFocused ? "#fff1f5" : "#fff",
    color: state.isSelected || state.isFocused ? "#ff3f6c" : "#374151",
    cursor: "pointer",
    padding: "8px 12px",
  }),
  singleValue: (base) => ({ ...base, color: "#4b5563" }),
  placeholder: (base) => ({ ...base, color: "#9ca3af" }),
  noOptionsMessage: (base) => ({ ...base, fontSize: 11, color: "#9ca3af" }),
};

export default function BazaarHeader() {
  const { user } = useAuthStore();
  const {
    step,
    activeCity,
    activeState,
    themeColors,
    setActiveCity,
    setSelectedRadius,
  } = useBazaarStore();

  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const cityLocked = Boolean(user?.city);

  useEffect(() => {
    let cancelled = false;
    const loadCities = async () => {
      setCitiesLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/bazaar/cities`);
        if (!res.ok) throw new Error("Failed to load cities");
        const data: { city: string; state: string }[] = await res.json();
        if (cancelled) return;
        setCityOptions(
          data.map((c) => ({
            value: c.city,
            label: c.state ? `${c.city}, ${c.state}` : c.city,
            state: c.state || "",
          }))
        );
      } catch (err) {
        console.warn("Failed to fetch bazaar cities", err);
        if (!cancelled) setCityOptions([]);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    };
    loadCities();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedOption = useMemo(() => {
    if (!activeCity) return null;
    return (
      cityOptions.find((o) => o.value.toLowerCase() === activeCity.toLowerCase()) || {
        value: activeCity,
        label: activeState ? `${activeCity}, ${activeState}` : activeCity,
        state: activeState || "",
      }
    );
  }, [activeCity, activeState, cityOptions]);

  // Steps 2-6 render their own headers; only the discover feed uses this one.
  if (!themeColors || step !== 1) return null;

  const handleCityChange = (option: SingleValue<CityOption>) => {
    if (!option || cityLocked) return;
    setActiveCity(option.value);
    localStorage.setItem("selectedCity", option.value);
  };

  return (
    <>
      <header className="w-full px-3.5 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <span className="font-extrabold text-sm tracking-wide text-[#282c3f] flex items-center gap-1.5">
            Apna Bazaar <span className="text-sm select-none">🌺</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-600 scale-95">
          <Search className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
          <Heart className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
          <ShoppingBag className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
        </div>
      </header>

      {/* Location selector strip */}
      <div className="px-3.5 py-1.5 flex items-center justify-between text-[10px] font-bold border-b border-gray-100 bg-[#FAFAFA] text-gray-600 gap-2 relative z-40">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-visible">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-purple-600" />
          <span className="shrink-0">Delivering to</span>
          {cityLocked ? (
            <span className="truncate">
              {activeCity}{activeState ? `, ${activeState}` : ""}
            </span>
          ) : (
            <Select<CityOption, false>
              classNamePrefix="bazaar-city"
              options={cityOptions}
              value={selectedOption}
              onChange={handleCityChange}
              isLoading={citiesLoading}
              isSearchable={false}
              isDisabled={cityLocked}
              placeholder="Select city"
              styles={selectStyles}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              menuShouldScrollIntoView={false}
              openMenuOnFocus
              aria-label="Select delivery city"
              noOptionsMessage={() =>
                citiesLoading ? "Loading cities..." : "No cities available"
              }
            />
          )}
        </div>

        <button
          onClick={() => setSelectedRadius(5)}
          className="shrink-0 border border-gray-200 bg-white text-slate-600 px-2 py-0.5 rounded-md text-[8.5px] font-black flex items-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-3xs"
        >
          <Compass className="w-3 h-3 text-gray-500" />
          <span>Near Me</span>
        </button>
      </div>
    </>
  );
}
