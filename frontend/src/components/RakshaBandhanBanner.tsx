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

// fallback images per category — extend as new categories come from backend
const CATEGORY_IMAGES: Record<string, string> = {
  "Men Ethnic Wear": "https://apisap.fabindia.com/medias/20235705-01.jpg?context=bWFzdGVyfGltYWdlc3wxMTg1NTF8aW1hZ2UvanBlZ3xhR05tTDJobFpTOHhNRFV4TWpRMU1EQXhOelk1TWpZdk1qQXlNelUzTURWZk1ERXVhbkJufDMxZjNkZTlkMWMyYjNhNTc2NmIyZmY2ZjhmZWZiMDRiYzExYmY1ZDViNGI1OTFmOThkZDE5Njg5MGNkMTg1ZDg",
  "Women Ethnic Wear": "https://images.pexels.com/photos/20516292/pexels-photo-20516292.jpeg",
  "Rakhi": "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSvn03YsqLkgWtoMWhak0kBwqLtlVIfS4jqTKNotFF7-1d3eaVe684s1cl0AIKaTnDY4mWowIY3CRfniSF95QHora3ci7Fd2OO1yxgmK-o",
  "Jewellery": "https://images.pexels.com/photos/7700270/pexels-photo-7700270.jpeg",

};

export default function RakshaBandhanBanner() {
  const [categories, setCategories] = useState<CategoryBoost[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/fetch-feed")
      .then((res) => res.json())
      .then((data: CategoryBoost[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => setCategories(FALLBACK_CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="mx-3.5 mt-3 mb-4 rounded-[28px] overflow-hidden bg-[#fff0f2]/75 border border-rose-100/60 relative select-none shadow-sm p-4.5 flex flex-col gap-4">

      {/* Decorative Hanging SVG Rakhi on Left */}
      <div className="absolute left-[-6px] top-3 select-none pointer-events-none z-10 opacity-90 scale-90">
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
      </div>

      {/* Header Block */}
      <div className="flex flex-col items-center pt-2 pb-2 relative text-center">
        {/* Soft pink flowers on top-right absolute overlay */}
        <div className="absolute right-[-14px] top-[-14px] opacity-35 pointer-events-none select-none z-5">
          <img
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=150&q=80"
            alt="Pink Flowers Decor"
            className="w-24 h-24 object-cover rounded-full mix-blend-multiply"
          />
        </div>

        <div className="flex items-center gap-2.5 justify-center mt-1 z-10">
          <span className="text-amber-500 font-extrabold text-base">✦</span>
          <h2 className="text-[#5c0f1e] font-serif font-black text-xl tracking-widest uppercase">
            RAKSHA BANDHAN
          </h2>
          <span className="text-amber-500 font-extrabold text-base">✦</span>
        </div>

        <div className="flex items-center gap-2 mt-2 w-full justify-center text-amber-500/70 z-10">
          <span className="w-8 h-[1px] bg-amber-400"></span>
          <span className="text-[10px] font-bold tracking-wider capitalize text-rose-700/80 font-serif">Celebrate The Bond, Festively Styled</span>
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