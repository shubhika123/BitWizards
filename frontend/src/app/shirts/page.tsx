"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Heart, 
  ShoppingBag, 
  MapPin, 
  TrendingDown, 
  Truck, 
  ChevronRight, 
  ArrowUpDown, 
  Users, 
  Tag, 
  Ruler, 
  SlidersHorizontal 
} from "lucide-react";

const MyntraLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="10 5 80 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 68 C14 68 12 55 18 35 C24 15 31 10 35 10 C39 10 41 16 38 30 C34 50 30 68 22 68 Z" fill="#E71B5A" opacity="0.95" />
    <path d="M48 68 C40 68 30 50 35 10 C39 10 42 20 44 35 C46 50 56 68 48 68 Z" fill="#F15A24" opacity="0.9" />
    <path d="M52 68 C44 68 42 55 48 35 C54 15 61 10 65 10 C69 10 71 16 68 30 C64 50 60 68 52 68 Z" fill="#F37021" opacity="0.9" />
    <path d="M78 68 C70 68 60 50 65 10 C69 10 72 20 74 35 C76 50 86 68 78 68 Z" fill="#E71B5A" opacity="0.95" />
  </svg>
);

export default function ShirtsCatalog() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans relative">
      {/* 1. Custom Shirts Header */}
      <header className="w-full sticky top-0 z-50 bg-white px-3 py-2 flex items-center justify-between border-b border-gray-100 select-none shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <MyntraLogo className="w-5.5 h-5.5" />
          <span className="font-extrabold text-xs text-gray-800 tracking-wider">SHIRTS</span>
        </div>
        <div className="flex items-center gap-3.5 text-gray-700 pr-1">
          <button className="p-1 hover:text-[#ff3f6c] transition-colors"><Search className="w-4.5 h-4.5" /></button>
          <button className="p-1 hover:text-[#ff3f6c] transition-colors"><Heart className="w-4.5 h-4.5" /></button>
          <Link href="/" className="p-1 hover:text-[#ff3f6c] transition-colors relative">
            <ShoppingBag className="w-4.5 h-4.5" />
            <span className="absolute top-0.5 right-0.5 bg-[#ff3f6c] text-white text-[7.5px] font-bold w-2.8 h-2.8 rounded-full flex items-center justify-center scale-95">0</span>
          </Link>
        </div>
      </header>

      {/* Main content scroll area */}
      <main className="flex-1 flex flex-col pb-32">
        {/* 2. Location Indicator Row */}
        <div className="bg-[#fff5f2] px-3.5 py-2 flex items-center justify-between text-[10px] text-gray-700 font-bold border-b border-orange-100 select-none shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#ff3f6c] shrink-0" />
            <span className="truncate">Deliver to INDIRA GANDHI DELHI TECHNICAL UNIVERSIT...</span>
          </div>
          <span className="text-gray-400 font-black shrink-0">∨</span>
        </div>

        {/* 3. Filter Pills Row */}
        <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none px-3.5 py-3 bg-white border-b border-gray-50 select-none text-[10.5px] font-extrabold text-gray-750 shrink-0">
          <div className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1.5 shrink-0 bg-white cursor-pointer hover:bg-gray-50 shadow-3xs transition-colors">
            <span className="text-[#ff3f6c] italic font-black text-[9.5px] tracking-tight">m-now</span> Delivery
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 shrink-0 bg-white cursor-pointer hover:bg-gray-50 shadow-3xs transition-colors">
            <TrendingDown className="w-3.5 h-3.5 text-gray-500" /> Deal of the Day
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1.5 shrink-0 bg-white cursor-pointer hover:bg-gray-50 shadow-3xs transition-colors">
            <Truck className="w-3.5 h-3.5 text-gray-500" /> Express Delivery
          </div>
        </div>

        {/* 4. Shirts subcategories row (Circular photos) */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-3.5 py-4 bg-white border-b border-gray-100 select-none shrink-0">
          {[
            { label: "Linen", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=120&q=80" },
            { label: "Formal", img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=120&q=80" },
            { label: "Cotton", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=120&q=80" },
            { label: "Cuban Collar", img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=120&q=80" },
            { label: "Oversized", img: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center shrink-0 cursor-pointer snap-start">
              <div className="w-13.5 h-13.5 rounded-full overflow-hidden bg-gray-50 border border-gray-150 shadow-3xs hover:scale-95 transition-transform duration-200">
                <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-black text-gray-500 mt-1.5">{item.label}</span>
            </div>
          ))}
        </div>

        {/* 5. Seapuri Ad Banner */}
        <div className="mx-3.5 my-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 overflow-hidden shadow-xs flex items-center justify-between p-3 select-none relative cursor-pointer hover:shadow-sm transition-all shrink-0">
          <div className="w-1/2 p-1 text-left">
            <h3 className="text-sm font-black text-blue-900 leading-tight">Seapuri</h3>
            <p className="text-[9.5px] text-blue-750 font-bold mt-1 leading-tight">Clean Beauty, Inspired By The Sea</p>
            <span className="text-[10px] text-indigo-650 font-extrabold uppercase mt-2.5 block tracking-wide">Flat 20% Off</span>
          </div>
          <div className="w-1/2 h-20 overflow-hidden relative rounded-xl bg-white border border-blue-100 flex items-center justify-center p-0.5">
            <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80" alt="" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black text-white p-0.5 rounded-full shadow-md scale-75">
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
        <div className="flex justify-center items-center gap-1 mt-1 mb-4 select-none shrink-0">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-gray-650" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* 6. Product Grid (2 columns) */}
        <div className="grid grid-cols-2 gap-3 px-3.5 mb-10 select-none">
          {/* Card 1 */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-150 shadow-xs flex flex-col justify-between relative cursor-pointer group hover:shadow-md transition-shadow">
            <span className="absolute top-2 left-2 z-10 bg-indigo-650 text-white text-[7px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase scale-90 shadow-3xs">
              House of Brands
            </span>
            <div className="h-56 bg-gray-50 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80" alt="Casual Shirt" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
              <div className="absolute bottom-2 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-700 flex items-center gap-0.5 shadow-3xs">
                4.2 <span className="text-amber-500 font-extrabold text-[7.5px]">★</span> | 1.8k
              </div>
            </div>
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-[#282c3f] text-xs">HERE&NOW</h4>
                  <Heart className="w-3.5 h-3.5 text-gray-400 hover:text-[#ff3f6c] transition-colors" />
                </div>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">Slim Fit Tartan Plaid Casual Shirt</p>
              </div>
              <div className="mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-gray-800">₹611</span>
                  <span className="text-[9px] text-gray-400 line-through">₹1,499</span>
                  <span className="text-[9px] text-pink-500 font-bold">(59% OFF)</span>
                </div>
                <span className="text-[8px] text-emerald-600 font-black tracking-tight block mt-0.5">Best Price ₹611 with coupon</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-150 shadow-xs flex flex-col justify-between relative cursor-pointer group hover:shadow-md transition-shadow">
            <div className="h-56 bg-gray-50 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=300&q=80" alt="Formal Shirt" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
              <div className="absolute bottom-2 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-700 flex items-center gap-0.5 shadow-3xs">
                4.3 <span className="text-amber-500 font-extrabold text-[7.5px]">★</span> | 32.1k
              </div>
            </div>
            <div className="p-2.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[7.5px] bg-yellow-400 text-black px-1.5 py-0.2 rounded font-black tracking-wider uppercase scale-95">fwd</span>
                    <h4 className="font-extrabold text-[#282c3f] text-xs">BS BLUE SQUAD</h4>
                  </div>
                  <Heart className="w-3.5 h-3.5 text-gray-400 hover:text-[#ff3f6c] transition-colors" />
                </div>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">Men Red Solid Regular Fit Shirt</p>
              </div>
              <div className="mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-gray-800">₹499</span>
                  <span className="text-[9px] text-gray-400 line-through">₹1,299</span>
                  <span className="text-[9px] text-pink-500 font-bold">(61% OFF)</span>
                </div>
                <span className="text-[8px] text-emerald-600 font-black tracking-tight block mt-0.5">Best Price ₹499 with coupon</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 7. Bottom Filter Floating Action Bar */}
      <div className="fixed bottom-18 left-1/2 -translate-x-1/2 w-[calc(100%-1.75rem)] max-w-[370px] bg-white border border-gray-150 rounded-full h-11 shadow-lg flex items-center justify-around z-40 select-none text-[11px] font-bold text-gray-650 px-2 animate-bounce-subtle">
        {/* Sort */}
        <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#ff3f6c] transition-colors">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" /> Sort
        </div>
        <div className="w-[1px] h-5 bg-gray-200"></div>

        {/* Men */}
        <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#ff3f6c] transition-colors relative">
          <Users className="w-3.5 h-3.5 text-gray-500" /> Men
          <span className="absolute top-2.5 right-6 w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-pulse"></span>
        </div>
        <div className="w-[1px] h-5 bg-gray-200"></div>

        {/* Brand */}
        <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#ff3f6c] transition-colors">
          <Tag className="w-3.5 h-3.5 text-gray-500" /> Brand
        </div>
        <div className="w-[1px] h-5 bg-gray-200"></div>

        {/* Size */}
        <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#ff3f6c] transition-colors">
          <Ruler className="w-3.5 h-3.5 text-gray-500" /> Size
        </div>
        <div className="w-[1px] h-5 bg-gray-200"></div>

        {/* Filters */}
        <div className="flex-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#ff3f6c] transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" /> Filters
        </div>
      </div>
    </div>
  );
}
