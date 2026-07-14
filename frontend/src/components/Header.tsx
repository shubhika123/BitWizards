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
  Percent
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isGenieRoute = pathname.startsWith("/genie");
  
  const [searchMode, setSearchMode] = useState<"normal" | "genie">(
    isGenieRoute ? "genie" : "normal"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync mode with route changes
  useEffect(() => {
    setSearchMode(isGenieRoute ? "genie" : "normal");
  }, [pathname, isGenieRoute]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

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
      <header className={`w-full sticky top-0 z-50 px-4 md:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between transition-colors duration-300 ${headerBg} md:h-20 py-3 md:py-0 gap-3 md:gap-0`}>
        
        {/* ROW 1: Logo, Hamburger & Compact Actions on Mobile */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button (Mobile Only) */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-1 text-[#282c3f] hover:bg-myntra-gray rounded-lg transition-colors cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Myntra Logo" 
                className="h-8 md:h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://images.indianexpress.com/2021/01/myntra-logo.jpg";
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation Links (Hidden on Mobile) */}
          <nav className={`hidden md:flex items-center h-20 text-[14px] font-bold tracking-wider transition-colors duration-300 ${textColor}`}>
            {[
              { name: "MEN", href: "/" },
              { name: "WOMEN", href: "/" },
              { name: "KIDS", href: "/" },
              { name: "HOME", href: "/" },
              { name: "BEAUTY", href: "/" },
              { name: "GENZ", href: "/" },
              { name: "STUDIO", href: "/", isNew: true },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 h-full flex items-center hover:border-b-4 ${hoverBorderColor} transition-all duration-100 group`}
              >
                <span className="group-hover:text-[#ff3f6c]">{link.name}</span>
                {link.isNew && (
                  <span className="absolute top-4 right-0 bg-[#ff3f6c] text-white text-[8px] px-1 py-0.2 rounded-sm font-extrabold uppercase scale-90">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Compact Actions (Mobile Only, shown on top row) */}
          <div className="flex md:hidden items-center gap-4 text-[#282c3f]">
            <button className="p-1 hover:text-[#ff3f6c] transition-colors">
              <User className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button className="p-1 hover:text-[#ff3f6c] transition-colors">
              <Heart className="w-5 h-5 stroke-[1.5]" />
            </button>
            <Link href="/cart" className="relative p-1 hover:text-[#ff3f6c] transition-colors">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-0 right-0 bg-[#ff3f6c] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* ROW 2 / Center: Search Bar with Genie Toggle */}
        <div className="flex-1 w-full md:max-w-xl md:mx-4 lg:mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            {/* Search Input Container */}
            <div className={`relative flex-1 flex items-center border border-transparent rounded-md transition-all ${inputBg}`}>
              <div className="pl-3 md:pl-4 text-[#535766]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder={
                  searchMode === "genie"
                    ? "Ask Genie: 'Sangeet outfit under 2500'..."
                    : "Search for products, brands and more"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-[13px] md:text-[14px] pl-2 md:pl-3 pr-4 py-2 md:py-2.5 rounded-md focus:outline-none ${inputTextColor}`}
              />

              {/* Segmented Toggle inside Search Bar */}
              <div className={`flex items-center border rounded-full p-0.5 mr-1.5 md:mr-2 shadow-sm shrink-0 z-10 ${toggleBorder} ${toggleBg}`}>
                <button
                  type="button"
                  onClick={(e) => handleModeChange(e, "normal")}
                  className={`px-2 md:px-3 py-0.5 md:py-1 text-[9px] md:text-[11px] font-bold rounded-full transition-all text-center cursor-pointer ${
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
                  className={`px-2 md:px-3 py-0.5 md:py-1 text-[9px] md:text-[11px] font-bold rounded-full flex items-center gap-0.5 md:gap-1 transition-all text-center cursor-pointer ${
                    searchMode === "genie"
                      ? "bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] text-white shadow-sm"
                      : "text-[#ff3f6c] hover:bg-pink-50"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5 md:w-3 h-3 animate-pulse" />
                  Genie
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right: User Actions (Desktop Only) */}
        <div className={`hidden md:flex items-center gap-6 lg:gap-8 shrink-0 transition-colors duration-300 ${textColor}`}>
          {/* Profile */}
          <button className="flex flex-col items-center gap-1 group hover:text-[#ff3f6c] transition-colors">
            <User className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Profile</span>
          </button>

          {/* Wishlist */}
          <button className="flex flex-col items-center gap-1 group hover:text-[#ff3f6c] transition-colors">
            <Heart className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-bold tracking-wide uppercase">Wishlist</span>
          </button>

          {/* Bag */}
          <Link href="/cart" className="flex flex-col items-center gap-1 group hover:text-[#ff3f6c] transition-colors">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1 -right-1 bg-[#ff3f6c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-90">
                0
              </span>
            </div>
            <span className="text-[10px] font-bold tracking-wide uppercase">Bag</span>
          </Link>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER (Slide-in Sidebar) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-full max-w-[280px] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {/* Drawer Header Banner */}
            <div className="bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] p-4 text-white relative">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 mt-2">
                <Percent className="w-5 h-5 text-white animate-pulse" />
                <span className="font-extrabold text-sm uppercase tracking-wider">FLAT ₹200 OFF</span>
              </div>
              <p className="text-[11px] text-white/90 mt-1 font-medium">On your first order • Code: MYNTRASAVE</p>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 divide-y divide-myntra-border">
              {/* Core Categories */}
              <div className="py-2">
                {[
                  { name: "Men", href: "/" },
                  { name: "Women", href: "/" },
                  { name: "Kids", href: "/" },
                  { name: "Home & Living", href: "/" },
                  { name: "Beauty", href: "/" },
                ].map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between px-5 py-3 text-sm font-bold text-[#282c3f] hover:bg-myntra-gray transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>

              {/* Special Features */}
              <div className="py-2">
                {[
                  { name: "Myntra Genie Stylist", href: "/genie", isSpecial: true },
                  { name: "Myntra Studio", href: "/", isNew: true },
                  { name: "Myntra Mall", href: "/", isNew: true },
                  { name: "Myntra Insider", href: "/" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between px-5 py-3 text-sm font-bold text-[#282c3f] hover:bg-myntra-gray transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {item.isSpecial && <Sparkles className="w-4 h-4 text-myntra-pink animate-pulse" />}
                      <span className={item.isSpecial ? "text-myntra-pink" : ""}>{item.name}</span>
                      {item.isNew && (
                        <span className="bg-[#ff3f6c] text-white text-[8px] px-1.5 py-0.2 rounded-sm font-extrabold uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>

              {/* Secondary Links */}
              <div className="py-2">
                {["Contact Us", "FAQs", "Legal"].map((item) => (
                  <Link
                    key={item}
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between px-5 py-3 text-xs font-semibold text-[#535766] hover:bg-myntra-gray transition-colors"
                  >
                    <span>{item}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-myntra-border bg-myntra-gray text-center">
              <p className="text-[10px] text-myntra-light font-bold uppercase tracking-wider">Enjoy the Best Experience</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
