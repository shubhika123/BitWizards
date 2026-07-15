"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { 
  MapPin, 
  Sparkles, 
  CloudRain, 
  Sun, 
  Snowflake, 
  ChevronRight, 
  ShoppingBag, 
  Map, 
  Compass, 
  ArrowRight 
} from "lucide-react";

interface CityConfig {
  name: string;
  weatherIcon: React.ReactNode;
  weatherText: string;
  weatherAdvice: string;
  festivalText: string;
  geniePrompt: string;
  trendingItems: Array<{ name: string; category: string; price: number; img: string }>;
  localBoutiqueCount: number;
}

export default function BharatFeed() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string>("Ghaziabad");

  const cityData: Record<string, CityConfig> = {
    Ghaziabad: {
      name: "Ghaziabad",
      weatherIcon: <CloudRain className="w-6 h-6 text-indigo-400 animate-bounce" />,
      weatherText: "🌧️ Monsoon - High Humidity (32°C)",
      weatherAdvice: "High-humidity days call for breathable pastel fits. Don't let the sweat ruin your vibe!",
      festivalText: "Navratri Special Sourcing & Regional Melas",
      geniePrompt: "Monsoon-friendly fresh college look under 2000",
      localBoutiqueCount: 14,
      trendingItems: [
        { name: "Pastel Chikankari Kurta", category: "Ethnic Wear", price: 1299, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80" },
        { name: "Breathable Linen Pants", category: "Bottom Wear", price: 890, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=150&q=80" }
      ]
    },
    Lucknow: {
      name: "Lucknow",
      weatherIcon: <Sun className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />,
      weatherText: "☀️ Sunny & Clear (34°C)",
      weatherAdvice: "Bright sunny days call for authentic handloom weaves and airy styling.",
      festivalText: "Raksha Bandhan Traditional Sourcing",
      geniePrompt: "Light breathable cotton ethnic look under 3500",
      localBoutiqueCount: 22,
      trendingItems: [
        { name: "Premium White Kurti", category: "Kurta Sets", price: 1590, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80" },
        { name: "Handcrafted Juttis", category: "Footwear", price: 790, img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=150&q=80" }
      ]
    },
    Delhi: {
      name: "New Delhi",
      weatherIcon: <Snowflake className="w-6 h-6 text-sky-400 animate-pulse" />,
      weatherText: "❄️ Chilly Winter morning (14°C)",
      weatherAdvice: "Chilly winter winds call for smart-casual knits, layer overlays, and denim jackets.",
      festivalText: "Lohri & Makar Sankranti Warm Fits",
      geniePrompt: "Winter conference smart-casual look under 5000",
      localBoutiqueCount: 18,
      trendingItems: [
        { name: "Checked Flannel Shirt", category: "Shirts", price: 1199, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80" },
        { name: "Slim Fit Black Jeans", category: "Jeans", price: 1450, img: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=150&q=80" }
      ]
    }
  };

  const currentConfig = cityData[selectedCity] || cityData["Ghaziabad"];

  const handleGenieBannerClick = () => {
    router.push(`/genie?q=${encodeURIComponent(currentConfig.geniePrompt)}`);
  };

  return (
    <div className="bg-[#f7f8fa] min-h-screen flex flex-col font-sans relative">
      <Header />

      {/* Main content body scrollable */}
      <main className="flex-1 flex flex-col pb-16 overflow-y-auto select-none">
        
        {/* 1. Location & Region selector dropdown */}
        <div className="bg-white px-3.5 py-3 border-b border-gray-150 flex items-center justify-between shadow-3xs">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#ff3f6c]" />
            <span className="text-xs font-black text-gray-800 uppercase tracking-wider">AI Bharat Feed Region:</span>
          </div>
          
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs font-black text-[#ff3f6c] border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-pink-50/50 shadow-3xs cursor-pointer"
          >
            <option value="Ghaziabad">Ghaziabad (UP)</option>
            <option value="Lucknow">Lucknow (Awadh)</option>
            <option value="Delhi">New Delhi (NCR)</option>
          </select>
        </div>

        {/* 2. Weather Adaptation Banner */}
        <div className="mx-3.5 mt-4 bg-white rounded-2xl border border-gray-150 p-4 shadow-sm text-left flex gap-3.5 items-start">
          <div className="p-2 bg-indigo-50/50 rounded-xl border border-indigo-100 shrink-0">
            {currentConfig.weatherIcon}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-black text-[#282c3f] tracking-wide">{currentConfig.weatherText}</h4>
            <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed">
              {currentConfig.weatherAdvice}
            </p>
          </div>
        </div>

        {/* 3. Regional Festival Theme Banner */}
        <div className="mx-3.5 mt-3.5 bg-gradient-to-r from-amber-500/20 to-orange-500/10 rounded-2xl border border-orange-200/50 p-4 text-left">
          <span className="text-[8px] bg-orange-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">Active Celebration</span>
          <h4 className="text-xs font-black text-orange-950 mt-1.5">{currentConfig.festivalText}</h4>
          <p className="text-[10.5px] text-orange-800/90 font-medium mt-1 leading-relaxed">
            Personalizing your catalog based on local seasonal requirements and festival category affinities!
          </p>
        </div>


        {/* 5. Genie Contextual Trigger Banner */}
        <div 
          onClick={handleGenieBannerClick}
          className="mx-3.5 mt-4 bg-white border border-gray-150 rounded-2xl p-4 shadow-sm text-left flex flex-col gap-2.5 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute right-0 top-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform"></div>
          
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#ff3f6c] animate-pulse" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Ask Genie Stylist</span>
          </div>

          <p className="text-xs font-black text-gray-805 leading-snug">
            "{selectedCity === "Ghaziabad" ? "Monsoon high-humidity days in Ghaziabad." : selectedCity === "Lucknow" ? "Sunny summer wedding season in Lucknow." : "Winter conference morning in Delhi."} Don't let weather ruin your vibe."
          </p>

          <button className="text-[10px] text-[#ff3f6c] font-black flex items-center gap-1 uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
            ✨ Ask Genie to Style an Outfit <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 6. City Trends & Category Boosts */}
        <div className="mx-3.5 mt-4 flex flex-col gap-3 text-left">
          <div className="flex justify-between items-baseline">
            <h3 className="text-xs font-black text-gray-805 uppercase tracking-wider">Local City Trends</h3>
            <span className="text-[9px] text-[#ff3f6c] font-black uppercase">Category Boost Active</span>
          </div>

          {/* Trending list items */}
          <div className="grid grid-cols-2 gap-3.5">
            {currentConfig.trendingItems.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-3xs flex flex-col"
              >
                <div className="h-32 bg-gray-50 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <span className="text-[8px] bg-pink-50 text-[#ff3f6c] px-1 rounded font-black uppercase">{item.category}</span>
                  <h5 className="font-extrabold text-[10.5px] text-gray-800 mt-1 truncate">{item.name}</h5>
                  <span className="text-xs font-black text-gray-700 mt-1.5 block">₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
