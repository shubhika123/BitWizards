"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  Heart, 
  Bell,
  X,
  Sparkles
} from "lucide-react";
import { useGenieUiStore } from "../store/genieUiStore";
import { GenieEntryButton } from "./genie/GenieEntryButton";
import { useAuthStore } from "../store/authStore";
import { categories } from "../lib/Categories";

import { API_BASE_URL as API_BASE_URL_CONFIG } from "../lib/apiConfig";

const MyntraLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="10 5 80 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 68 C14 68 12 55 18 35 C24 15 31 10 35 10 C39 10 41 16 38 30 C34 50 30 68 22 68 Z" fill="#E71B5A" opacity="0.95" />
    <path d="M48 68 C40 68 30 50 35 10 C39 10 42 20 44 35 C46 50 56 68 48 68 Z" fill="#F15A24" opacity="0.9" />
    <path d="M52 68 C44 68 42 55 48 35 C54 15 61 10 65 10 C69 10 71 16 68 30 C64 50 60 68 52 68 Z" fill="#F37021" opacity="0.9" />
    <path d="M78 68 C70 68 60 50 65 10 C69 10 72 20 74 35 C76 50 86 68 78 68 Z" fill="#E71B5A" opacity="0.95" />
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isGenieRoute = pathname.startsWith("/genie");
  const openGenie = useGenieUiStore((s) => s.openGenie);
  const setGenieButtonActive = useGenieUiStore((s) => s.setGenieButtonActive);

  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFestival, setActiveFestival] = useState("");

  const loadActiveFestivalHeader = () => {
    const dateStr = localStorage.getItem("simulated_date") || "";
    const API_BASE_URL = API_BASE_URL_CONFIG;
    const url = dateStr ? `${API_BASE_URL}/fetch-feed?simulated_date=${encodeURIComponent(dateStr)}` : `${API_BASE_URL}/fetch-feed`;

    fetch(url)
      .then((res) => res.json())
      .then((data: any) => {
        let currentFest = "";
        if (data?.national_festival) {
          currentFest = data.national_festival;
        } else if (data?.active_festivals && data.active_festivals.length > 0) {
          const matches = data.active_festivals.filter((name: string) => name === "Diwali" || name === "Raksha Bandhan");
          if (matches.length > 0) currentFest = matches[0];
        } else {
          // Date fallback
          if (dateStr >= "2026-11-08" && dateStr <= "2026-11-12") {
            currentFest = "Diwali";
          } else if (dateStr === "2026-08-28") {
            currentFest = "Raksha Bandhan";
          }
        }
        
        if (currentFest === "Diwali" || currentFest === "Raksha Bandhan") {
          setActiveFestival(currentFest);
        } else {
          setActiveFestival("");
        }
      })
      .catch(() => setActiveFestival(""));
  };

  useEffect(() => {
    loadActiveFestivalHeader();
    window.addEventListener("storage", loadActiveFestivalHeader);
    return () => {
      window.removeEventListener("storage", loadActiveFestivalHeader);
    };
  }, []);



  useEffect(() => {
    setGenieButtonActive(isGenieRoute);
  }, [isGenieRoute, setGenieButtonActive]);

  const handleGenieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openGenie(searchQuery);
    const params = new URLSearchParams({ enter: "1" });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    router.push(`/genie?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Normal search for: "${searchQuery}"`);
  };

  // Dynamic Theme Classes
  const headerBg = activeFestival === "Diwali" ? "bg-[#faf5ff] border-b border-purple-100" : "bg-white border-b border-[#eaeaec]";
  const textColor = "text-[#282c3f]";
  const hoverBorderColor = "hover:border-[#ff3f6c]";
  const inputBg = "bg-[#f5f5f6] focus-within:bg-white focus-within:border-[#eaeaec]";
  const inputTextColor = "text-[#282c3f] placeholder-[#9496a2]";
  return (
    <>
      {/* HEADER CONTAINER */}
      <header className={`w-full sticky top-0 z-50 px-4 flex flex-col transition-colors duration-300 ${headerBg} py-3 gap-2.5 shrink-0`}>
        
        {/* ROW 1: Logo & Compact Actions */}
        <div className="flex items-center justify-between w-full gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            {/* Logo - Myntra 'M' SVG */}
            <Link href="/" className="flex items-center shrink-0 p-0.5 hover:opacity-90 transition-opacity">
              <MyntraLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 drop-shadow-3xs" />
            </Link>

            {/* Rakhi Festive Badge */}
            {activeFestival === "Raksha Bandhan" && (
              <Link 
                href="/Category/Rakhi"
                className="hidden min-[350px]:flex items-center pl-2 pr-2.5 py-0.5 border border-rose-300 rounded-full text-[#ff3f6c] text-[8px] font-bold uppercase tracking-wider ml-1 shrink-0"
              >
                <span>RAKHI</span>
                <Sparkles className="w-2.5 h-2.5 text-[#ff3f6c] ml-1 shrink-0" />
              </Link>
            )}

            {/* Diwali Festive Badge */}
            {activeFestival === "Diwali" && (
              <Link 
                href="/Category/Jewellery"
                className="hidden min-[350px]:flex items-center pl-2 pr-2.5 py-0.5 border border-amber-400 rounded-full text-amber-700 text-[8px] font-bold uppercase tracking-wider ml-1 shrink-0"
              >
                <span>DIWALI</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-600 ml-1 shrink-0" />
              </Link>
            )}
          </div>

          {/* Compact Actions (MRP Master, Bell, Heart, Profile) */}
          <div className="flex items-center gap-2 sm:gap-3 text-[#282c3f] pr-1 shrink-0">


            {/* Bell (Notification) */}
            <div className="relative p-1 hover:text-[#ff3f6c] transition-colors cursor-pointer">
              <Bell className="w-4.5 h-4.5 stroke-[1.5]" />
              <span className="absolute top-0 right-0 bg-[#ff3f6c] text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center scale-90">
                1
              </span>
            </div>

            {/* Wishlist */}
            <button className="p-1 hover:text-[#ff3f6c] transition-colors">
              <Heart className="w-4.5 h-4.5 stroke-[1.5]" />
            </button>

            {/* Profile */}
            <Link href="/profile" className="p-1 hover:text-[#ff3f6c] transition-colors cursor-pointer flex items-center gap-1 shrink-0">
              <User className="w-4.5 h-4.5 stroke-[1.5]" />
              {user && (
                <span className="text-[10px] font-black max-w-[55px] truncate text-gray-700 hover:text-[#ff3f6c]">
                  {user.name}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ROW 2: Search Bar + Genie entry */}
        <div className="w-full flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center min-w-0">
            <div className={`relative w-full flex items-center border border-transparent rounded-md transition-all ${inputBg}`}>
              <div className="pl-3 text-[#535766]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={activeFestival === "Diwali" ? "Search for gifts, saree" : "Search for Rakhi, Gifts & more..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-[13px] pl-2 pr-3 py-2.5 rounded-md focus:outline-none ${inputTextColor}`}
              />
            </div>
          </form>
          <GenieEntryButton active={isGenieRoute} onClick={handleGenieClick} />
        </div>
      </header>

    </>
  );
}
