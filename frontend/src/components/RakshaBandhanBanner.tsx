// components/RakshaBandhanBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Gift, Gem, ShoppingBag, Sparkles } from "lucide-react";

interface CategoryBoost {
  category_id: number;
  category_name: string;
  boost: number;
}

// fallback images per category — extend as new categories come from backend
const CATEGORY_IMAGES: Record<string, string> = {
  "Men Ethnic Wear": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
  "Women Ethnic Wear": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80",
  "Rakhi": "https://images.unsplash.com/photo-1592921870789-04563d55041c?auto=format&fit=crop&w=300&q=80",
  "Jewellery": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80",
  "Gifts": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Men Ethnic Wear": <ShoppingBag className="w-3.5 h-3.5" />,
  "Women Ethnic Wear": <ShoppingBag className="w-3.5 h-3.5" />,
  "Rakhi": <Sparkles className="w-3.5 h-3.5" />,
  "Jewellery": <Gem className="w-3.5 h-3.5" />,
  "Gifts": <Gift className="w-3.5 h-3.5" />,
};

export default function RakshaBandhanBanner() {
  const [categories, setCategories] = useState<CategoryBoost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/fetch-feed")
      .then((res) => res.json())
      .then((data: CategoryBoost[]) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <div className="mx-3.5 mt-4 mb-4 rounded-2xl overflow-hidden bg-gradient-to-b from-[#5c0f1e] via-[#7a1425] to-[#5c0f1e] relative select-none shadow-md">
      {/* Decorative dangling rakhi threads */}
      <div className="absolute top-0 left-6 flex gap-8 opacity-70 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-[2px] h-4 bg-amber-300/60" />
        ))}
      </div>

      {/* Header ribbon */}
      <div className="flex flex-col items-center pt-6 pb-4 relative">
        <div className="flex items-center gap-2 px-5 py-1.5 bg-[#ffd166] rounded-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#7a1425]" />
          <span className="text-[#7a1425] font-black text-xs tracking-widest uppercase">
            Raksha Bandhan
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#7a1425]" />
        </div>
        <span className="text-amber-200 text-[10px] font-bold mt-1.5 tracking-wide">
          Celebrate the bond, festively styled
        </span>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-2.5 px-3.5 pb-4">
        {categories.map((cat) => (
          <div
            key={cat.category_id}
            className="bg-[#fff6ee] rounded-xl overflow-hidden border border-amber-200/40 shadow-sm cursor-pointer hover:scale-[0.98] transition-transform"
          >
            <div className="h-24 w-full overflow-hidden bg-slate-100">
              <img
                src={
                  CATEGORY_IMAGES[cat.category_name] ||
                  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80"
                }
                alt={cat.category_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <div className="flex items-center gap-1 text-[#7a1425]">
                {CATEGORY_ICONS[cat.category_name] || <Gift className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-black truncate">{cat.category_name}</span>
              </div>
              <span className="text-[9px] font-extrabold text-emerald-700 mt-0.5 block">
                UP TO {Math.round(cat.boost * 100)}% OFF
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}