"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  Heart, 
  ShoppingBag, 
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Percent,
  Bell
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isGenieRoute = pathname.startsWith("/genie");
  
  const [searchMode, setSearchMode] = useState<"normal" | "genie">(
    isGenieRoute ? "genie" : "normal"
  );
  const [searchQuery, setSearchQuery] = useState("");
  // Sync mode with route changes
  useEffect(() => {
    setSearchMode(isGenieRoute ? "genie" : "normal");
  }, [pathname, isGenieRoute]);

  const handleModeChange = (e: React.MouseEvent, mode: "normal" | "genie") => {
    e.preventDefault();
    e.stopPropagation();
    setSearchMode(mode);
    if (mode === "genie") {
      router.push("/genie");
    } else {
      router.push("/");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === "genie") {
      router.push(`/genie?q=${encodeURIComponent(searchQuery)}`);
    } else {
      alert(`Normal search for: "${searchQuery}"`);
    }
  };

  // Dynamic Theme Classes
  const headerBg = "bg-white border-b border-[#eaeaec]";
  const textColor = "text-[#282c3f]";
  const hoverBorderColor = "hover:border-[#ff3f6c]";
  const inputBg = "bg-[#f5f5f6] focus-within:bg-white focus-within:border-[#eaeaec]";
  const inputTextColor = "text-[#282c3f] placeholder-[#9496a2]";
  const toggleBorder = "border-[#eaeaec]";
  const toggleBg = "bg-white";

  return (
    <>
      {/* HEADER CONTAINER */}
      <header className={`w-full sticky top-0 z-50 px-4 flex flex-col transition-colors duration-300 ${headerBg} py-3 gap-2.5 shrink-0`}>
        
        {/* ROW 1: Logo & Compact Actions */}
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Myntra Logo" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://images.indianexpress.com/2021/01/myntra-logo.jpg";
                }}
              />
            </Link>

            {/* Festive Live Tag */}
            <Link 
              href="/Category/Rakhi"
              className="flex items-center gap-1.5 px-3 py-0.5 bg-gradient-to-r from-[#fffbf0] via-[#fff1f2] to-[#fffbf0] border-2 border-double border-amber-300 rounded-full text-[#9f1239] text-[8px] font-black tracking-widest uppercase shadow-3xs select-none shrink-0 animate-pulse"
            >
              <span>🌸 RAKHI FESTIVAL LIVE 🌸</span>
            </Link>
          </div>

          {/* Compact Actions (Bell, Heart, Profile) */}
          <div className="flex items-center gap-3 text-[#282c3f] pr-1">
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
            <Link href="/profile" className="p-1 hover:text-[#ff3f6c] transition-colors cursor-pointer">
              <User className="w-4.5 h-4.5 stroke-[1.5]" />
            </Link>
          </div>
        </div>

        {/* ROW 2: Search Bar with Genie Toggle */}
        <div className="w-full">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            {/* Search Input Container */}
            <div className={`relative flex-1 flex items-center border border-transparent rounded-md transition-all ${inputBg}`}>
              <div className="pl-3 text-[#535766]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  searchMode === "genie"
                    ? "Ask Genie: 'Sangeet outfit under 2500'..."
                    : "Search for Rakhi, Sweets, Gifts & more..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-[13px] pl-2 pr-4 py-2 rounded-md focus:outline-none ${inputTextColor}`}
              />

              {/* Segmented Toggle inside Search Bar */}
              <div className={`flex items-center border rounded-full p-0.5 mr-1.5 shadow-sm shrink-0 z-10 ${toggleBorder} ${toggleBg}`}>
                <button
                  type="button"
                  onClick={(e) => handleModeChange(e, "normal")}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-full transition-all text-center cursor-pointer ${
                    searchMode === "normal"
                      ? "bg-[#282c3f] text-white"
                      : "text-[#535766] hover:text-[#282c3f]"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={(e) => handleModeChange(e, "genie")}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-full flex items-center gap-0.5 transition-all text-center cursor-pointer ${
                    searchMode === "genie"
                      ? "bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] text-white shadow-sm"
                      : "text-[#ff3f6c] hover:bg-pink-50"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  Genie
                </button>
              </div>
            </div>
          </form>
        </div>
      </header>

    </>
  );
}
