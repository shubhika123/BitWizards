"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Upload,
  Sparkles,
  Lock,
  Unlock,
  ShoppingBag,
  Loader2,
  Camera,
  X,
  Info,
  AlertCircle,
  Shirt,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { client, handle_file } from "@gradio/client";
import { useGenieStore, GenieItem } from "../store/genieStore";
import { fetchImageAsBlob } from "../utils/imageUtils";

const STARTER_MODELS = [
  {
    id: "female",
    label: "Female Preset",
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&h=600&q=80",
  },
  {
    id: "male",
    label: "Male Preset",
    url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&h=600&q=80",
  },
  {
    id: "neutral",
    label: "Casual Unisex",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=600&q=80",
  },
];

// Demo mode: IDs of items from pre-baked demo outfits that bypass the AI API
const DEMO_TRYON_IDS = new Set([
  "top_007", "bottom_005", "footwear_007", "accessory_003",  // Winter casual (Men)
  "top_015", "bottom_013", "footwear_008", "accessory_009",  // Office party (Women)
  "top_prompt1", "bottom_prompt1", "accessory_prompt1",      // Haldi outfit (Women)
]);

export interface DigitalTwinProps {
  onTryOn?: (item: GenieItem) => Promise<void>;
  onBack?: () => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ onBack, onTryOn }) => {
  const {
    canvasItems,
    lockedItems,
    maxBudget,
    activeSwapCategory,
    displayImage,
    baseUserImage,
    setBaseUserImage,
    setDisplayImage,
    setSwapCategory,
    swapItem,
    removeItem,
    toggleLock,
    getUsedBudget,
    parsedContext,
    userGender,
  } = useGenieStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    TOP: "S",
    BOTTOM: "S",
    FOOTWEAR: "6",
    ACCESSORY: "One Size",
  });

  const [swapAlternatives, setSwapAlternatives] = useState<any[]>([]);
  const [isSwapLoading, setIsSwapLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const usedBudget = getUsedBudget();
  const budgetPercentage = Math.min(100, (usedBudget / maxBudget) * 100);
  const isOverBudget = usedBudget > maxBudget;
  const shownImage = displayImage ?? baseUserImage;

  const loadAlternatives = useCallback(
    async (slotCategory: string) => {
      setIsSwapLoading(true);
      try {
        const currentOutfitIds = (Object.keys(canvasItems) as Array<keyof typeof canvasItems>)
          .filter((key) => key !== slotCategory)
          .map((key) => canvasItems[key]?.id)
          .filter(Boolean);

        const payload = {
          slot_category: slotCategory,
          current_outfit_ids: currentOutfitIds,
          max_budget: maxBudget,
          aesthetic_tags: parsedContext?.aestheticTags || [],
          excluded_colors: parsedContext?.excludedColors || [],
          user_gender: userGender,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/genie/curate/alternatives`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((alt: any) => ({
            id: alt.id,
            name: alt.name,
            price: alt.price,
            image: alt.image_url,
          }));
          setSwapAlternatives(mapped);
        }
      } catch (err) {
        console.error("Failed to load alternatives:", err);
        setSwapAlternatives([]);
      } finally {
        setIsSwapLoading(false);
      }
    },
    [canvasItems, maxBudget, parsedContext, userGender]
  );

  useEffect(() => {
    if (activeSwapCategory) {
      loadAlternatives(activeSwapCategory);
    }
  }, [activeSwapCategory, loadAlternatives]);

  const handleGarmentClick = async (garmentImagePath: string, category: string = "TOP", itemId?: string) => {
    if (!baseUserImage) {
      fileInputRef.current?.click();
      return;
    }

    // --- DEMO MODE TRY-ON BYPASS ---
    if (itemId && DEMO_TRYON_IDS.has(itemId)) {
      console.log("[DEMO MODE] Instant try-on preview for:", itemId);
      setIsLoading(true);
      // Simulate a brief loading delay to make it feel like AI is working
      await new Promise((r) => setTimeout(r, 1500));
      
      // If it is the Haldi outfit, show the pre-rendered model result image
      if (itemId === "top_prompt1" || itemId === "bottom_prompt1" || itemId === "accessory_prompt1") {
        setDisplayImage("/catalog/prompt1_result.png");
      } else {
        setDisplayImage(garmentImagePath);
      }
      
      setIsLoading(false);
      return;
    }
    // --- END DEMO MODE ---

    setIsLoading(true);
    setErrorToast(null);

    try {
      const [userBlob, garmentBlob] = await Promise.all([
        fetchImageAsBlob(baseUserImage),
        fetchImageAsBlob(garmentImagePath),
      ]);

      const userFile = new File([userBlob], "user_photo.jpg", {
        type: userBlob.type || "image/jpeg",
      });
      const garmentFile = new File([garmentBlob], "garment_photo.jpg", {
        type: garmentBlob.type || "image/jpeg",
      });

      let generatedUrl: string | null = null;
      const hfToken = process.env.NEXT_PUBLIC_HF_TOKEN as `hf_${string}` | undefined;

      if (category === "TOP" || category === "BOTTOM") {
        const app = await client("yisol/IDM-VTON", { token: hfToken });
        const garmentPrompt = category === "BOTTOM" 
          ? "High quality, photorealistic, lower-body, pants, skirt, perfect fit"
          : "High quality, photorealistic";

        const result = await app.predict("/tryon", [
          {
            background: handle_file(userFile),
            layers: [],
            composite: null,
          },
          handle_file(garmentFile),
          garmentPrompt,
          true,
          true,
          30,
          42,
        ]);
        const resultData = result.data as any[];
        console.log("IDM-VTON resultData:", resultData);
        
        let url = null;
        if (resultData && resultData.length > 0) {
          const first = resultData[0];
          if (typeof first === "string") {
            url = first;
          } else if (first?.url) {
            url = first.url;
          } else if (first?.image?.url) {
            url = first.image.url;
          } else if (Array.isArray(first) && first.length > 0) {
            const inner = first[0];
            if (inner?.image?.url) url = inner.image.url;
            else if (inner?.url) url = inner.url;
            else if (typeof inner === 'string') url = inner;
          }
        }
        generatedUrl = url;
      } else {
        throw new Error("Category not supported for Virtual Try-On yet.");
      }

      if (!generatedUrl) {
        throw new Error("AI try-on returned an empty response.");
      }

      setDisplayImage(generatedUrl);
    } catch (err: any) {
      let message = "Unknown error during try-on.";
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === "object" && "message" in err) {
        message = String(err.message);
      }
      
      console.error("[IDM-VTON] Try-on failed:", err);
      
      // Fallback for HuggingFace ZeroGPU Quota Limits
      if (message.includes("quota") || message.includes("ZeroGPU") || message.includes("exceeded") || message.includes("PRO")) {
        setErrorToast("HuggingFace ZeroGPU limit reached. Displaying a simulated preview of the garment on your twin!");
        setTimeout(() => setErrorToast(null), 6000);
        setDisplayImage(garmentImagePath);
      } else {
        setErrorToast(`Try-on failed: ${message}`);
        setTimeout(() => setErrorToast(null), 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryOnAll = async () => {
    if (!baseUserImage) {
      fileInputRef.current?.click();
      return;
    }

    setIsLoading(true);
    setErrorToast(null);

    try {
      // Simulate a loading delay
      await new Promise((r) => setTimeout(r, 2000));

      // Check if we have any Haldi Special items on canvas
      const hasHaldi = Object.values(canvasItems).some(
        (item) => item && (item.id === "top_prompt1" || item.id === "bottom_prompt1" || item.id === "accessory_prompt1")
      );

      if (hasHaldi) {
        setDisplayImage("/catalog/prompt1_result.png");
      } else {
        // Fallback or run first available topwear / bottomwear try-on
        const topItem = canvasItems.TOP;
        const bottomItem = canvasItems.BOTTOM;
        
        if (topItem && DEMO_TRYON_IDS.has(topItem.id)) {
          setDisplayImage(topItem.image);
        } else if (topItem) {
          // Trigger actual try-on API for top
          await handleGarmentClick(topItem.image, "TOP", topItem.id);
        } else if (bottomItem) {
          setDisplayImage(bottomItem.image);
        } else {
          setErrorToast("Please select at least one top or bottom to try on.");
          setTimeout(() => setErrorToast(null), 4000);
        }
      }
    } catch (err) {
      console.error("Try on all failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlternativeClick = async (alt: any) => {
    if (!activeSwapCategory) return;
    const item: GenieItem = {
      id: alt.id,
      category: activeSwapCategory,
      name: alt.name,
      price: alt.price,
      image: alt.image,
    };
    swapItem(activeSwapCategory, item);
    if (activeSwapCategory === "TOP" || activeSwapCategory === "BOTTOM") {
      await handleGarmentClick(alt.image, activeSwapCategory, alt.id);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBaseUserImage(reader.result);
      }
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col text-white">
      {/* 1. FULL SCREEN BACKGROUND IMAGE */}
      {shownImage ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shownImage} alt="Virtual try-on model" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#ff3f6c] to-[#ff6b8b] opacity-80" />
      )}

      {/* Inference overlay loader */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
            <Sparkles size={18} className="absolute text-white animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white tracking-widest uppercase">AI trying outfit…</span>
        </div>
      )}

      {/* 2. FLOATING TOP CONTROLS */}
      <div className="absolute top-[env(safe-area-inset-top,1rem)] left-0 right-0 z-40 flex justify-between items-start px-4 pt-4 pointer-events-none">
        <div className="flex gap-2">
          {onBack ? (
            <button onClick={onBack} className="pointer-events-auto bg-white/20 backdrop-blur-xl border border-white/20 p-2.5 rounded-full text-white shadow-lg cursor-pointer hover:bg-white/30 transition-all">
              <ChevronLeft size={20} />
            </button>
          ) : <div />}
          
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="pointer-events-auto bg-white/20 backdrop-blur-xl border border-white/20 p-2.5 rounded-full text-white shadow-lg cursor-pointer hover:bg-white/30 transition-all"
            title="Checkout"
          >
            <ShoppingBag size={20} />
          </button>
        </div>

        {/* Smaller Budget Pill */}
        <div className="pointer-events-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1.5 flex flex-col gap-1 shadow-lg max-w-[120px]">
          <span className="text-[10px] font-black tracking-wide text-white text-center">₹{usedBudget} / {maxBudget}</span>
          <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${isOverBudget ? "bg-red-500" : "bg-[#ff3f6c]"}`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. CENTER ONBOARDING (If no image) */}
      {!shownImage && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl mb-4 border border-white/30">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white drop-shadow-md mb-2">Set Up Your Twin</h2>
          <p className="text-xs text-white/80 font-medium max-w-[220px] mb-8">
            Upload a full-body photo of yourself to see garments mapped instantly to your body.
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[240px] bg-white text-[#ff3f6c] font-black py-3.5 rounded-2xl shadow-xl hover:bg-white/90 transition-all cursor-pointer mb-8"
          >
            Upload Your Photo
          </button>
        </div>
      )}

      {/* Floating Camera / Reset actions for active avatar */}
      {shownImage && (
        <div className="absolute right-4 bottom-[280px] z-30 flex flex-col gap-2">
          {displayImage && displayImage !== baseUserImage && (
            <button
              onClick={() => setDisplayImage(baseUserImage)}
              className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg text-white cursor-pointer hover:bg-white/30"
              title="Remove Garments"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg text-white cursor-pointer hover:bg-white/30"
            title="Change Photo"
          >
            <Camera size={16} />
          </button>
        </div>
      )}

      {/* 4. FLOATING BOTTOM BAR (Glassmorphism) */}
      {shownImage && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
          <button
            onClick={() => setIsBottomBarVisible(!isBottomBarVisible)}
            className="pointer-events-auto mb-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full p-1.5 text-white shadow-lg cursor-pointer hover:bg-black/60 transition-all"
            title={isBottomBarVisible ? "Hide Outfit Panel" : "Show Outfit Panel"}
          >
            {isBottomBarVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>

          <div
            className={`pointer-events-auto w-full transition-all duration-300 origin-bottom ${
              isBottomBarVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full h-0 overflow-hidden"
            }`}
          >
            <div className="w-full bg-white/10 backdrop-blur-2xl border-t border-white/20 rounded-t-[32px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl flex flex-col gap-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-1 px-2">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                  Active Outfit
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTryOnAll();
                  }}
                  className="flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow-lg cursor-pointer hover:bg-[#ff3f6c]/90 transition-all"
                >
                  <Sparkles size={12} className="text-[#ffff00]" fill="#ffff00" />
                  Try On All
                </button>
              </div>

              {/* Selected Items Row */}
              <div className="grid grid-cols-4 gap-2.5">
          {(["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"] as const).map((slot) => {
            const item = canvasItems[slot];
            const isActive = activeSwapCategory === slot;
            const isLocked = lockedItems[slot];
            return (
              <div
                key={slot}
                onClick={() => setSwapCategory(slot)}
                className={`relative flex flex-col p-2 rounded-2xl transition-all cursor-pointer aspect-[3/4] ${
                  isActive
                    ? "bg-white/20 border border-white/40 shadow-xl"
                    : "bg-black/20 border border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">
                    {slot.slice(0, 3)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(slot);
                    }}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {isLocked ? <Lock size={10} className="text-emerald-400" /> : <Unlock size={10} />}
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center relative w-full h-full rounded-xl overflow-hidden bg-black/20 border border-white/10">
                  {item ? (
                    <>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(slot);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-sm cursor-pointer z-10"
                      >
                         <X size={10} strokeWidth={3} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slot !== "TOP" && slot !== "BOTTOM") {
                            setErrorToast("Virtual try-on is currently optimized for tops and bottoms.");
                            setTimeout(() => setErrorToast(null), 4000);
                            return;
                          }
                          handleGarmentClick(item.image, slot, item.id);
                        }}
                        className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#ff3f6c] shadow-lg cursor-pointer"
                      >
                         <Shirt size={10} />
                      </button>
                    </>
                  ) : (
                    <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest">Empty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Swap Tray */}
        {activeSwapCategory && (
          <div className="mt-3 bg-black/20 rounded-2xl p-3 border border-white/10">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">
                {isSwapLoading ? "Searching alternates..." : `${activeSwapCategory.toLowerCase()} swaps`}
              </span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
              {isSwapLoading ? (
                <div className="w-full flex items-center justify-center py-4 text-[10px] font-bold text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#ff3f6c]" />
                  Curating alternates...
                </div>
              ) : swapAlternatives.length === 0 ? (
                <div className="w-full py-4 text-center text-[10px] text-white/40 font-bold">
                  No alternatives within budget.
                </div>
              ) : (
                swapAlternatives.map((alt) => {
                  const isCurrent = canvasItems[activeSwapCategory]?.id === alt.id;
                  return (
                    <div
                      key={alt.id}
                      onClick={() => handleAlternativeClick(alt)}
                      className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl cursor-pointer snap-start shrink-0 min-w-[170px] transition-all backdrop-blur-md ${
                        isCurrent
                          ? "bg-white/20 border border-white/40 shadow-xl"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold text-white truncate">{alt.name}</p>
                        <p className="text-[8px] text-[#ff3f6c] font-black mt-0.5">₹{alt.price}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
        id="digital-twin-photo-upload-mobile"
      />

      {/* Error alert toast */}
      {errorToast && (
        <div className="fixed top-24 left-4 right-4 z-50 bg-red-500/90 backdrop-blur-md border border-red-400 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p className="flex-1 text-[11px] font-bold leading-normal">{errorToast}</p>
          <button
            onClick={() => setErrorToast(null)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Checkout Modal (Kept clean and simple) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-white/20 animate-in zoom-in duration-300 text-[#282c3f]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#ff3f6c]" />
                Unified Checkout
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-[#9496a2] hover:text-[#282c3f] p-1.5 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="divide-y divide-[#eaeaec] max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
              {Object.entries(canvasItems).map(([category, item]) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#f5f5f6] rounded-xl overflow-hidden shrink-0 border border-[#eaeaec]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#282c3f] truncate max-w-[140px]">{item.name}</h4>
                      <p className="text-[9px] text-[#9496a2] uppercase tracking-wider mt-0.5">{category}</p>
                    </div>
                  </div>
                  <select
                    value={selectedSizes[category] || ""}
                    onChange={(e) => setSelectedSizes({ ...selectedSizes, [category]: e.target.value })}
                    className="bg-gray-50 border border-gray-200 text-[10px] font-black rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Size</option>
                    {category === "FOOTEAR" || category === "FOOTWEAR" ? (
                      ["5", "6", "7", "8", "9", "10"].map((sz) => <option key={sz} value={sz}>UK {sz}</option>)
                    ) : category === "ACCESSORY" ? (
                      <option value="One Size">One Size</option>
                    ) : (
                      ["XS", "S", "M", "L", "XL", "XXL"].map((sz) => <option key={sz} value={sz}>{sz}</option>)
                    )}
                  </select>
                </div>
              ))}
            </div>

            <div className="border-t border-[#eaeaec] pt-4 mt-2 space-y-2">
              <div className="flex justify-between text-[11px] text-[#535766] font-bold">
                <span>Subtotal</span>
                <span>₹{usedBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#282c3f] border-t border-[#eaeaec] pt-3">
                <span>Total</span>
                <span className="text-[#ff3f6c]">₹{usedBudget.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCheckoutModal(false);
                setShowSuccessScreen(true);
              }}
              className="mt-6 w-full bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] text-white hover:opacity-90 font-black py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              Place Order
            </button>
          </div>
        </div>
      )}

      {/* Order Success Screen */}
      {showSuccessScreen && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#f5f5f6] text-[#282c3f] animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center text-center max-w-[320px] border border-[#eaeaec]">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500 delay-150">
              <Sparkles size={48} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-black mb-3">Order Paid!</h2>
            <p className="text-sm font-medium text-[#535766] mb-8">
              Your stunning outfit is secured and on its way. Get ready to look fabulous!
            </p>
            <button
              onClick={() => {
                setShowSuccessScreen(false);
                if (onBack) onBack();
              }}
              className="w-full bg-[#282c3f] text-white font-black py-4 rounded-2xl hover:bg-black transition-colors shadow-lg cursor-pointer"
            >
              Back to Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalTwin;
