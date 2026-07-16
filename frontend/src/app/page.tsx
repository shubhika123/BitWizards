"use client";
import RakshaBandhanBanner from "../components/RakshaBandhanBanner";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { Sparkles, ArrowRight, Percent, ChevronRight, ShoppingBag, ShieldCheck, Zap, MapPin, LayoutGrid, Truck } from "lucide-react";
import { categories } from "../lib/Categories";

export default function Home() {  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans relative">
      {/* Header */}
      <Header />
       

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-6">
        {/* 1. Location Indicator Row */}
        <div className="bg-[#fff5f2] px-3.5 py-2 flex items-center justify-between text-[10px] text-gray-700 font-bold border-b border-orange-100 select-none animate-fade-in">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#ff3f6c] shrink-0" />
            <span className="truncate">Deliver to INDIRA GANDHI DELHI TECHNICAL UNIVERSIT...</span>
          </div>
          <span className="text-gray-400 font-black shrink-0">∨</span>
        </div>

        {/* 2. Category Tab Bar */}
        <div className="flex items-center justify-between px-3.5 bg-white border-b border-[#ff3f6c]/20 relative h-10 select-none text-[11.5px] font-extrabold text-gray-500">
          <div className="flex items-center gap-5 h-full">
            {/* ALL Tab with matching curved layout wave border */}
            <div className="bg-white border-t-2 border-x border-[#ff3f6c] rounded-t-xl px-5 h-full flex items-center justify-center text-[#ff3f6c] font-black relative top-[1px] z-10 border-b-2 border-b-white">
              ALL
            </div>
            <div className="hover:text-[#ff3f6c] cursor-pointer h-full flex items-center px-1">MEN</div>
            <div className="hover:text-[#ff3f6c] cursor-pointer h-full flex items-center px-1">WOMEN</div>
            <div className="hover:text-[#ff3f6c] cursor-pointer h-full flex items-center px-1">KIDS</div>

          </div>
          
          {/* Layout Grid Dot Icon */}
          <div className="p-1 cursor-pointer scale-90">
            <div className="w-5.5 h-5.5 rounded-lg bg-[#282c3f] flex items-center justify-center p-1">
              <div className="grid grid-cols-2 gap-0.5">
                <span className="w-1.2 h-1.2 rounded-full bg-white"></span>
                <span className="w-1.2 h-1.2 rounded-full bg-white"></span>
                <span className="w-1.2 h-1.2 rounded-full bg-white"></span>
                <span className="w-1.2 h-1.2 rounded-full bg-white"></span>
              </div>
            </div>
          </div>
        </div>

        {/* HIGH-FIDELITY CAMPAIGN CAROUSEL (AUTO-PLAYING SLIDER) */}
        <div className="relative mx-3.5 mt-3.5 mb-2.5 rounded-2xl overflow-hidden shadow-sm aspect-[4/3] max-h-[260px] border border-gray-100/50 bg-[#282c3f]">
          <div 
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            
            {/* Slide 1: Genie Stylist */}
            <Link 
              href="/genie" 
              className="w-full h-full shrink-0 relative block select-none"
            >
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" 
                alt="Genie Stylist"
                className="w-full h-full object-cover filter brightness-[0.82]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12 px-4.5 text-left">
                <span className="text-white text-[10px] font-black tracking-widest leading-none bg-[#ff3f6c] self-start px-2 py-0.5 rounded-md uppercase">FRESH fwd</span>
                <h2 className="text-white text-2xl font-black mt-2 leading-none uppercase tracking-tighter font-sans">
                  GENIE STYLIST
                </h2>
                <h3 className="text-amber-300 text-[11px] font-extrabold mt-1.5 uppercase tracking-wide">
                  YOUR VIRTUAL STYLING TWIN
                </h3>
              </div>
              {/* Yellow Bottom Strip */}
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#ffd166] flex items-center justify-between px-4">
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider">YOUR TWIN, YOUR RULES!</span>
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  TRY IT NOW <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Slide 2: Bharat Festive Feed */}
            <Link 
              href="/bharat-feed" 
              className="w-full h-full shrink-0 relative block select-none"
            >
              <img 
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" 
                alt="Festive Feed"
                className="w-full h-full object-cover filter brightness-[0.82]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12 px-4.5 text-left">
                <span className="text-white text-[10px] font-black tracking-widest leading-none bg-[#ff3f6c] self-start px-2 py-0.5 rounded-md uppercase">FESTIVE BOOST</span>
                <h2 className="text-white text-2xl font-black mt-2 leading-none uppercase tracking-tighter font-sans">
                  BHARAT FEED
                </h2>
                <h3 className="text-amber-300 text-[11px] font-extrabold mt-1.5 uppercase tracking-wide">
                  REGIONAL TRADITIONS UNDER ₹999
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#ffd166] flex items-center justify-between px-4">
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider">CELEBRATE THE ROOTS!</span>
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  EXPLORE MELAS <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Slide 3: Apna Bazaar */}
            <Link 
              href="/local-bazaar" 
              className="w-full h-full shrink-0 relative block select-none"
            >
              <img 
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80" 
                alt="Apna Bazaar"
                className="w-full h-full object-cover filter brightness-[0.82]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end pb-12 px-4.5 text-left">
                <span className="text-white text-[10px] font-black tracking-widest leading-none bg-emerald-600 self-start px-2 py-0.5 rounded-md uppercase">HYPERLOCAL</span>
                <h2 className="text-white text-2xl font-black mt-2 leading-none uppercase tracking-tighter font-sans">
                  APNA BAZAAR
                </h2>
                <h3 className="text-amber-300 text-[11px] font-extrabold mt-1.5 uppercase tracking-wide">
                  BARGAIN DIRECT WITH WEAVERS
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#ffd166] flex items-center justify-between px-4">
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider">SUPPORT LOCAL BOUTIQUES!</span>
                <span className="text-[#282c3f] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                  SHOP & CHAT <ArrowRight className="w-3.5 h-3.5" />
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

        {/* 3. Category Story Reels */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-3.5 py-4 bg-white border-b border-gray-50 select-none">
          {[
            { label: "Fashion", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80", bg: "bg-[#1c2536]", href: "/", active: true },
            { label: "Beauty", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=150&q=80", bg: "bg-[#f5f5f7]", href: "/" },
            { label: "Footwear", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=150&q=80", bg: "bg-[#fcf3f3]", href: "/" },
            { label: "Homeliving", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=150&q=80", bg: "bg-[#ffffff]", href: "/" },
            { label: "Accessories", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80", bg: "bg-[#3a4439]", href: "/" },
          ].map((story, i) => (
            <Link key={i} href={story.href} className="flex flex-col items-center shrink-0 cursor-pointer snap-start">
              <div className={`w-14 h-14 rounded-[22px] overflow-hidden ${story.bg} border border-gray-150 relative shadow-2xs hover:scale-95 transition-all duration-200 p-0.5`}>
                <img src={story.img} alt={story.label} className="w-full h-full object-cover rounded-[20px]" />
              </div>
              <span className={`text-[9px] mt-1.5 tracking-tight font-black ${story.active ? "text-[#ff3f6c]" : "text-gray-500"}`}>
                {story.label}
              </span>
            </Link>
          ))}
        </div>

        {/* DEDICATED HIGH-FIDELITY APNA BAZAAR CAMPAIGN CARD */}
        <Link href="/local-bazaar" className="block mx-3.5 mt-3 mb-4 group cursor-pointer select-none relative">
          <div className="bg-[#fff6ee] border border-[#fde8d4] rounded-2xl p-4 shadow-3xs text-left relative overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow duration-300 min-h-[200px]">
            
            {/* Faint hand-sketched leaf branches background decoration */}
            <div className="absolute right-[120px] top-[15px] opacity-25 pointer-events-none select-none z-5">
              <svg className="w-10 h-24 text-amber-600/35" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 60">
                <path d="M12 60 C12 40 18 30 18 20 C18 10 12 5 12 0 M12 45 C15 42 19 40 19 35 C19 30 14 30 12 35 M12 35 C8 32 4 30 4 25 C4 20 9 20 12 25 M12 25 C15 22 19 20 19 15 C19 10 14 10 12 15 M12 15 C8 12 4 10 4 5 C4 0 9 0 12 5" />
              </svg>
            </div>

            {/* Top Content Row: Stamp on left, description in middle, weaver on right */}
            <div className="flex gap-4 items-start z-10 pr-28">
              {/* Left Column: Double Dotted/Scalloped Stamp */}
              <div className="w-[92px] h-[92px] shrink-0 relative flex items-center justify-center select-none scale-105">
                {/* Custom SVG Stamp Borders */}
                <svg className="absolute inset-0 w-full h-full rotate-[15deg]" viewBox="0 0 100 100">
                  {/* Outer bold dotted scalloped frame */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    fill="none" 
                    stroke="#ff3f6c" 
                    strokeWidth="3.5" 
                    strokeDasharray="6 7" 
                    strokeLinecap="round"
                  />
                  {/* Inner thin dashed gold line */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#b45309" 
                    strokeWidth="1" 
                    strokeDasharray="2 4" 
                  />
                </svg>

                {/* Stamp text content absolutely centered */}
                <div className="z-10 flex flex-col items-center justify-center text-center mt-[-2px]">
                  <span className="text-[10px] font-black text-slate-800 leading-none tracking-tight">APNA</span>
                  <span className="text-[10.5px] font-black text-slate-800 leading-none mt-0.5 tracking-tight">BAZAAR</span>
                  
                  {/* Small gold line with dot */}
                  <div className="flex items-center gap-1 my-1">
                    <span className="w-1.5 h-[1px] bg-amber-600/50"></span>
                    <span className="w-1 h-1 rounded-full bg-amber-600"></span>
                    <span className="w-1.5 h-[1px] bg-amber-600/50"></span>
                  </div>

                  <span className="text-[6.5px] font-black text-gray-500 uppercase tracking-widest leading-none">MADE IN</span>
                  <span className="text-[7.5px] font-black text-emerald-800 tracking-tighter leading-none mt-0.5">BHARAT</span>
                  <span className="text-xs text-red-500 leading-none mt-1">❤</span>
                </div>
              </div>


              {/* Middle Column: Text Details */}
              <div className="flex flex-col gap-1 text-left">
                <h4 className="text-xs font-black text-slate-800 tracking-wide">
                  Support Local. Shop Unique.
                </h4>
                <p className="text-[9.5px] text-gray-500 font-bold leading-normal mt-0.5">
                  Discover handpicked styles from <span className="text-[#ff3f6c] font-black">verified boutiques</span> near you!
                </p>

                {/* Three feature icons side-by-side with divider lines */}
                <div className="flex items-center gap-3 mt-2 select-none">
                  <div className="flex flex-col items-center text-center">
                    <ShieldCheck className="w-4 h-4 text-[#ff3f6c]" />
                    <span className="text-[6.5px] font-black text-slate-700 leading-none mt-1.5 uppercase">Trusted</span>
                    <span className="text-[6.5px] font-black text-slate-700 leading-none uppercase mt-0.5">Sellers</span>
                  </div>
                  
                  <div className="w-[1px] h-6 bg-gray-200/80"></div>
                  
                  <div className="flex flex-col items-center text-center">
                    <Truck className="w-4 h-4 text-[#ff3f6c]" />
                    <span className="text-[6.5px] font-black text-slate-700 leading-none mt-1.5 uppercase">Fast Local</span>
                    <span className="text-[6.5px] font-black text-slate-700 leading-none uppercase mt-0.5">Delivery</span>
                  </div>
                  
                  <div className="w-[1px] h-6 bg-gray-200/80"></div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-4 h-4 rounded-full border border-[#ff3f6c] flex items-center justify-center shrink-0">
                      <span className="text-[8.5px] font-black text-[#ff3f6c] leading-none mt-[-1px]">₹</span>
                    </div>
                    <span className="text-[6.5px] font-black text-slate-700 leading-none mt-1.5 uppercase">Best Local</span>
                    <span className="text-[6.5px] font-black text-slate-700 leading-none uppercase mt-0.5">Prices</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Weavers Illustration (Full Height with Background Blending) */}
            <div className="absolute right-0 top-0 bottom-0 w-[150px] overflow-hidden select-none z-5">
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#fff6ee] via-[#fff6ee]/60 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fff6ee] to-transparent z-10 pointer-events-none"></div>
              <img 
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=280&h=320&q=80" 
                alt="Local Weaver Boutique Owner" 
                className="w-full h-full object-cover mix-blend-multiply" 
              />
            </div>

            {/* Bottom Row: Button on left, Location Status Strip at bottom */}
            <div className="flex flex-col gap-3.5 z-10">
              {/* Button */}
              <div className="bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-[8.5px] font-black py-1.5 px-3 rounded-xl uppercase tracking-wider w-fit flex flex-col items-start leading-tight shadow-3xs transition-colors select-none">
                <span>EXPLORE</span>
                <span className="flex items-center gap-0.5">APNA BAZAAR <ArrowRight className="w-3 h-3 text-white inline-block ml-0.5" /></span>
              </div>

              {/* Location Strip nested at the bottom */}
              <div className="bg-white border border-[#fde8d4] rounded-xl p-2.5 flex items-center justify-between text-[9.5px] font-bold text-gray-650 shadow-3xs">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Showing sellers near <strong className="text-gray-800">New Delhi</strong></span>
                </div>
                
                <div className="border border-emerald-100 px-2 py-1 rounded-md bg-[#eaf1eb] text-[7.5px] font-black text-gray-700 flex items-center gap-0.5 shrink-0 shadow-3xs">
                  Within 5 km <span className="text-[6.5px]">▼</span>
                </div>
              </div>
            </div>

          </div>
        </Link>

        {/* 4. Main Campaign Banner */}
        <div className="mx-3.5 mt-4 bg-[#fff9f3] rounded-2xl border border-orange-100 overflow-hidden shadow-xs flex items-center justify-between relative">
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
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-3.5 py-2 bg-white mb-6 select-none">
          {[
            { label: "Shirt", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80", href: "/shirts" },
            { label: "Kurta Sets", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80", href: "/" },
            { label: "Jeans", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=100&q=80", href: "/" },
            { label: "Jeans", img: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=100&q=80", href: "/" },
            { label: "T-Shirt", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=100&q=80", href: "/shirts" },
          ].map((capsule, i) => (
            <Link key={i} href={capsule.href} className="flex flex-col items-center shrink-0 cursor-pointer snap-start">
              <div className="w-13 h-17 rounded-2xl border border-gray-150 overflow-hidden bg-gray-50 shadow-3xs relative group hover:scale-95 transition-transform duration-200">
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
