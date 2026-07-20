"use client";
import RakshaBandhanBanner from "../components/RakshaBandhanBanner";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { Sparkles, ArrowRight, Percent, ChevronRight, ShoppingBag, ShieldCheck, Zap, MapPin, LayoutGrid, Truck, Heart, Gem, Gift } from "lucide-react";
import { categories } from "../lib/Categories";
import { useAuthStore } from "../store/authStore";

// State mapping lookup for target Indian cities celebrative of festivals
const cityToStateMap: Record<string, string> = {
  "amritsar": "Punjab",
  "ludhiana": "Punjab",
  "belgaum": "Karnataka",
  "coimbatore": "Tamil Nadu",
  "kolkata": "West Bengal",
  "madurai": "Tamil Nadu",
  "mumbai": "Maharashtra",
  "mysuru": "Karnataka",
  "patna": "Bihar",
  "salem": "Tamil Nadu",
  "vijayawada": "Andhra Pradesh",
  "vizag": "Andhra Pradesh"
};

const getCityState = (city: string) => {
  if (!city) return "Patna, Bihar";
  const normalized = city.trim().toLowerCase();
  const state = cityToStateMap[normalized];
  if (state) {
    return `${city}, ${state}`;
  }
  return `${city}, India`;
};

export default function Home() {  
  const { user } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % 3;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ left: next * carouselRef.current.clientWidth, behavior: 'smooth' });
        }
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#fff0f3] via-white to-[#fffbeb] min-h-screen flex flex-col font-sans relative">
      {/* Header */}
      <Header />
       

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-6">
        {/* 1. Location Indicator Row */}
        <div className="bg-gradient-to-r from-[#ffe4e6] to-[#fff1f2] px-3.5 py-2 flex items-center justify-between text-[10px] text-gray-700 font-bold border-b border-rose-100 select-none animate-fade-in">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#ff3f6c] shrink-0" />
            <span className="truncate">Delivering to {getCityState(user?.city || "Bengaluru")}</span>
          </div>
          <span className="text-gray-400 font-black shrink-0">∨</span>
        </div>

        {/* 2. Category Tab Bar */}
        <div className="flex items-center justify-between px-3.5 bg-white border-b border-[#ff3f6c]/20 relative h-10 select-none text-[11px] font-extrabold text-gray-500">
          <div className="flex items-center gap-3.5 h-full">
            {/* ALL Tab with matching curved layout wave border */}
            <div className="bg-white border-t-2 border-x border-[#ff3f6c] rounded-t-xl px-4.5 h-full flex items-center justify-center text-[#ff3f6c] font-black relative top-[1px] z-10 border-b-2 border-b-white gap-1">
              <span>ALL</span>
              <Sparkles className="w-3 h-3 text-[#ff3f6c] animate-pulse" />
            </div>
            <div className="hover:text-[#ff3f6c] cursor-pointer h-full flex items-center px-0.5">MEN</div>
            <div className="hover:text-[#ff3f6c] cursor-pointer h-full flex items-center px-0.5">WOMEN</div>
            <div className="hover:text-[#ff3f6c] cursor-pointer h-full flex items-center px-0.5">KIDS</div>

            {/* Rakhi Festive Badge */}
            <Link 
              href="/Category/Rakhi"
              className="flex items-center relative pl-6.5 pr-2.5 py-0.5 bg-gradient-to-r from-[#fff9f0] via-[#ffe4e6] to-[#fff9f0] border border-amber-300 rounded-full text-[#9f1239] text-[7.5px] font-black tracking-widest uppercase shadow-3xs animate-pulse select-none cursor-pointer scale-95 ml-0.5"
            >
              {/* SVG Rakhi on Left */}
              <div className="absolute left-[-7px] top-1/2 -translate-y-1/2 select-none pointer-events-none scale-[0.8]">
                <svg className="w-8 h-8 drop-shadow-3xs" viewBox="0 0 50 50">
                  {/* Red Thread cord */}
                  <path d="M 0 25 Q 12.5 22 25 25 Q 37.5 28 50 25" stroke="#ef4444" strokeWidth="2" fill="none" />
                  <path d="M 0 25 Q 12.5 28 25 25 Q 37.5 22 50 25" stroke="#f59e0b" strokeWidth="1" fill="none" />
                  {/* Center Rakhi Flower */}
                  <circle cx="25" cy="25" r="7" fill="#f59e0b" stroke="#be123c" strokeWidth="1.5" />
                  <circle cx="25" cy="25" r="4.5" fill="#be123c" />
                  <circle cx="25" cy="25" r="2" fill="#ffd700" />
                  {/* Golden beads */}
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 45 * Math.PI) / 180;
                    const x = 25 + 6.2 * Math.cos(angle);
                    const y = 25 + 6.2 * Math.sin(angle);
                    return <circle key={i} cx={x} cy={y} r="0.8" fill="#ffd700" />;
                  })}
                </svg>
              </div>
              
              <span>RAKHI</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-500 ml-1 shrink-0" />
            </Link>
          </div>
          
          {/* Layout Grid Dot Icon */}
          <div className="p-1.5 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-gray-500 hover:text-[#ff3f6c] transition-colors" />
          </div>
        </div>

        {/* 3. Category Story Reels */}
        <div className="grid grid-cols-5 gap-3 px-3.5 py-4 bg-white border-b border-gray-50 select-none w-full">
          {[
            { label: "Fashion", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", bg: "bg-[#1c2536]", href: "/", active: true },
            { label: "Beauty", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=150&q=80", bg: "bg-[#f5f5f7]", href: "/" },
            { label: "Footwear", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80", bg: "bg-[#fcf3f3]", href: "/" },
            { label: "Homeliving", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=150&q=80", bg: "bg-[#ffffff]", href: "/" },
            { label: "Accessories", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80", bg: "bg-[#3a4439]", href: "/" },
          ].map((story, i) => (
            <Link key={i} href={story.href} className="flex flex-col items-center cursor-pointer w-full">
              <div className={`w-full aspect-square overflow-hidden ${story.bg} border border-gray-150 relative shadow-2xs hover:scale-95 transition-all duration-200 p-0.5`}>
                <img src={story.img} alt={story.label} className="w-full h-full object-cover" />
              </div>
              <span className={`text-[9px] mt-1.5 tracking-tight font-black ${story.active ? "text-[#ff3f6c]" : "text-gray-500"}`}>
                {story.label}
              </span>
            </Link>
          ))}
        </div>

        {/* HIGH-FIDELITY CAMPAIGN CAROUSEL (AUTO-PLAYING SLIDER) */}
        <div className="relative mt-3.5 mb-2.5 overflow-hidden shadow-sm aspect-[4/3] max-h-[260px] border-y border-gray-100/50 bg-[#282c3f]">
          <div 
            ref={carouselRef}
            className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const width = e.currentTarget.clientWidth;
              setCurrentSlide(Math.round(scrollLeft / width));
            }}
          >
            
            {/* Slide 1: Genie Stylist */}
            <Link 
              href="/genie?enter=1" 
              className="w-full h-full shrink-0 snap-center relative block select-none"
            >
              <img 
                src="/urban-winter.png" 
                alt="Genie Stylist" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80";
                }}
              />
              {/* Genie Stylist Text */}
              <div className="absolute top-[12%] right-4 flex flex-col items-end text-right mt-2">
                <h2 
                  className="text-black text-xl font-extrabold pr-1"
                  style={{ fontFamily: 'cursive', fontStyle: 'italic' }}
                >
                  Genie Stylist
                </h2>
              </div>
              {/* Yellow Bottom Strip */}
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#ffd166] flex items-center justify-between px-4">
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider">YOUR TWIN, YOUR RULES!</span>
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  TRY IT NOW <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>


            {/* Slide 3: Apna Bazaar */}
            <Link 
              href="/local-bazaar" 
              className="w-full h-full shrink-0 snap-center relative block select-none"
            >
              <img 
                src="/apnabazar.png" 
                alt="Apna Bazaar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#ffd166] flex items-center justify-between px-4">
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider">SUPPORT LOCAL BOUTIQUES!</span>
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  SHOP & CHAT <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Slide 4: Outfit Circle */}
            <Link 
              href="/OutfitCircle" 
              className="w-full h-full shrink-0 snap-center relative block select-none"
            >
              <img 
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80" 
                alt="Outfit Circle" 
                className="w-full h-full object-cover filter brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end pb-12 px-4.5 text-left pointer-events-none">
                <span className="text-white text-[10px] font-black tracking-widest leading-none bg-[#14b8a6] self-start px-2 py-0.5 rounded-md uppercase shadow-sm">GROUP COLLAB</span>
                <h2 className="text-white text-2xl font-black mt-2 leading-none uppercase tracking-tighter font-sans drop-shadow-md">
                  OUTFIT CIRCLE
                </h2>
                <h3 className="text-[#ffd700] text-[11px] font-extrabold mt-1.5 uppercase tracking-wide drop-shadow-md">
                  VOTE, CHAT & STEAL FRIENDS' LOOKS
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#ffd166] flex items-center justify-between px-4">
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider">COLLABORATE FOR NEHA'S WEDDING!</span>
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  JOIN BOARD <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

          </div>
          
          {/* Circular Pagination dots floating on top */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-10 select-none pointer-events-none">
            {[0, 1, 2].map((idx) => (
              <span 
                key={idx}
                className={`w-2.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? "bg-white w-5" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        <RakshaBandhanBanner />

        {/* 4. Main Campaign Banner */}
        <div className="mt-4 bg-[#fff9f3] border-y border-orange-100 overflow-hidden shadow-xs flex items-center justify-between relative">
          {/* Left Gym Image */}
          <div className="w-1/2 h-44 bg-gray-50 overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80" alt="Fitness Campaign" className="w-full h-full object-cover" />
          </div>
          {/* Right Text details */}
          <div className="w-1/2 p-4 flex flex-col justify-center text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className="font-extrabold text-[8px] bg-black text-white px-1.5 py-0.5 rounded tracking-widest uppercase scale-90">HRX</span>
              <span className="text-[9px] text-gray-500 font-bold border-l pl-1 border-gray-300">ENRIZZ</span>
            </div>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">& More</span>
            <h3 className="text-xs font-black text-gray-700 leading-tight">Fuel Your Fitness</h3>
            <div className="text-lg font-black text-gray-800 mt-1 uppercase tracking-tight">
              UNDER <span className="text-[#ff3f6c]">₹899</span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 bg-white/80 p-1 rounded-full border border-gray-150 shadow-xs scale-90 hover:bg-white cursor-pointer transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* 4b. Banner Pagination Dots */}
        <div className="flex justify-center items-center gap-1 mt-2.5 mb-4 select-none">
          {[...Array(9)].map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-gray-700" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* 5. Axis Bank Cashback Strip Offer */}
        <div className="mx-3.5 mb-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between shadow-xs select-none">
          <div className="flex items-center gap-2">
            {/* Small Card Icon */}
            <div className="w-7 h-5 bg-[#0b1329] rounded border border-gray-700 relative overflow-hidden flex items-center justify-center shrink-0">
              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.8 bg-yellow-500 rounded-3xs"></div>
              <span className="text-[4px] text-teal-400 font-extrabold uppercase scale-[0.6] mt-2">AXIS</span>
            </div>
            <div>
              <span className="text-[9px] font-black text-gray-800 block leading-tight">Get 7.5% Cashback* | 0 Joining Fee</span>
              <span className="text-[8px] text-gray-500 font-bold block leading-none">With FLIPKART AXIS BANK Credit Card</span>
            </div>
          </div>
          <button className="bg-[#ff3f6c] text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider hover:bg-[#e0355f] cursor-pointer shrink-0 transition-colors">
            Apply Now ›
          </button>
        </div>

        {/* 6. Subcategory Capsules Reel */}
        <div className="grid grid-cols-5 gap-2.5 px-3.5 py-2 bg-white mb-6 select-none w-full">
          {[
            { label: "Shirt", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80", href: "/shirts" },
            { label: "Kurta Sets", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80", href: "/" },
            { label: "Jeans", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=100&q=80", href: "/" },
            { label: "Jeans", img: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=100&q=80", href: "/" },
            { label: "T-Shirt", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80", href: "/shirts" },
          ].map((capsule, i) => (
            <Link key={i} href={capsule.href} className="flex flex-col items-center cursor-pointer w-full">
              <div className="w-full aspect-[3/4] border border-gray-150 overflow-hidden bg-gray-50 shadow-3xs relative group hover:scale-95 transition-transform duration-200">
                <img src={capsule.img} alt={capsule.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-black text-gray-500 mt-1">{capsule.label}</span>
            </Link>
          ))}
        </div>

        {/* 7. Continue Browsing These Brands */}
        <div className="mx-3.5 mb-6">
          <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-wider mb-3">Continue Browsing These Brands</h3>
          <div className="grid grid-cols-2 gap-3.5">
            {/* Left Image Card */}
            <div className="relative h-52 rounded-2xl overflow-hidden border border-gray-150 shadow-xs group cursor-pointer bg-gray-50">
              <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {/* Right Image Card with PLAY TO SLAY */}
            <div className="relative h-52 rounded-2xl overflow-hidden border border-gray-150 shadow-xs group cursor-pointer bg-gray-50">
              <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent flex items-end justify-center pb-3">
                <div className="bg-black text-white text-[7.5px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-md border border-gray-800 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> PLAY TO SLAY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Original Shop By Category Section */}
        <div className="max-w-7xl mx-auto w-full px-3.5 py-6 border-t border-gray-100">
          <div className="text-left mb-6">
            <h2 className="text-base font-black tracking-widest text-[#282c3f] uppercase">
              SHOP BY CATEGORY
            </h2>
            <div className="h-1 w-12 bg-[#ff3f6c] mt-2"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <Link 
                key={index}
                href={`/Category/${encodeURIComponent(cat.name)}`}
                className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col cursor-pointer"
              >
                {/* Image Container */}
                <div className="h-36 overflow-hidden relative bg-slate-100">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Info */}
                <div className="p-3 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[#282c3f] text-xs tracking-wide truncate">
                      {cat.name}
                    </h4>
                    <p className="text-[#ff3f6c] font-extrabold text-[10px] mt-0.5">
                      {cat.discount}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#f5f5f6]">
                    <span className="text-[9px] font-bold text-[#535766] uppercase tracking-wider group-hover:text-[#ff3f6c] transition-colors">
                      Shop Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
