"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../Header";
import { DigitalTwin } from "../DigitalTwin";
import { useGenieStore, GenieItem, GenieParsedContext } from "../../store/genieStore";
import {
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  Send,
  Check,
  DollarSign,
  ChevronRight,
  ShoppingBag,
  Share2,
  X,
  Info,
  ArrowRight,
  Globe,
  Tag,
  Calendar,
  Bug,
  Upload,
  Camera,
  AlertCircle
} from "lucide-react";

interface BackendAlternative {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
}

export function GenieLegacyExperience() {
  const {
    canvasItems,
    lockedItems,
    maxBudget,
    activeSwapCategory,
    parsedContext,
    toggleLock,
    setSwapCategory,
    swapItem,
    getUsedBudget,
    setParsedContext,
    setMaxBudget,
    baseUserImage,
    setBaseUserImage,
    hasUploadedBaseImage,
    setHasUploadedBaseImage,
  } = useGenieStore();

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isGenieActive] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSizes, setSelectedSelectedSizes] = useState<Record<string, string>>({
    TOP: "S",
    BOTTOM: "S",
    FOOTWEAR: "6",
    ACCESSORY: "One Size",
  });

  // Live swap alternatives state
  const [swapAlternatives, setSwapAlternatives] = useState<Omit<GenieItem, "category">[]>([]);
  const [isSwapLoading, setIsSwapLoading] = useState(false);

  const usedBudget = getUsedBudget();
  const budgetPercentage = Math.min(100, (usedBudget / maxBudget) * 100);
  const isOverBudget = usedBudget > maxBudget;

  // Fetch live alternatives for the active swap slot from the backend
  const loadAlternatives = useCallback(
    async (slotCategory: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY") => {
      setIsSwapLoading(true);
      try {
        const currentOutfitIds = (Object.keys(canvasItems) as Array<keyof typeof canvasItems>)
          .filter((key) => key !== slotCategory)
          .map((key) => canvasItems[key]?.id)
          .filter((id): id is string => Boolean(id));

        const payload = {
          slot_category: slotCategory,
          current_outfit_ids: currentOutfitIds,
          max_budget: maxBudget,
          aesthetic_tags: parsedContext?.aestheticTags || [],
          excluded_colors: parsedContext?.excludedColors || [],
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://bitwizards.onrender.com"}/api/genie/curate/alternatives`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`Alternatives API failed: ${response.status}`);
        }

        const data: BackendAlternative[] = await response.json();
        const mappedAlternatives = data.map((alt) => ({
          id: alt.id,
          name: alt.name,
          price: alt.price,
          image: alt.image_url,
        }));

        setSwapAlternatives(mappedAlternatives);
      } catch (err) {
        console.error("Failed to load alternatives from backend:", err);
        setSwapAlternatives([]);
      } finally {
        setIsSwapLoading(false);
      }
    },
    [canvasItems, maxBudget, parsedContext]
  );

  // Reload alternatives whenever the active swap slot changes or relevant context updates
  useEffect(() => {
    if (activeSwapCategory) {
      loadAlternatives(activeSwapCategory);
    }
  }, [activeSwapCategory, loadAlternatives]);

  const handlePromptSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    let parsedOccasion = "Casual Wear";
    let parsedColor: string | null = null;
    let parsedBudget: number | null = null;
    let currentContext: GenieParsedContext | null = null;

    try {
      // Call live backend NLP parsing endpoint
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bitwizards.onrender.com";
      const response = await fetch(`${API_BASE_URL}/api/genie/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        parsedOccasion = data.occasion_category || data.occasion_raw || "Casual Wear";
        parsedColor = data.primary_color;
        parsedBudget = data.max_budget;

        currentContext = {
          query: data.query,
          detectedLanguage: data.detected_language,
          occasionRaw: data.occasion_raw,
          occasionCategory: data.occasion_category,
          primaryColor: data.primary_color,
          excludedColors: data.excluded_colors || [],
          aestheticTags: data.aesthetic_tags || [],
          excludedTags: data.excluded_tags || [],
          maxBudget: data.max_budget,
          isLocalPreferred: data.is_local_preferred,
          confidence: data.confidence,
          ambiguousFields: data.ambiguous_fields || [],
        };

        setParsedContext(currentContext);

        // Update budget tracker limit if budget is parsed
        if (data.max_budget) {
          setMaxBudget(data.max_budget);
        }
      } else {
        throw new Error("Failed to call backend parser");
      }
    } catch (err) {
      console.warn("Backend parsing failed, using high-fidelity client-side fallback parsing.", err);
      // Client-side fallback parsing
      const queryLower = prompt.toLowerCase();
      const fallbackContext: GenieParsedContext = {
        query: prompt,
        detectedLanguage: "English",
        occasionRaw: prompt,
        occasionCategory: "Casual Wear",
        primaryColor: null,
        excludedColors: [],
        aestheticTags: [],
        excludedTags: [],
        maxBudget: null,
        isLocalPreferred: false,
        confidence: "low",
        ambiguousFields: ["occasionCategory", "primaryColor"],
      };

      // Language detection
      if (["khatir", "badhiya", "dikha", "da", "bhaauji", "hamar", "खातिर", "बढ़िया", "खरीदे", "खाती", "दा", "हमार", "रउआ"].some(w => queryLower.includes(w))) {
        fallbackContext.detectedLanguage = "Bhojpuri";
      } else if (["naa", "kosam", "manchi", "battalu", "kavali"].some(w => queryLower.includes(w))) {
        fallbackContext.detectedLanguage = "Telugu";
      } else if (["bhai", "ki", "shaadi", "liye", "ek", "dum", "dikhao", "शादी", "भाई", "के", "लिए", "एक", "दम", "सस्ता", "दिखाओ", "सूट", "कुर्ता", "शेरवानी"].some(w => queryLower.includes(w))) {
        fallbackContext.detectedLanguage = "Hinglish";
      }

      // Occasion detection
      const occasionsMap: Record<string, string> = {
        shaadi: "Wedding", wedding: "Wedding", marriage: "Wedding", "शादी": "Wedding", "विवाह": "Wedding", "ब्याह": "Wedding", "दूल्हा": "Wedding",
        sangeet: "Sangeet", "संगीत": "Sangeet",
        haldi: "Haldi", "हल्दी": "Haldi",
        mehendi: "Mehendi", "मेहंदी": "Mehendi",
        fest: "College Fest", college: "College Fest",
        conference: "Tech Conference", office: "Office Wear", "ऑफिस": "Office Wear",
        party: "Party Wear", "पार्टी": "Party Wear",
        function: "Family Function", "फंक्शन": "Family Function",
        "सूट": "Wedding"
      };
      for (const [key, val] of Object.entries(occasionsMap)) {
        if (queryLower.includes(key)) {
          fallbackContext.occasionCategory = val;
          break;
        }
      }

      // Color detection
      const colorsMap: Record<string, string> = {
        black: "black", "काला": "black", "काले": "black",
        white: "white", "सफेद": "white", "उजला": "white",
        yellow: "yellow", "पीला": "yellow", "पीले": "yellow",
        red: "red", "लाल": "red",
        blue: "blue", "नीला": "blue", "नीले": "blue",
        pink: "pink", "गुलाबी": "pink",
        green: "green", "हरा": "green", "हरे": "green",
        gold: "gold", "सुनहरा": "gold", "गोल्डन": "gold",
        ivory: "ivory", "rose gold": "rose gold"
      };
      for (const [key, val] of Object.entries(colorsMap)) {
        if (queryLower.includes(key)) {
          fallbackContext.primaryColor = val;
          break;
        }
      }

      // Budget detection
      const budgetMatch = queryLower.match(/(?:under|below|budget\s*(?:of|:)?|rs\.?|in|₹|max|upto|कम|अंदर|तक|बजट|रुपये|रु\.?)\s*(\d+)\s*(k)?/);
      const budgetMatchHindi = queryLower.match(/(\d+)\s*(k)?\s*(?:से कम|के अंदर|तक|बजट|रुपये|रु|k)/);
      const finalMatch = budgetMatch || budgetMatchHindi;

      if (finalMatch) {
        let val = parseInt(finalMatch[1]);
        if (finalMatch[2]) val *= 1000;
        fallbackContext.maxBudget = val;
        setMaxBudget(val);
      } else if (queryLower.includes("5k")) {
        fallbackContext.maxBudget = 5000;
        setMaxBudget(5000);
      } else if (queryLower.includes("2k")) {
        fallbackContext.maxBudget = 2000;
        setMaxBudget(2000);
      }

      parsedOccasion = fallbackContext.occasionCategory || fallbackContext.occasionRaw || "Casual Wear";
      parsedColor = fallbackContext.primaryColor;
      parsedBudget = fallbackContext.maxBudget;

      currentContext = fallbackContext;
      setParsedContext(fallbackContext);
    } finally {
      try {
        // Build the locked-item list from the current canvas pins
        const lockedItemIds = Object.entries(lockedItems)
          .filter(([_, isLocked]) => isLocked)
          .map(([category]) => canvasItems[category as keyof typeof canvasItems]?.id)
          .filter(Boolean);

        // Call backend curation API to fetch budget-compliant outfit
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bitwizards.onrender.com";
        const curateResponse = await fetch(`${API_BASE_URL}/api/genie/curate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            occasion_category: currentContext?.occasionCategory || parsedOccasion,
            primary_color: currentContext?.primaryColor || parsedColor,
            excluded_colors: currentContext?.excludedColors || [],
            aesthetic_tags: currentContext?.aestheticTags || [],
            max_budget: currentContext?.maxBudget || parsedBudget || maxBudget,
            is_local_preferred: currentContext?.isLocalPreferred || false,
            locked_item_ids: lockedItemIds,
          }),
        });

        if (curateResponse.ok) {
          const curatedResult = await curateResponse.json();
          const curatedItems = curatedResult.outfit || [];

          // Surface local-boutique consent prompt if the backend returned one
          if (curatedResult.local_consent_prompt) {
            console.info("Local consent prompt:", curatedResult.local_consent_prompt);
          }

          curatedItems.forEach((item: any) => {
            const category = item.category as "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY";
            // Swap item only if it's not locked/pinned
            if (!lockedItems[category]) {
              swapItem(category, {
                id: item.id,
                category: category,
                name: item.name,
                price: item.price,
                image: item.image_url,
              });
            }
          });
        }
      } catch (curateErr) {
        console.warn("Curation API call failed, no client-side mock swap available.", curateErr);
      }

      setIsGenerating(false);
      setPrompt("");
    }
  };

  const handleShareLook = () => {
    // Generate a shareable URL with current state serialized
    const stateParams = new URLSearchParams();
    Object.entries(canvasItems).forEach(([cat, item]) => {
      if (item) {
        stateParams.set(cat.toLowerCase(), `${item.id}:${item.price}`);
      }
    });
    const shareUrl = `${window.location.origin}/genie?${stateParams.toString()}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handleLandingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setShowUploadModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBaseUserImage(reader.result);
        setShowUploadModal(false);
        // Automatically run curation query
        setTimeout(() => {
          handlePromptSubmit();
        }, 100);
      }
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-myntra-dark">
      {/* 1. Header */}
      <Header />

      {/* Main Content Area */}
      {isGenieActive && !hasUploadedBaseImage ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center text-center gap-8 animate-[fadeIn_0.3s_ease]">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-myntra-pink via-purple-600 to-indigo-600 bg-clip-text text-transparent pb-1">
              Try with Myntra!
            </h1>
            <p className="text-sm md:text-base text-myntra-light max-w-lg mx-auto font-bold leading-relaxed">
              Transform your shopping experience with the ultimate AI Stylist. 
              Describe what you want to wear, upload your photo, and see it on yourself instantly.
            </p>
          </div>

          <form onSubmit={handleLandingSubmit} className="w-full max-w-xl bg-white border border-myntra-border hover:border-myntra-pink/35 focus-within:border-myntra-pink/60 focus-within:ring-1 focus-within:ring-myntra-pink/30 rounded-2xl p-2 shadow-lg transition-all flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex-1 flex items-center bg-myntra-gray/60 rounded-xl px-3.5 py-2.5">
              <Sparkles className="text-myntra-pink mr-3 flex-shrink-0 animate-pulse w-5 h-5" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Ask Genie: "Formal winter dress under 4000" or "Sangeet outfit under 2k"...'
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-myntra-dark placeholder-myntra-light"
              />
            </div>
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="bg-myntra-pink text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl hover:bg-opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <Send size={14} />
              Style Me
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div className="flex flex-col gap-3.5 items-center">
            <span className="text-[10px] uppercase tracking-widest text-myntra-light font-extrabold">
              Popular Styles
            </span>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
              {[
                "Haldi outfit under 3000",
                "Cotton ethnic wear for office",
                "Wedding sherwani under 5k",
                "Smart-casual look for college fest"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="bg-myntra-gray/40 hover:bg-myntra-gray hover:border-myntra-pink/30 border border-myntra-border text-xs text-myntra-dark font-bold px-4 py-2 rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  ✨ {suggestion}
                </button>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6 animate-[fadeIn_0.3s_ease]">
          {/* 2. Budget Tracker (Top Bar) */}
          <div className="bg-white border border-myntra-border rounded-xl p-4 shadow-sm">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-2">
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
              <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-3 bg-myntra-gray rounded-full overflow-hidden border border-myntra-border">
                  <div
                    className={`h-full transition-all duration-500 ease-out rounded-full ${isOverBudget ? "bg-red-500" : "bg-myntra-pink"
                      }`}
                    style={{ width: `${budgetPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-myntra-light whitespace-nowrap">
                  {Math.round(budgetPercentage)}%
                </span>
              </div>

              <div className="flex items-center justify-between w-full gap-4">
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

          {/* 3. Interactive Stacked Canvas Layout */}
          <div className="flex flex-col gap-5 items-stretch">

            {/* Left Column: FOOTWEAR & ACCESSORY */}
            <div className="order-2 grid grid-cols-2 gap-3.5">
              {/* FOOTWEAR SLOT */}
              <div
                onClick={() => setSwapCategory("FOOTWEAR")}
                className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${activeSwapCategory === "FOOTWEAR"
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
                className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${activeSwapCategory === "ACCESSORY"
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

            {/* Center Column: Your Look / Digital Twin */}
            <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center bg-white border border-myntra-border rounded-xl p-4 sm:p-6 shadow-sm relative overflow-hidden">
              <div className="w-full flex justify-between items-center mb-4 z-10">
                <h3 className="text-sm sm:text-base font-bold text-myntra-dark">
                  Your Look
                </h3>
                <span className="text-[10px] sm:text-xs font-semibold text-myntra-light">
                  AI Virtual Try-On • IDM-VTON
                </span>
              </div>

              <DigitalTwin />
            </div>

            {/* Right Column: TOP & BOTTOM */}
            <div className="order-3 grid grid-cols-2 gap-3.5">
              {/* TOP SLOT */}
              <div
                onClick={() => setSwapCategory("TOP")}
                className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${activeSwapCategory === "TOP"
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
                className={`relative border rounded-xl p-3 sm:p-4 bg-white transition-all cursor-pointer flex flex-col justify-between h-[130px] sm:h-[170px] ${activeSwapCategory === "BOTTOM"
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
                  {isSwapLoading
                    ? `Loading ${activeSwapCategory.toLowerCase()} alternatives...`
                    : `${swapAlternatives.length} ${activeSwapCategory.toLowerCase()} swap${swapAlternatives.length === 1 ? "" : "s"} • within budget`}
                </h3>
                <span className="text-[10px] sm:text-xs text-myntra-light">
                  Active Category: <strong className="text-myntra-pink">{activeSwapCategory}</strong>
                </span>
              </div>

              {/* Horizontal Scroll on Mobile, Grid on Desktop */}
              <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-2 md:pb-0">
                {isSwapLoading ? (
                  <div className="col-span-3 flex items-center justify-center py-8 text-xs text-myntra-light">
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Finding the best alternatives for you...
                  </div>
                ) : swapAlternatives.length === 0 ? (
                  <div className="col-span-3 flex items-center justify-center py-8 text-xs text-myntra-light">
                    No alternatives available within the remaining budget.
                  </div>
                ) : (
                  swapAlternatives.map((alt) => {
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
                        className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all min-w-[260px] md:min-w-0 snap-start shrink-0 md:shrink ${isActive
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
                  })
                )}
              </div>
            </div>
          )}

          {/* Real-time AI Understanding Panel */}
          {parsedContext && (
            <div className="flex flex-col gap-4">
              {parsedContext.confidence === "low" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    We're having trouble catching all the details. We've found some general results for you.
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-pink-50/30 to-purple-50/30 border border-pink-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xs font-bold text-myntra-pink uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={14} className="animate-pulse" />
                    Genie Real-time AI Understanding
                  </h4>
                  <button
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-[10px] font-bold text-myntra-light hover:text-myntra-pink flex items-center gap-1 transition-colors cursor-pointer"
                    title="Toggle Debug Info"
                  >
                    {showDebugInfo ? <X size={12} /> : <Bug size={12} />}
                    {showDebugInfo ? "Hide Debug" : "Debug Info"}
                  </button>
                </div>

                {showDebugInfo && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs font-mono text-slate-700 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">detected_language:</span>
                      <span className="font-semibold text-slate-800">{parsedContext.detectedLanguage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold">confidence:</span>
                      <span className={`font-semibold capitalize ${parsedContext.confidence === "high" ? "text-emerald-600" :
                          parsedContext.confidence === "medium" ? "text-amber-600" : "text-red-600"
                        }`}>
                        {parsedContext.confidence}
                      </span>
                    </div>
                    {parsedContext.ambiguousFields.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">ambiguous_fields:</span>
                        <span className="font-semibold text-slate-800">[{parsedContext.ambiguousFields.join(", ")}]</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 bg-white border border-myntra-border px-3 py-1.5 rounded-lg text-xs font-semibold text-myntra-dark shadow-sm">
                    <Calendar size={13} className="text-myntra-pink" />
                    <span>Occasion: <strong>{parsedContext.occasionCategory || parsedContext.occasionRaw || "Casual Wear"}</strong></span>
                  </div>
                  {parsedContext.primaryColor && (
                    <div className="flex items-center gap-1.5 bg-white border border-myntra-border px-3 py-1.5 rounded-lg text-xs font-semibold text-myntra-dark shadow-sm">
                      <Tag size={13} className="text-myntra-pink" />
                      <span>Color: <strong className="capitalize">{parsedContext.primaryColor}</strong></span>
                    </div>
                  )}
                  {parsedContext.maxBudget && (
                    <div className="flex items-center gap-1.5 bg-white border border-myntra-border px-3 py-1.5 rounded-lg text-xs font-semibold text-myntra-dark shadow-sm">
                      <DollarSign size={13} className="text-myntra-pink" />
                      <span>Budget Limit: <strong>₹{parsedContext.maxBudget.toLocaleString()}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-white border border-myntra-border px-3 py-1.5 rounded-lg text-xs font-semibold text-myntra-dark shadow-sm">
                    <Globe size={13} className="text-myntra-pink" />
                    <span>Language: <strong>{parsedContext.detectedLanguage}</strong></span>
                  </div>
                  {parsedContext.isLocalPreferred && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 shadow-sm animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Local Stores Preferred</span>
                    </div>
                  )}
                  {parsedContext.aestheticTags && parsedContext.aestheticTags.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-pink-50/50 border border-pink-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-myntra-dark shadow-sm">
                      <Sparkles size={13} className="text-myntra-pink" />
                      <span>Aesthetics: <strong>{parsedContext.aestheticTags.join(", ")}</strong></span>
                    </div>
                  )}
                  {parsedContext.excludedColors && parsedContext.excludedColors.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-50/50 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-800 shadow-sm">
                      <X size={13} className="text-red-500" />
                      <span>Excluding Colors: <strong className="capitalize">{parsedContext.excludedColors.join(", ")}</strong></span>
                    </div>
                  )}
                  {parsedContext.excludedTags && parsedContext.excludedTags.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-50/50 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-800 shadow-sm">
                      <X size={13} className="text-red-500" />
                      <span>Excluding Styles: <strong className="capitalize">{parsedContext.excludedTags.join(", ")}</strong></span>
                    </div>
                  )}
                </div>
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
                  placeholder='Try: "Bhai ki shaadi ke liye black sherwani ya kurta set, price max 5k."'
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
      )}

      {/* Unified Checkout Modal */}
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

      {/* 9. Sleek Backdrop-Blur Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-myntra-border flex flex-col gap-6 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center pb-2 border-b border-myntra-border">
              <h3 className="text-base font-extrabold text-myntra-dark flex items-center gap-2">
                <Camera size={18} className="text-myntra-pink" />
                Upload Base Photo
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-myntra-light hover:text-myntra-dark p-1 rounded-full hover:bg-myntra-gray transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Guidelines Box */}
            <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4 flex flex-col gap-3 text-left">
              <span className="text-[11px] font-black text-myntra-pink uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={11} className="animate-spin-slow" />
                Image Requirements
              </span>
              <ul className="text-xs text-myntra-dark/80 font-bold space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-myntra-pink shrink-0" />
                  Full Body (showing head-to-toe or upper body clearly)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-myntra-pink shrink-0" />
                  Good lighting (avoid dark shadows or backlighting)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-myntra-pink shrink-0" />
                  Just You (no multiple people in the picture)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-myntra-pink shrink-0" />
                  Clear Image (not blurry or pixelated)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-myntra-pink shrink-0" />
                  Fitted Clothes (for the best virtual fitting results)
                </li>
              </ul>
            </div>

            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-myntra-border hover:border-myntra-pink/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 bg-myntra-gray/20 hover:bg-pink-50/10 cursor-pointer transition-all text-center"
            >
              <Upload size={28} className="text-myntra-pink animate-bounce" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-myntra-dark">
                  Click to upload base image
                </span>
                <span className="text-[10px] text-myntra-light font-semibold">
                  Supports JPEG, PNG, WEBP (Max 5MB)
                </span>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 border border-myntra-border hover:bg-myntra-gray text-myntra-dark font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
