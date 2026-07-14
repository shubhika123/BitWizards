"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import { DigitalTwin } from "../../components/DigitalTwin";
import { useGenieStore, GenieItem } from "../../store/genieStore";
import { 
  Lock, 
  Unlock, 
  RefreshCw, 
  Sparkles, 
  Send, 
  Check, 
  DollarSign, 
  Sliders, 
  ChevronRight, 
  ShoppingBag, 
  Share2,
  X,
  Info,
  ArrowRight
} from "lucide-react";

// Mock alternatives database for interactive swaps
const ALTERNATIVES_MOCK: Record<string, Omit<GenieItem, "category">[]> = {
  TOP: [
    { id: "top_alt_1", name: "Sabyasachi Kurti", price: 2490, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" },
    { id: "top_alt_2", name: "Biba Cotton Top", price: 1290, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80" },
    { id: "top_alt_3", name: "Libas Printed Kurta", price: 1590, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80" },
  ],
  BOTTOM: [
    { id: "bottom_alt_1", name: "Aurelia Salwar", price: 790, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80" },
    { id: "bottom_alt_2", name: "Global Desi Skirt", price: 1190, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" },
    { id: "bottom_alt_3", name: "Biba Leggings", price: 690, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80" },
  ],
  FOOTWEAR: [
    { id: "footwear_alt_1", name: "Block flats", price: 750, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80" },
    { id: "footwear_alt_2", name: "Mules", price: 920, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80" },
    { id: "footwear_alt_3", name: "Sandals", price: 680, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80" },
  ],
  ACCESSORY: [
    { id: "accessory_alt_1", name: "Daniel Wellington", price: 1250, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80" },
    { id: "accessory_alt_2", name: "Titan Raga", price: 950, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80" },
    { id: "accessory_alt_3", name: "Fastrack Analog", price: 550, image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80" },
  ],
};

export default function GeniePage() {
  const {
    canvasItems,
    lockedItems,
    maxBudget,
    dummySettings,
    activeSwapCategory,
    toggleLock,
    setSwapCategory,
    swapItem,
    updateDummy,
    getUsedBudget,
  } = useGenieStore();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [selectedSizes, setSelectedSelectedSizes] = useState<Record<string, string>>({
    TOP: "S",
    BOTTOM: "S",
    FOOTWEAR: "6",
    ACCESSORY: "One Size",
  });

  // Local state for dummy editing
  const [tempHeight, setTempHeight] = useState(dummySettings.height);
  const [tempWeight, setTempWeight] = useState(dummySettings.weight);
  const [tempSize, setTempSize] = useState(dummySettings.size);

  const usedBudget = getUsedBudget();
  const budgetPercentage = Math.min(100, (usedBudget / maxBudget) * 100);
  const isOverBudget = usedBudget > maxBudget;

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    // Simulate AI generation / styling
    setTimeout(() => {
      setIsGenerating(false);
      setPrompt("");
      
      // Randomly swap one unlocked category to simulate AI styling
      const unlockedCategories = (Object.keys(canvasItems) as Array<keyof typeof canvasItems>).filter(
        (cat) => !lockedItems[cat]
      );
      
      if (unlockedCategories.length > 0) {
        const randomCat = unlockedCategories[Math.floor(Math.random() * unlockedCategories.length)] as "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY";
        const alternatives = ALTERNATIVES_MOCK[randomCat];
        const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
        
        swapItem(randomCat, {
          id: randomAlt.id,
          category: randomCat,
          name: randomAlt.name,
          price: randomAlt.price,
          image: randomAlt.image,
        });
      }
    }, 1500);
  };

  const handleSaveDummy = () => {
    updateDummy({
      height: tempHeight,
      weight: tempWeight,
      size: tempSize,
    });
    setShowDummyModal(false);
  };

  const handleShareLook = () => {
    // Generate a shareable URL with current state serialized
    const stateParams = new URLSearchParams();
    Object.entries(canvasItems).forEach(([cat, item]) => {
      stateParams.set(cat.toLowerCase(), `${item.id}:${item.price}`);
    });
    const shareUrl = `${window.location.origin}/genie?${stateParams.toString()}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-myntra-dark">
      {/* 1. Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        
        {/* 2. Budget Tracker (Top Bar) */}
        <div className="bg-white border border-myntra-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between md:justify-start gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-myntra-pink animate-pulse" />
                <span className="text-sm font-semibold text-myntra-dark">
                  Budget Tracker
                </span>
              </div>
              <span className="text-xs text-myntra-light bg-myntra-gray px-2 py-0.5 rounded-full">
                ₹{usedBudget.toLocaleString()} of ₹{maxBudget.toLocaleString()} used
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full md:flex-1 md:max-w-xl flex items-center gap-3">
              <div className="flex-1 h-3 bg-myntra-gray rounded-full overflow-hidden border border-myntra-border">
                <div 
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    isOverBudget ? "bg-red-500" : "bg-myntra-pink"
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-myntra-light whitespace-nowrap">
                {Math.round(budgetPercentage)}%
              </span>
            </div>

            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
              <span className={`text-sm font-bold ${isOverBudget ? "text-red-500" : "text-emerald-600"}`}>
                {isOverBudget 
                  ? `₹${(usedBudget - maxBudget).toLocaleString()} Over` 
                  : `₹${(maxBudget - usedBudget).toLocaleString()} Left`
                }
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowCheckoutModal(true)}
                  className="bg-myntra-pink text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  Checkout Look
                </button>
                <button 
                  onClick={handleShareLook}
                  className="border border-myntra-border text-myntra-light hover:bg-myntra-gray p-2.5 rounded-lg transition-all cursor-pointer"
                  title="Share Look"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Interactive 3-Column Canvas Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: FOOTWEAR & ACCESSORY */}
          <div className="order-2 lg:order-1 lg:col-span-3 grid grid-cols-2 lg:flex lg:flex-col gap-4">
            {/* FOOTWEAR SLOT */}
            <div 
              onClick={() => setSwapCategory("FOOTWEAR")}
              className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${
                activeSwapCategory === "FOOTWEAR" 
                  ? "border-myntra-pink ring-1 ring-myntra-pink shadow-md" 
                  : "border-myntra-border hover:border-myntra-light shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] sm:text-xs font-bold text-myntra-light tracking-wider uppercase">
                  Footwear
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  <span className="bg-myntra-pink text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock("FOOTWEAR");
                    }}
                    className="text-myntra-light hover:text-myntra-pink transition-colors cursor-pointer"
                  >
                    {lockedItems.FOOTWEAR ? <Lock size={12} className="sm:w-3.5 sm:h-3.5 text-myntra-pink" /> : <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 my-1 sm:my-2">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-myntra-gray rounded-lg overflow-hidden flex items-center justify-center border border-myntra-border shrink-0">
                  <img 
                    src={canvasItems.FOOTWEAR.image} 
                    alt={canvasItems.FOOTWEAR.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-myntra-dark line-clamp-1">
                    {canvasItems.FOOTWEAR.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-myntra-light">
                    ₹{canvasItems.FOOTWEAR.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[8px] sm:text-[10px] text-myntra-pink font-bold flex items-center justify-end gap-0.5 sm:gap-1">
                  <RefreshCw size={8} className="sm:w-2.5 sm:h-2.5" /> Click to Swap
                </span>
              </div>
            </div>

            {/* ACCESSORY SLOT */}
            <div 
              onClick={() => setSwapCategory("ACCESSORY")}
              className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${
                activeSwapCategory === "ACCESSORY" 
                  ? "border-myntra-pink ring-1 ring-myntra-pink shadow-md" 
                  : "border-myntra-border hover:border-myntra-light shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] sm:text-xs font-bold text-myntra-light tracking-wider uppercase">
                  Accessory
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  {lockedItems.ACCESSORY && (
                    <span className="bg-teal-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                      Locked
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock("ACCESSORY");
                    }}
                    className="text-myntra-light hover:text-myntra-pink transition-colors cursor-pointer"
                  >
                    {lockedItems.ACCESSORY ? <Lock size={12} className="sm:w-3.5 sm:h-3.5 text-teal-500" /> : <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 my-1 sm:my-2">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-myntra-gray rounded-lg overflow-hidden flex items-center justify-center border border-myntra-border shrink-0">
                  <img 
                    src={canvasItems.ACCESSORY.image} 
                    alt={canvasItems.ACCESSORY.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-myntra-dark line-clamp-1">
                    {canvasItems.ACCESSORY.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-myntra-light">
                    ₹{canvasItems.ACCESSORY.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[8px] sm:text-[10px] text-myntra-light font-bold flex items-center justify-end gap-0.5 sm:gap-1">
                  {lockedItems.ACCESSORY ? "Pinned" : "Click to Swap"}
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Your Look / Dummy */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center bg-white border border-myntra-border rounded-xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
            <div className="w-full flex justify-between items-center mb-4 z-10">
              <h3 className="text-sm sm:text-base font-bold text-myntra-dark">
                Your Look
              </h3>
              <button 
                onClick={() => {
                  setTempHeight(dummySettings.height);
                  setTempWeight(dummySettings.weight);
                  setTempSize(dummySettings.size);
                  setShowDummyModal(true);
                }}
                className="border border-myntra-pink text-myntra-pink hover:bg-pink-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sliders size={12} />
                Edit dummy
              </button>
            </div>

            {/* SVG Mannequin */}
            <DigitalTwin 
              height={dummySettings.height}
              weight={dummySettings.weight}
              size={dummySettings.size}
              activeCategory={activeSwapCategory}
            />
          </div>

          {/* Right Column: TOP & BOTTOM */}
          <div className="order-3 lg:order-3 lg:col-span-3 grid grid-cols-2 lg:flex lg:flex-col gap-4">
            {/* TOP SLOT */}
            <div 
              onClick={() => setSwapCategory("TOP")}
              className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${
                activeSwapCategory === "TOP" 
                  ? "border-myntra-pink ring-1 ring-myntra-pink shadow-md" 
                  : "border-myntra-border hover:border-myntra-light shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] sm:text-xs font-bold text-myntra-light tracking-wider uppercase">
                  Topwear
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  {lockedItems.TOP && (
                    <span className="bg-teal-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                      Locked
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock("TOP");
                    }}
                    className="text-myntra-light hover:text-myntra-pink transition-colors cursor-pointer"
                  >
                    {lockedItems.TOP ? <Lock size={12} className="sm:w-3.5 sm:h-3.5 text-teal-500" /> : <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 my-1 sm:my-2">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-myntra-gray rounded-lg overflow-hidden flex items-center justify-center border border-myntra-border shrink-0">
                  <img 
                    src={canvasItems.TOP.image} 
                    alt={canvasItems.TOP.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-myntra-dark line-clamp-1">
                    {canvasItems.TOP.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-myntra-light">
                    ₹{canvasItems.TOP.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[8px] sm:text-[10px] text-myntra-light font-bold flex items-center justify-end gap-0.5 sm:gap-1">
                  {lockedItems.TOP ? "Pinned" : "Click to Swap"}
                </span>
              </div>
            </div>

            {/* BOTTOM SLOT */}
            <div 
              onClick={() => setSwapCategory("BOTTOM")}
              className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${
                activeSwapCategory === "BOTTOM" 
                  ? "border-myntra-pink ring-1 ring-myntra-pink shadow-md" 
                  : "border-myntra-border hover:border-myntra-light shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] sm:text-xs font-bold text-myntra-light tracking-wider uppercase">
                  Bottomwear
                </span>
                <div className="flex gap-1.5 sm:gap-2">
                  {lockedItems.BOTTOM && (
                    <span className="bg-teal-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase">
                      Locked
                    </span>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock("BOTTOM");
                    }}
                    className="text-myntra-light hover:text-myntra-pink transition-colors cursor-pointer"
                  >
                    {lockedItems.BOTTOM ? <Lock size={12} className="sm:w-3.5 sm:h-3.5 text-teal-500" /> : <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 my-1 sm:my-2">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-myntra-gray rounded-lg overflow-hidden flex items-center justify-center border border-myntra-border shrink-0">
                  <img 
                    src={canvasItems.BOTTOM.image} 
                    alt={canvasItems.BOTTOM.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-myntra-dark line-clamp-1">
                    {canvasItems.BOTTOM.name}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-myntra-light">
                    ₹{canvasItems.BOTTOM.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[8px] sm:text-[10px] text-myntra-light font-bold flex items-center justify-end gap-0.5 sm:gap-1">
                  {lockedItems.BOTTOM ? "Pinned" : "Click to Swap"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Alternatives Row (Middle Section) */}
        {activeSwapCategory && (
          <div className="bg-white border border-myntra-border rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs sm:text-sm font-bold text-myntra-dark flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-4 bg-myntra-pink rounded-full" />
                {ALTERNATIVES_MOCK[activeSwapCategory]?.length || 0} {activeSwapCategory.toLowerCase()} swaps • within budget
              </h3>
              <span className="text-[10px] sm:text-xs text-myntra-light">
                Active Category: <strong className="text-myntra-pink">{activeSwapCategory}</strong>
              </span>
            </div>

            {/* Horizontal Scroll on Mobile, Grid on Desktop */}
            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-2 md:pb-0">
              {ALTERNATIVES_MOCK[activeSwapCategory]?.map((alt) => {
                const isActive = canvasItems[activeSwapCategory]?.id === alt.id;
                return (
                  <div 
                    key={alt.id}
                    onClick={() => swapItem(activeSwapCategory, {
                      id: alt.id,
                      category: activeSwapCategory,
                      name: alt.name,
                      price: alt.price,
                      image: alt.image,
                    })}
                    className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all min-w-[260px] md:min-w-0 snap-start shrink-0 md:shrink ${
                      isActive 
                        ? "border-myntra-pink bg-pink-50/30 ring-1 ring-myntra-pink shadow-sm" 
                        : "border-myntra-border hover:border-myntra-light hover:bg-myntra-gray/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-myntra-gray rounded-lg overflow-hidden flex items-center justify-center border border-myntra-border shrink-0">
                        <img 
                          src={alt.image} 
                          alt={alt.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-myntra-dark">
                          {alt.name}
                        </h4>
                        <p className="text-[11px] text-myntra-light">
                          ₹{alt.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isActive ? (
                        <span className="w-5 h-5 rounded-full bg-myntra-pink text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-myntra-pink border border-myntra-pink px-2.5 py-1 rounded-md hover:bg-myntra-pink hover:text-white transition-all">
                          Swap
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. AI Prompt Bar (Bottom Section - Sticky on Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-myntra-border z-40 md:relative md:p-4 md:border md:rounded-xl shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:shadow-sm">
          <form onSubmit={handlePromptSubmit} className="flex gap-2 sm:gap-3 items-center max-w-7xl mx-auto">
            <div className="flex-1 relative flex items-center bg-myntra-gray border border-myntra-border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-myntra-light transition-all">
              <Sparkles className="text-myntra-pink mr-2 sm:mr-3 flex-shrink-0 animate-pulse w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Try: "Make it darker, pin the kurta..."'
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-myntra-dark placeholder-myntra-light"
                disabled={isGenerating}
              />
            </div>
            <button 
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="bg-myntra-pink text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Styling...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Style Me
                </>
              )}
            </button>
          </form>
        </div>

        {/* Spacer for sticky bottom bar on mobile */}
        <div className="h-20 md:hidden" />

      </main>

      {/* 6. Edit Dummy Modal */}
      {showDummyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-myntra-border animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-myntra-dark flex items-center gap-2">
                <Sliders size={20} className="text-myntra-pink" />
                Edit Your Dummy
              </h3>
              <button 
                onClick={() => setShowDummyModal(false)}
                className="text-myntra-light hover:text-myntra-dark p-1 rounded-full hover:bg-myntra-gray transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Height Slider */}
              <div>
                <div className="flex justify-between text-sm font-bold text-myntra-dark mb-2">
                  <span>Height</span>
                  <span className="text-myntra-pink">{tempHeight} cm</span>
                </div>
                <input 
                  type="range" 
                  min="140" 
                  max="200" 
                  value={tempHeight}
                  onChange={(e) => setTempHeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-myntra-gray rounded-lg appearance-none cursor-pointer accent-myntra-pink"
                />
                <div className="flex justify-between text-[10px] text-myntra-light mt-1">
                  <span>140 cm</span>
                  <span>200 cm</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div>
                <div className="flex justify-between text-sm font-bold text-myntra-dark mb-2">
                  <span>Weight</span>
                  <span className="text-myntra-pink">{tempWeight} kg</span>
                </div>
                <input 
                  type="range" 
                  min="40" 
                  max="120" 
                  value={tempWeight}
                  onChange={(e) => setTempWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-myntra-gray rounded-lg appearance-none cursor-pointer accent-myntra-pink"
                />
                <div className="flex justify-between text-[10px] text-myntra-light mt-1">
                  <span>40 kg</span>
                  <span>120 kg</span>
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-sm font-bold text-myntra-dark mb-2">
                  Standard Size
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setTempSize(sz)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        tempSize === sz 
                          ? "border-myntra-pink bg-pink-50 text-myntra-pink" 
                          : "border-myntra-border hover:border-myntra-light text-myntra-dark"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowDummyModal(false)}
                className="flex-1 border border-myntra-border text-myntra-dark hover:bg-myntra-gray font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveDummy}
                className="flex-1 bg-myntra-pink text-white hover:bg-opacity-90 font-bold py-2.5 rounded-xl transition-all text-sm shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Unified Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-myntra-border animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-myntra-dark flex items-center gap-2">
                <ShoppingBag size={20} className="text-myntra-pink" />
                Unified Checkout Look
              </h3>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-myntra-light hover:text-myntra-dark p-1 rounded-full hover:bg-myntra-gray transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl flex items-center gap-2.5 text-xs text-myntra-pink">
                <Info size={16} />
                <span>Select sizes for all items to proceed with a single-click checkout.</span>
              </div>

              {/* Items List with Size Selectors */}
              <div className="divide-y divide-myntra-border max-h-[280px] overflow-y-auto pr-1">
                {Object.entries(canvasItems).map(([category, item]) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-myntra-gray rounded-lg overflow-hidden flex items-center justify-center border border-myntra-border flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-myntra-dark line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-myntra-light">
                          ₹{item.price.toLocaleString()} • <span className="uppercase">{category}</span>
                        </p>
                      </div>
                    </div>

                    {/* Size Selector dropdown */}
                    <select
                      value={selectedSizes[category] || ""}
                      onChange={(e) => setSelectedSelectedSizes({
                        ...selectedSizes,
                        [category]: e.target.value,
                      })}
                      className="bg-myntra-gray border border-myntra-border text-xs font-bold text-myntra-dark rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-myntra-light cursor-pointer"
                    >
                      {category === "FOOTWEAR" ? (
                        ["5", "6", "7", "8", "9", "10"].map((sz) => (
                          <option key={sz} value={sz}>UK {sz}</option>
                        ))
                      ) : category === "ACCESSORY" ? (
                        <option value="One Size">One Size</option>
                      ) : (
                        ["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                          <option key={sz} value={sz}>Size {sz}</option>
                        ))
                      )}
                    </select>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-myntra-border pt-4 space-y-2">
                <div className="flex justify-between text-xs text-myntra-light">
                  <span>Total Items ({Object.keys(canvasItems).length})</span>
                  <span>₹{usedBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-myntra-light">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-myntra-dark border-t border-myntra-border pt-2">
                  <span>Total Amount</span>
                  <span className="text-myntra-pink">₹{usedBudget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 border border-myntra-border text-myntra-dark hover:bg-myntra-gray font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Order Placed Successfully! Your curated outfit is on its way.");
                  setShowCheckoutModal(false);
                }}
                className="flex-1 bg-myntra-pink text-white hover:bg-opacity-90 font-bold py-2.5 rounded-xl transition-all text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Place Order <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Share Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-myntra-dark text-white text-xs font-bold px-4 py-3 rounded-xl shadow-lg border border-gray-700 flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
          <span className="w-2 h-2 rounded-full bg-myntra-pink animate-ping" />
          <span>Shareable Look URL copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
