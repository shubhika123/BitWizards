"use client";
import RakshaBandhanBanner from "../components/RakshaBandhanBanner";
import YouMayLikeThis from "../components/YouMayLikeThis";
import React, { useState, useEffect, useRef } from "react";
import { SahiDaamModal } from "../components/sahidaam/SahiDaamModal";
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
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);

  const [activeFestival, setActiveFestival] = useState<string>("");
  const [simulatedDate, setSimulatedDate] = useState<string>("");
  const loadActiveFestivalName = () => {
    const dateStr = localStorage.getItem("simulated_date") || "";
    setSimulatedDate(dateStr);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bitwizards.onrender.com";
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
    loadActiveFestivalName();
    window.addEventListener("storage", loadActiveFestivalName);
    return () => {
      window.removeEventListener("storage", loadActiveFestivalName);
    };
  }, []);



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

  const isDiwali = activeFestival === "Diwali";
  const isRakhi = activeFestival === "Raksha Bandhan";

  const pageBg = "bg-white";

  return (
    <div className={`min-h-screen flex flex-col font-sans relative ${pageBg}`}>
      {/* Header */}
      <Header />
       

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-4">
        {/* 1. Location Indicator Row */}
        <div className={`px-3.5 py-1.5 flex items-center justify-between text-[10px] font-bold border-b border-gray-100 select-none ${isDiwali ? 'bg-[#f3e8ff]' : 'bg-[#FAFAFA]'} text-gray-600`}>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span className="truncate">Delivering to {getCityState(user?.city || "Bengaluru")}</span>
          </div>
          <span className="text-gray-400 font-bold shrink-0">∨</span>
        </div>

        {/* 2. Category Tab Bar */}
        <div className={`flex items-center justify-between px-3.5 ${isDiwali ? 'bg-[#faf5ff]' : 'bg-white'} border-b border-gray-100 relative h-10 select-none text-[11px] font-bold text-gray-700`}>
          <div className="flex items-center gap-4.5 h-full">
            <div className="border-b-2 border-[#ff3f6c] text-[#ff3f6c] h-full flex items-center justify-center font-bold px-1 gap-1">
              <span>ALL</span>
              <Sparkles className="w-3.5 h-3.5 text-[#ff3f6c] animate-pulse" />
            </div>
            <div className="cursor-pointer h-full flex items-center px-0.5 hover:text-[#ff3f6c]">MEN</div>
            <div className="cursor-pointer h-full flex items-center px-0.5 hover:text-[#ff3f6c]">WOMEN</div>
            <div className="cursor-pointer h-full flex items-center px-0.5 hover:text-[#ff3f6c]">KIDS</div>

            {/* Rakhi Festive Badge */}
            {isRakhi && (
              <Link 
                href="/Category/Rakhi"
                className="flex items-center pl-2 pr-2.5 py-0.5 border border-rose-300 rounded-full text-[#ff3f6c] text-[8px] font-bold uppercase tracking-wider ml-0.5"
              >
                <span>RAKHI</span>
                <Sparkles className="w-2.5 h-2.5 text-[#ff3f6c] ml-1 shrink-0" />
              </Link>
            )}

            {/* Diwali Festive Badge */}
            {isDiwali && (
              <Link 
                href="/Category/Jewellery"
                className="flex items-center pl-2 pr-2.5 py-0.5 border border-amber-400 rounded-full text-amber-700 text-[8px] font-bold uppercase tracking-wider ml-0.5"
              >
                <span>DIWALI LIVE</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-600 ml-1 shrink-0" />
              </Link>
            )}
          </div>
          
          {/* Layout Grid Dot Icon */}
          <div className="p-1.5 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-gray-500 hover:text-[#ff3f6c] transition-colors" />
          </div>
        </div>

        {/* Subcategory Capsules Reel (Moved from below) */}
        <div className="sticky top-[125px] z-[45] grid grid-cols-5 gap-2.5 px-3.5 py-4 bg-white border-b border-gray-50 select-none w-full shadow-sm">
          {[
            { label: "Shirt", img: "/shirts.png", href: "/Category/Shirt" },
            { label: "Kurta Sets", img: "/kurtasets.png", href: "/Category/Kurta Sets" },
            { label: "Jeans", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=100&q=80", href: "/Category/Jeans" },
            { label: "Home Decor", img: "/homedecor.png", href: "/Category/Decor" },
            { label: "T-Shirt", img: "/tshirt.png", href: "/Category/T-Shirt" },
          ].map((capsule, i) => (
            <Link key={i} href={capsule.href} className="flex flex-col items-center cursor-pointer w-full">
              <div className="w-full aspect-square rounded-full border border-gray-100 overflow-hidden bg-gray-50 shadow-sm relative group hover:scale-95 transition-transform duration-200">
                <img src={capsule.img} alt={capsule.label} className="w-full h-full object-cover object-top" />
              </div>
              <span className="text-[10px] font-bold text-gray-700 mt-1.5 whitespace-nowrap">{capsule.label}</span>
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

            {/* Slide 5: Guess the Price */}
            <div 
              onClick={() => setIsGuessModalOpen(true)}
              className="w-full h-full shrink-0 snap-center relative block select-none cursor-pointer bg-white"
            >
              <img 
                src="/guesstheprice.png" 
                alt="Guess The Price"
                className="w-full h-full object-contain pb-9"
              />
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#282c3f] flex items-center justify-between px-4">
                <span className="text-[#ffd166] text-[9.5px] font-black uppercase tracking-wider">GUESS & WIN REWARDS!</span>
                <span className="text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  PLAY NOW <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

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







        {/* 7. Continue Browsing These Brands */}
        <div className="mx-3.5 mb-6">
          <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-3">Continue Browsing These Brands</h3>
          <div className="grid grid-cols-2 gap-3.5">
            {/* Left Image Card */}
            <div className="relative h-52 overflow-hidden border border-[#EFEFEF] group cursor-pointer bg-gray-50">
              <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {/* Right Image Card with PLAY TO SLAY */}
            <div className="relative h-52 rounded-2xl overflow-hidden shadow-xs group cursor-pointer bg-gray-50">
              <img src="/playtoslay.png" alt="" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent flex items-end justify-center pb-3">
                <div className="bg-black text-white text-[7.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm border border-gray-850 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> PLAY TO SLAY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Over-guessed Recommendations Section */}
        <YouMayLikeThis />

        {/* 8. Original Shop By Category Section */}
        <div className="max-w-7xl mx-auto w-full px-3.5 py-6 mt-2 border-t border-gray-100">
          <div className="text-left mb-6">
            <h2 className="text-[14px] font-bold tracking-wider text-gray-800 uppercase">
              SHOP BY CATEGORY
            </h2>
            <div className="h-0.5 w-10 bg-[#ff3f6c] mt-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <Link 
                key={index}
                href={`/Category/${encodeURIComponent(cat.name)}`}
                className="bg-white border border-[#EFEFEF] overflow-hidden flex flex-col cursor-pointer transition-transform duration-200 hover:translate-y-[-2px]"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
              >
                {/* Image Container */}
                <div className="h-36 overflow-hidden relative bg-slate-100">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Info */}
                <div className="p-3 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-[11px] tracking-wide truncate">
                      {cat.name}
                    </h4>
                    <p className="text-[#ff3f6c] font-bold text-[10px] mt-0.5">
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

      {isGuessModalOpen && <SahiDaamModal onClose={() => setIsGuessModalOpen(false)} />}
    </div>
  );
}
