"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { Sparkles, ArrowRight, Percent, ChevronRight, ShoppingBag, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const [activePromoIndex, setActivePromoIndex] = useState(0);

  const categories = [
    {
      name: "Ethnic Wear",
      discount: "50-80% OFF",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Casual Wear",
      discount: "40-80% OFF",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Men's Activewear",
      discount: "30-70% OFF",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Women's Activewear",
      discount: "30-70% OFF",
      image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Western Wear",
      discount: "40-80% OFF",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Sportswear",
      discount: "30-80% OFF",
      image: "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Loungewear",
      discount: "30-60% OFF",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Innerwear",
      discount: "UP TO 70% OFF",
      image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Lingerie",
      discount: "UP TO 70% OFF",
      image: "https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Watches",
      discount: "UP TO 80% OFF",
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Grooming",
      discount: "UP TO 60% OFF",
      image: "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Beauty & Makeup",
      discount: "UP TO 60% OFF",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const pocketFriendlyDeals = [
    { label: "Under ₹99", href: "/" },
    { label: "Flat 80% Off", href: "/" },
    { label: "Under ₹299", href: "/" },
    { label: "Under ₹399", href: "/" },
    { label: "Under ₹499", href: "/" },
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        
        {/* Top Promotional Coupon Banner */}
        <div className="bg-gradient-to-r from-[#fff0f3] to-[#ffe5ec] py-3 sm:py-4 px-4 text-center border-b border-[#ffd1dc]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-[#282c3f]">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-[#ff3f6c] text-white text-[10px] sm:text-xs font-extrabold px-2 py-1 rounded">COUPON</span>
              <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wide">Get 25% Off Up To ₹200 Off*</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-md border-2 border-dashed border-[#ff3f6c]">
              <span className="text-[10px] sm:text-xs text-[#535766] uppercase font-bold">Code:</span>
              <span className="font-extrabold text-sm sm:text-base text-[#ff3f6c] tracking-wider">MYNTRASAVE</span>
            </div>
            <span className="text-[10px] sm:text-xs text-[#535766] font-medium">On Your First Order | T&C Apply</span>
          </div>
        </div>

        {/* Hero Banner Carousel (fwd Gen-Z Fashion) */}
        <div className="w-full bg-[#fff9f3] py-6 sm:py-12 px-4 md:px-12 border-b border-[#f5f5f6]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Content */}
            <div className="md:col-span-5 space-y-4 sm:space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#ff3f6c]/10 text-[#ff3f6c] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                <Percent className="w-3.5 h-3.5" /> First Order Special
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#282c3f] leading-tight">
                Gen-Z Fashion <br />
                For All <span className="text-[#ff3f6c] font-black italic">fwd</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-[#535766] font-medium">
                Trending styles, bold aesthetics, and everyday essentials.
              </p>
              <div className="text-2xl sm:text-3xl font-black text-[#282c3f]">
                UNDER <span className="text-[#ff3f6c]">₹999</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link 
                  href="/" 
                  className="bg-[#282c3f] hover:bg-[#151722] text-white font-bold px-8 py-3.5 rounded-md text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Image/Visuals */}
            <div className="md:col-span-7 relative h-[220px] sm:h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80" 
                alt="Gen-Z Fashion Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <div className="text-white">
                  <span className="bg-[#ff3f6c] text-[10px] sm:text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">New Drop</span>
                  <h3 className="text-base sm:text-xl font-bold mt-1 sm:text-2xl">Summer Streetwear Essentials</h3>
                  <p className="text-xs sm:text-sm text-white/80">Available now with free shipping</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Myntra Genie Premium Entry Card */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-12 py-6 sm:py-12">
          <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-[#334155] group">
            {/* Background glowing elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff3f6c]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] text-white text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-md">
                  <Sparkles className="w-3.5 h-3.5 animate-spin-slow" /> MYNTRA GENIE STYLIST
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Your Personal AI Stylist <br />
                  Is Ready To Curate.
                </h2>
                
                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                  Bypass the endless scroll. Type what you are shopping for in your own words (Hinglish/Telugu/Bhojpuri welcome!) and watch Genie build a cohesive 4-piece look on your custom Digital Twin.
                </p>

                {/* Features list */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                    <Zap className="w-4 h-4 text-[#ff3f6c] shrink-0" />
                    <span>4-Piece Look Curation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-[#ff3f6c] shrink-0" />
                    <span>Digital Twin Fitting</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                    <ShoppingBag className="w-4 h-4 text-[#ff3f6c] shrink-0" />
                    <span>One-Click Checkout</span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-4">
                  <Link 
                    href="/genie" 
                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] hover:from-[#e02f59] hover:to-[#f05275] text-white font-extrabold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02]"
                  >
                    Launch Genie Stylist <Sparkles className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual representation of the Genie workspace */}
              <div className="lg:col-span-5 flex justify-center w-full">
                <div className="bg-[#1e293b]/80 border border-[#334155] rounded-2xl p-4 sm:p-6 w-full max-w-[360px] shadow-xl relative overflow-hidden">
                  {/* Digital Twin Placeholder */}
                  <div className="flex items-center justify-between border-b border-[#334155] pb-3 sm:pb-4 mb-3 sm:mb-4">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Twin</span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#ff3f6c] bg-[#ff3f6c]/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                  
                  {/* 2x2 Grid Preview */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="aspect-square bg-[#0f172a] rounded-lg border border-[#334155] p-2 flex flex-col justify-between">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase">Topwear</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-800 mx-auto"></div>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 text-center font-semibold truncate">Kurta</span>
                    </div>
                    <div className="aspect-square bg-[#0f172a] rounded-lg border border-[#334155] p-2 flex flex-col justify-between">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase">Bottomwear</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-800 mx-auto"></div>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 text-center font-semibold truncate">Palazzo</span>
                    </div>
                    <div className="aspect-square bg-[#0f172a] rounded-lg border border-[#334155] p-2 flex flex-col justify-between">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase">Footwear</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-800 mx-auto"></div>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 text-center font-semibold truncate">Juttis</span>
                    </div>
                    <div className="aspect-square bg-[#0f172a] rounded-lg border border-[#334155] p-2 flex flex-col justify-between">
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase">Accessory</span>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-slate-800 mx-auto"></div>
                      <span className="text-[8px] sm:text-[9px] text-slate-400 text-center font-semibold truncate">Earrings</span>
                    </div>
                  </div>

                  {/* Budget bar preview */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] sm:text-[10px] text-slate-400 font-bold">
                      <span>BUDGET TRACKER</span>
                      <span className="text-[#ff3f6c]">₹4,350 / ₹5,000</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#ff3f6c] h-full rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pocket Friendly Bargain Section */}
        <div className="bg-[#f5f5f6] py-8 sm:py-12 px-4 md:px-12 border-t border-b border-[#eaeaec]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider text-[#282c3f] uppercase">
                  Pocket Friendly Bargain!
                </h2>
                <p className="text-[#535766] text-xs sm:text-sm mt-0.5">Where style matches savings perfectly.</p>
              </div>
              <div className="flex items-center gap-1 text-[#ff3f6c] font-bold text-xs sm:text-sm cursor-pointer hover:underline">
                View All Deals <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
              {pocketFriendlyDeals.map((deal, index) => (
                <Link 
                  key={index}
                  href={deal.href}
                  className="bg-white hover:shadow-md border border-[#eaeaec] rounded-xl p-4 sm:p-6 text-center transition-all group flex flex-col items-center justify-center gap-2 sm:gap-3"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#ff3f6c]/5 flex items-center justify-center text-[#ff3f6c] group-hover:bg-[#ff3f6c] group-hover:text-white transition-all">
                    <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="font-extrabold text-sm sm:text-lg text-[#282c3f] group-hover:text-[#ff3f6c] transition-colors">
                    {deal.label}
                  </span>
                  <span className="text-[9px] sm:text-xs text-[#9496a2] font-semibold uppercase tracking-wider">Shop Now</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Shop By Category Grid */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-12 py-10 sm:py-16">
          <div className="text-center md:text-left mb-8 sm:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-[#282c3f] uppercase">
              SHOP BY CATEGORY
            </h2>
            <div className="h-1 w-20 bg-[#ff3f6c] mt-3 mx-auto md:mx-0"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
            {categories.map((cat, index) => (
              <div 
                key={index}
                className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Image Container */}
                <div className="h-40 sm:h-48 overflow-hidden relative bg-slate-100">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-[#282c3f] text-xs sm:text-sm md:text-base tracking-wide truncate">
                      {cat.name}
                    </h4>
                    <p className="text-[#ff3f6c] font-extrabold text-[10px] sm:text-xs md:text-sm mt-1">
                      {cat.discount}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#f5f5f6]">
                    <span className="text-[9px] sm:text-[11px] font-bold text-[#535766] uppercase tracking-wider group-hover:text-[#ff3f6c] transition-colors">
                      Shop Now
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#282c3f] text-white py-10 sm:py-12 px-4 md:px-12 border-t border-[#eaeaec]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm text-slate-300">
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Online Shopping</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/" className="hover:text-white">Men</Link></li>
              <li><Link href="/" className="hover:text-white">Women</Link></li>
              <li><Link href="/" className="hover:text-white">Kids</Link></li>
              <li><Link href="/" className="hover:text-white">Home & Living</Link></li>
              <li><Link href="/" className="hover:text-white">Beauty</Link></li>
            </ul>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Customer Policies</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link href="/" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/" className="hover:text-white">T&C</Link></li>
              <li><Link href="/" className="hover:text-white">Terms Of Use</Link></li>
              <li><Link href="/" className="hover:text-white">Track Orders</Link></li>
            </ul>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Experience Myntra App</h4>
            <div className="flex gap-3">
              <div className="bg-slate-800 px-3 py-2 rounded border border-slate-700 text-xs font-bold text-center flex-1 cursor-pointer hover:bg-slate-700">
                Google Play
              </div>
              <div className="bg-slate-800 px-3 py-2 rounded border border-slate-700 text-xs font-bold text-center flex-1 cursor-pointer hover:bg-slate-700">
                App Store
              </div>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase">Keep In Touch</h4>
            <p className="text-xs leading-relaxed">
              Register now to get updates on promotions, coupons, and personalized AI styling recommendations.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-700 text-center text-xs text-slate-400">
          <p>© 2026 Myntra HackerRamp - Team BitWizards. Built for Bharat.</p>
        </div>
      </footer>
    </div>
  );
}
