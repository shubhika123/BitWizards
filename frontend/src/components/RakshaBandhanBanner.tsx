// components/RakshaBandhanBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Gift, Gem, ShoppingBag, Sparkles, Truck, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface CategoryBoost {
  category_id: number;
  category_name: string;
  boost: number;
}

const FALLBACK_CATEGORIES: CategoryBoost[] = [
  { category_id: 1, category_name: "Men Ethnic Wear", boost: 0.3 },
  { category_id: 2, category_name: "Women Ethnic Wear", boost: 0.4 },
  { category_id: 3, category_name: "Rakhi", boost: 0.5 },
  { category_id: 4, category_name: "Jewellery", boost: 0.25 },
];

const DIWALI_CATEGORIES: CategoryBoost[] = [
  { category_id: 1, category_name: "Men Ethnic Wear", boost: 0.45 },
  { category_id: 2, category_name: "Women Ethnic Wear", boost: 0.5 },
  { category_id: 4, category_name: "Jewellery", boost: 0.35 },
  { category_id: 5, category_name: "Decor", boost: 0.4 },
];

// fallback images per category — extend as new categories come from backend
const CATEGORY_IMAGES: Record<string, string> = {
  "Men Ethnic Wear": "https://apisap.fabindia.com/medias/20235705-01.jpg?context=bWFzdGVyfGltYWdlc3wxMTg1NTF8aW1hZ2UvanBlZ3xhR05tTDJobFpTOHhNRFV4TWpRMU1EQXhOelk1TWpZdk1qQXlNelUzTURWZk1ERXVhbkJufDMxZjNkZTlkMWMyYjNhNTc2NmIyZmY2ZjhmZWZiMDRiYzExYmY1ZDViNGI1OTFmOThkZDE5Njg5MGNkMTg1ZDg",
  "Women Ethnic Wear": "https://images.pexels.com/photos/20516292/pexels-photo-20516292.jpeg",
  "Rakhi": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSvn03YsqLkgWtoMWhak0kBwqLtlVIfS4jqTKNotFF7-1d3eaVe684s1cl0AIKaTnDY4mWowIY3CRfniSF95QHora3ci7Fd2OO1yxgmK-o",
  "Jewellery": "https://images.pexels.com/photos/7700270/pexels-photo-7700270.jpeg",
  "Decor": "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=format&fit=crop&w=300&q=80",
};

export default function RakshaBandhanBanner() {
  const [categories, setCategories] = useState<CategoryBoost[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [festivalName, setFestivalName] = useState<string>("");

  const loadActiveFestival = () => {
    const dateStr = localStorage.getItem("simulated_date") || "";
    const url = dateStr ? `http://127.0.0.1:8000/fetch-feed?simulated_date=${encodeURIComponent(dateStr)}` : "http://127.0.0.1:8000/fetch-feed";

    fetch(url)
      .then((res) => res.json())
      .then((data: any) => {
        let currentFest = "";
        if (data?.national_festival) {
          currentFest = data.national_festival;
        } else if (data?.active_festivals && data.active_festivals.length > 0) {
          // Find if either diwali or raksha bandhan is active
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
          setFestivalName(currentFest);
          if (currentFest === "Diwali") {
            setCategories(DIWALI_CATEGORIES);
          } else {
            setCategories(FALLBACK_CATEGORIES);
          }
        } else {
          setFestivalName("");
        }
      })
      .catch(() => {
        setFestivalName("");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActiveFestival();
    window.addEventListener("storage", loadActiveFestival);
    return () => {
      window.removeEventListener("storage", loadActiveFestival);
    };
  }, []);

  if (loading) return null;
  if (festivalName !== "Diwali" && festivalName !== "Raksha Bandhan") return null;

  const isDiwali = festivalName === "Diwali";

  return (
    <div className={`mx-3.5 mt-3 mb-4 rounded-[28px] overflow-hidden relative select-none shadow-sm p-4.5 flex flex-col gap-4 ${
      isDiwali 
        ? "bg-[#fffbeb]/90 border border-amber-300/80 shadow-amber-100/50" 
        : "bg-[#fff0f2]/75 border border-rose-100/60 shadow-rose-100/30"
    }`}>

      {/* Decorative Hanging SVG element on Left */}
      <div className="absolute left-[-6px] top-3 select-none pointer-events-none z-10 opacity-90 scale-90">
        {isDiwali ? (
          <svg className="w-18 h-18 text-amber-500 drop-shadow-xs" viewBox="0 0 100 100">
            {/* Flame */}
            <path d="M 50 15 Q 62 42 50 55 Q 38 42 50 15" fill="#ea580c" />
            <path d="M 50 22 Q 58 42 50 50 Q 42 42 50 22" fill="#f59e0b" />
            {/* Base */}
            <path d="M 15 55 C 15 85 85 85 85 55 Z" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
            <circle cx="50" cy="62" r="5" fill="#f59e0b" />
            <circle cx="30" cy="58" r="2.5" fill="#f59e0b" />
            <circle cx="70" cy="58" r="2.5" fill="#f59e0b" />
          </svg>
        ) : (
          <svg className="w-20 h-20 text-amber-500 drop-shadow-xs" viewBox="0 0 100 100">
            {/* Thread */}
            <path d="M 0 50 Q 25 42 50 50 Q 75 58 100 50" stroke="#ff3f6c" strokeWidth="2.5" fill="none" />
            {/* Hanging tassels */}
            <path d="M 35 48 C 35 60 40 65 40 75" stroke="#d97706" strokeWidth="1" fill="none" />
            <circle cx="40" cy="75" r="1.5" fill="#ef4444" />
            {/* Rakhi Body */}
            <circle cx="50" cy="50" r="20" fill="#f59e0b" stroke="#be123c" strokeWidth="2" />
            <circle cx="50" cy="50" r="14" fill="#be123c" />
            <circle cx="50" cy="50" r="8" fill="#ffd700" />
            <circle cx="50" cy="50" r="4" fill="#be123c" />
            {/* Beads */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x = 50 + 17 * Math.cos(angle);
              const y = 50 + 17 * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="2" fill="#ffd700" stroke="#d97706" strokeWidth="0.5" />;
            })}
          </svg>
        )}
      </div>

      {/* Header Block */}
      <div className="flex flex-col items-center pt-2 pb-2 relative text-center">
        {/* Soft flowers on top-right absolute overlay */}
        <div className="absolute right-[-14px] top-[-14px] opacity-35 pointer-events-none select-none z-5">
          <img
            src={isDiwali 
              ? "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80"
              : "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=150&q=80"
            }
            alt="Decor Flowers"
            className="w-24 h-24 object-cover rounded-full mix-blend-multiply"
          />
        </div>

        <div className="flex items-center gap-2.5 justify-center mt-1 z-10">
          <span className="text-amber-500 font-extrabold text-base">✦</span>
          <h2 className={`font-serif font-black text-xl tracking-widest uppercase ${isDiwali ? "text-amber-950" : "text-[#5c0f1e]"}`}>
            {festivalName}
          </h2>
          <span className="text-amber-500 font-extrabold text-base">✦</span>
        </div>

        <div className="flex items-center gap-2 mt-2 w-full justify-center text-amber-500/70 z-10">
          <span className="w-8 h-[1px] bg-amber-400"></span>
          <span className={`text-[10px] font-bold tracking-wider capitalize font-serif ${isDiwali ? "text-amber-800" : "text-rose-700/80"}`}>
            {isDiwali 
              ? "Grand Festival of Lights & Splendor" 
              : "Celebrate The Bond, Festively Styled"}
          </span>
          <span className="w-8 h-[1px] bg-amber-400"></span>
        </div>
      </div>

      {/* Myntra Official Grid Layout */}
      <div className="grid grid-cols-2 gap-4 z-10 relative">
        {categories.map((cat, idx) => (
          <Link
            key={cat.category_id}
            href={`/Category/${encodeURIComponent(cat.category_name)}`}
            className={`bg-white rounded-lg border border-amber-200/50 overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow duration-200 ${idx === categories.length - 1 && categories.length % 2 !== 0
              ? "col-span-2 max-w-[48%] mx-auto w-full"
              : ""
              }`}
          >
            {/* Top Section: High-Fidelity square image */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-50 relative">
              <img
                src={
                  CATEGORY_IMAGES[cat.category_name] ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80"
                }
                alt={cat.category_name}
                className="w-full h-full object-cover filter brightness-[0.98]"
              />
            </div>

            {/* Bottom Section: Myntra-inspired clean info text */}
            <div className="bg-gradient-to-b from-white to-[#fff8f6] p-3 text-center flex flex-col items-center justify-center border-t border-rose-50/60">
              <span className="text-[10px] font-bold text-gray-800 tracking-wide uppercase font-sans">
                {cat.category_name}
              </span>
              <span className="text-[13px] font-black text-rose-950 mt-1 uppercase font-sans tracking-wide">
                UP TO {Math.round(cat.boost * 100)}% OFF
              </span>
              <span className="text-[9.5px] font-extrabold text-[#ff3f6c] hover:underline mt-2 font-sans tracking-wider uppercase">
                Shop Now
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Value Proposition Footer Bar */}
      <div className="mt-1.5 bg-[#fffbeb]/95 border border-rose-100/50 rounded-xl p-3 flex items-center justify-between text-[7px] font-bold text-gray-700 shadow-3xs select-none">

        {/* Same Day Delivery */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <Truck className="w-4.5 h-4.5 text-rose-700 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[8.5px] text-gray-800 leading-tight">Same Day Delivery</span>
            <span className="text-[7.5px] text-gray-400 font-medium leading-none mt-0.5">Quick & Reliable</span>
          </div>
        </div>

        <div className="w-[1px] h-6 bg-rose-200/50 shrink-0"></div>

        {/* Secure Payments */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <ShieldCheck className="w-4.5 h-4.5 text-rose-700 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[8.5px] text-gray-800 leading-tight">Secure Payments</span>
            <span className="text-[7.5px] text-gray-400 font-medium leading-none mt-0.5">100% Safe Checkout</span>
          </div>
        </div>

        <div className="w-[1px] h-6 bg-rose-200/50 shrink-0"></div>

        {/* Premium Quality */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <Sparkles className="w-4.5 h-4.5 text-rose-700 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[8.5px] text-gray-800 leading-tight">Premium Quality</span>
            <span className="text-[7.5px] text-gray-400 font-medium leading-none mt-0.5">Handpicked for You</span>
          </div>
        </div>

        <div className="w-[1px] h-6 bg-rose-200/50 shrink-0"></div>

        {/* 24/7 Support */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <svg className="w-4.5 h-4.5 text-rose-700 shrink-0 fill-none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[8.5px] text-gray-800 leading-tight">24/7 Support</span>
            <span className="text-[7.5px] text-gray-400 font-medium leading-none mt-0.5">We're Here for You</span>
          </div>
        </div>

      </div>

    </div>
  );
}