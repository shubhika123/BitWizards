"use client";
import RakshaBandhanBanner from "../components/RakshaBandhanBanner";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { Sparkles, ArrowRight, Percent, ChevronRight, ShoppingBag, ShieldCheck, Zap, MapPin, LayoutGrid, Truck, Heart, Gem, Gift } from "lucide-react";
import { categories } from "../lib/Categories";
import { useAuthStore } from "../store/authStore";
import { getContestHistory } from "../lib/OutfitCircleApi";

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

  const [activeFestival, setActiveFestival] = useState<string>("");
  const [simulatedDate, setSimulatedDate] = useState<string>("");

  const loadActiveFestivalName = () => {
    const dateStr = localStorage.getItem("simulated_date") || "";
    setSimulatedDate(dateStr);
    const url = dateStr ? `http://127.0.0.1:8000/fetch-feed?simulated_date=${encodeURIComponent(dateStr)}` : "http://127.0.0.1:8000/fetch-feed";

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

  const [personalizedGuesses, setPersonalizedGuesses] = useState<Array<{
    category: string;
    price: number;
    matchingProducts: any[];
  }>>([]);

  const loadPersonalizedFeed = async () => {
    if (!user?.user_id) {
      setPersonalizedGuesses([]);
      return;
    }

    try {
      const res = await getContestHistory(user.user_id);
      const categoryGuesses = res?.category_guesses || {};
      const entries = Object.entries(categoryGuesses) as [string, number][];

      const results = entries.map(([catName, price]) => {
        // Find matching category in Categories.ts
        const cat = categories.find((c) => 
          c.name.toLowerCase().includes(catName.toLowerCase()) || 
          catName.toLowerCase().includes(c.name.toLowerCase())
        );

        if (!cat) return null;

        // Filter items under or equal to price, sort highest value first
        const matching = cat.products
          .filter((p) => p.product_price <= Number(price))
          .sort((a, b) => b.product_price - a.product_price);

        // Fallback if no products are strictly <= price: pick closest items
        const displayProducts = matching.length > 0 ? matching : [...cat.products].sort((a, b) => Math.abs(a.product_price - Number(price)) - Math.abs(b.product_price - Number(price)));

        return {
          category: cat.name,
          price: Number(price),
          matchingProducts: displayProducts.slice(0, 6)
        };
      }).filter(Boolean) as Array<{ category: string; price: number; matchingProducts: any[] }>;

      setPersonalizedGuesses(results);
    } catch (e) {
      console.error("Error building personalized homepage shelf from MySQL:", e);
      setPersonalizedGuesses([]);
    }
  };

  useEffect(() => {
    loadPersonalizedFeed();
  }, [user]);

  useEffect(() => {
    window.addEventListener("storage", loadPersonalizedFeed);
    return () => {
      window.removeEventListener("storage", loadPersonalizedFeed);
    };
  }, [user]);

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
        <div className="px-3.5 py-1.5 flex items-center justify-between text-[10px] font-bold border-b border-gray-100 select-none bg-[#FAFAFA] text-gray-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span className="truncate">Delivering to {getCityState(user?.city || "Bengaluru")}</span>
          </div>
          <span className="text-gray-400 font-bold shrink-0">∨</span>
        </div>

        {/* 2. Category Tab Bar */}
        <div className="flex items-center justify-between px-3.5 bg-white border-b border-gray-100 relative h-10 select-none text-[11px] font-bold text-gray-700">
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

        {/* 3. Category Story Reels */}
        <div className="flex items-center gap-4 px-3.5 py-3.5 bg-white border-b border-gray-100 select-none overflow-x-auto scrollbar-none w-full">
          {[
            { label: "Fashion", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", bg: "bg-[#1c2536]", href: "/", active: true },
            { label: "Beauty", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=150&q=80", bg: "bg-[#f5f5f7]", href: "/" },
            { label: "Footwear", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80", bg: "bg-[#fcf3f3]", href: "/" },
            { label: "Homeliving", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=150&q=80", bg: "bg-[#ffffff]", href: "/" },
            { label: "Accessories", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80", bg: "bg-[#3a4439]", href: "/" },
          ].map((story, i) => (
            <Link key={i} href={story.href} className="flex flex-col items-center cursor-pointer shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 bg-white relative p-0.5 flex items-center justify-center">
                <img src={story.img} alt={story.label} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className={`text-[10px] mt-1 font-semibold tracking-tight ${story.active ? "text-[#ff3f6c]" : "text-gray-700"}`}>
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

        {/* 🎯 PERSONALIZED SHELF BASED ON USER'S CONTEST GUESSES */}
        {personalizedGuesses.length > 0 && (
          <div className="space-y-3 my-1 select-none">
            {personalizedGuesses.map((guessItem, idx) => (
              <div 
                key={idx} 
                className="mx-3.5 bg-white py-3 border-b border-gray-100 text-left"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-bold bg-[#ff3f6c] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                        🎯 Based on your Guess
                      </span>
                      <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-widest">MRP Master</span>
                    </div>
                    <h3 className="text-[13px] font-bold text-gray-800 uppercase tracking-wide mt-1">
                      {guessItem.category} Under ₹{guessItem.price}
                    </h3>
                  </div>
                  <Link 
                    href={`/Category/${encodeURIComponent(guessItem.category)}`}
                    className="text-[10px] font-bold text-[#ff3f6c] flex items-center gap-0.5 hover:underline"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Horizontal Scrollable Product Cards matching budget */}
                <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-0.5">
                  {guessItem.matchingProducts.map((prod) => (
                    <div 
                      key={prod.product_id}
                      className="w-32 shrink-0 bg-white border border-[#EFEFEF] overflow-hidden flex flex-col justify-between group hover:translate-y-[-2px] transition-transform duration-200"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}
                    >
                      <div className="h-28 bg-gray-50 relative overflow-hidden">
                        <img src={prod.product_image_url} alt={prod.product_name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[7.5px] font-bold px-1.5 py-0.5 rounded">
                          Under ₹{guessItem.price}
                        </span>
                      </div>
                      <div className="p-2 flex flex-col justify-between flex-1">
                        <span className="text-[10px] font-bold text-gray-800 truncate block">{prod.product_name}</span>
                        <span className="text-[10px] font-black text-[#ff3f6c] mt-0.5 block">₹{prod.product_price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Main Campaign Banner */}
        <div className="mt-4 bg-[#F5F5F5] border-y border-gray-100 overflow-hidden flex items-center justify-between relative">
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
            <h3 className="text-xs font-bold text-gray-700 leading-tight">Fuel Your Fitness</h3>
            <div className="text-lg font-black text-gray-850 mt-1 uppercase tracking-tight">
              UNDER <span className="text-[#ff3f6c]">₹899</span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 bg-white/80 p-1 rounded-full border border-gray-150 scale-90 hover:bg-white cursor-pointer transition-colors">
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
        <div className="mx-3.5 mb-4 bg-[#FAFAFA] border border-[#EAEAEA] p-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            {/* Small Card Icon */}
            <div className="w-7 h-5 bg-[#0b1329] rounded border border-gray-700 relative overflow-hidden flex items-center justify-center shrink-0">
              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.8 bg-yellow-500 rounded-3xs"></div>
              <span className="text-[4px] text-teal-400 font-extrabold uppercase scale-[0.6] mt-2">AXIS</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-805 block leading-tight">Get 7.5% Cashback* | 0 Joining Fee</span>
              <span className="text-[8px] text-gray-550 font-bold block leading-none">With FLIPKART AXIS BANK Credit Card</span>
            </div>
          </div>
          <button className="bg-[#ff3f6c] text-white text-[8px] font-bold px-2.5 py-1 rounded uppercase tracking-wider hover:bg-[#e0355f] cursor-pointer shrink-0 transition-colors border-none">
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
              <div className="w-full aspect-[3/4] border border-[#EFEFEF] overflow-hidden bg-gray-50 relative group hover:scale-95 transition-transform duration-200">
                <img src={capsule.img} alt={capsule.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-bold text-gray-500 mt-1">{capsule.label}</span>
            </Link>
          ))}
        </div>

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
            <div className="relative h-52 overflow-hidden border border-[#EFEFEF] group cursor-pointer bg-gray-50">
              <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent flex items-end justify-center pb-3">
                <div className="bg-black text-white text-[7.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm border border-gray-850 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> PLAY TO SLAY
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Original Shop By Category Section */}
        <div className="max-w-7xl mx-auto w-full px-3.5 py-6 border-t border-gray-100">
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
    </div>
  );
}
