"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { API_BASE_URL } from "@/lib/apiConfig";

interface OverGuessedItem {
  name: string;
  image_url: string;
  actual_price: number;
  guess_amount: number;
  error_pct: number;
}

export default function YouMayLikeThis() {
  const [items, setItems] = useState<OverGuessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sahidaam/recommendations/over-guessed`)
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setItems(data.items);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-b from-[#ffede1] via-[#fff5eb] to-[#fffcf9] py-8 border-y border-orange-100/50 mt-4 overflow-hidden relative">
      {/* Abstract background blobs mimicking the screenshot */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-gradient-to-b from-[#e0e7ff]/30 to-transparent blur-3xl rounded-[100%] pointer-events-none"></div>

      <div className="text-center mb-6 relative z-10">
        <h2 className="text-xl tracking-wide flex items-center justify-center gap-2">
          <span className="font-black text-gray-900">YOU MAY LIKE</span> 
          <span className="font-light text-gray-600">THIS</span>
        </h2>
        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Premium Picks
        </p>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-none relative z-10">
        {items.map((item, idx) => (
          <Link href="/" key={idx} className="shrink-0 w-[140px] aspect-[3/4] snap-center group relative overflow-hidden rounded-[16px] shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out" style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}>
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3">
              <span className="text-white text-[10px] font-black leading-tight uppercase tracking-wide text-center">
                {item.name}
              </span>
            </div>
            {/* Sahi Daam Badge */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur border border-pink-100 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <span className="text-[7px] font-black text-pink-600 uppercase">Premium</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
