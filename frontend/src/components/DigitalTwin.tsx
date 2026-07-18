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

export interface DigitalTwinProps {
  onTryOn?: (item: GenieItem) => Promise<void>;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = () => {
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
    toggleLock,
    getUsedBudget,
    parsedContext,
  } = useGenieStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
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
    [canvasItems, maxBudget, parsedContext]
  );

  useEffect(() => {
    if (activeSwapCategory) {
      loadAlternatives(activeSwapCategory);
    }
  }, [activeSwapCategory, loadAlternatives]);

  const handleGarmentClick = async (garmentImagePath: string) => {
    if (!baseUserImage) {
      fileInputRef.current?.click();
      return;
    }

    setIsLoading(true);
    setErrorToast(null);

    try {
      const [userBlob, garmentBlob] = await Promise.all([
        fetchImageAsBlob(baseUserImage),
        fetchImageAsBlob(garmentImagePath),
      ]);

      const hfToken = process.env.NEXT_PUBLIC_HF_TOKEN as `hf_${string}` | undefined;
      const app = await client("yisol/IDM-VTON", {
        token: hfToken,
      });

      const userFile = new File([userBlob], "user_photo.jpg", {
        type: userBlob.type || "image/jpeg",
      });
      const garmentFile = new File([garmentBlob], "garment_photo.jpg", {
        type: garmentBlob.type || "image/jpeg",
      });

      const result = await app.predict("/tryon", [
        {
          background: handle_file(userFile),
          layers: [],
          composite: null,
        },
        handle_file(garmentFile),
        "High quality, photorealistic",
        true,
        true,
        30,
        42,
      ]);

      const resultData = result.data as Array<{ url?: string } | string>;
      const first = resultData[0];
      const generatedUrl =
        typeof first === "string" ? first : first?.url ?? null;

      if (!generatedUrl) {
        throw new Error("IDM-VTON returned an empty response.");
      }

      setDisplayImage(generatedUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error during try-on.";
      console.error("[IDM-VTON] Try-on failed:", err);
      setErrorToast(`Try-on failed: ${message}`);
      setTimeout(() => setErrorToast(null), 5000);
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
    await handleGarmentClick(alt.image);
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
    <div className="w-full flex-1 flex flex-col min-h-0 bg-white">
      {/* 1. BUDGET TRACKER */}
      <div className="bg-white border-b border-[#eaeaec] p-4 flex flex-col gap-2 shrink-0 select-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#282c3f] uppercase tracking-wider">
            Fitting Budget
          </span>
          <span className="text-[11px] font-bold text-[#535766]">
            ₹{usedBudget.toLocaleString()} / ₹{maxBudget.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 bg-[#f5f5f6] border border-[#eaeaec] rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOverBudget ? "bg-red-500" : "bg-[#ff3f6c]"
            }`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-[10px] font-extrabold ${isOverBudget ? "text-red-500" : "text-emerald-600"}`}>
            {isOverBudget
              ? `₹${(usedBudget - maxBudget).toLocaleString()} Over Limit`
              : `₹${(maxBudget - usedBudget).toLocaleString()} Remaining`}
          </span>
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="bg-[#ff3f6c] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer select-none"
          >
            <ShoppingBag size={11} />
            Checkout Look
          </button>
        </div>
      </div>

      {/* 2. AVATAR STAGE */}
      <div className="flex-1 min-h-0 flex flex-col p-4 gap-4 items-center justify-center bg-[#f5f5f6] relative overflow-hidden select-none">
        {shownImage ? (
          <div className="relative w-full max-w-[240px] aspect-[3/4] bg-white rounded-2xl border border-[#eaeaec] shadow-sm overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shownImage} alt="Virtual try-on model" className="w-full h-full object-cover" />

            {/* Inference overlay loader */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 animate-in fade-in duration-200">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-3 border-[#ff3f6c]/20 border-t-[#ff3f6c] animate-spin" />
                  <Sparkles size={16} className="absolute text-[#ff3f6c] animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-[#282c3f]">AI trying outfit…</span>
              </div>
            )}

            {/* Stage Actions overlay */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 backdrop-blur-xs border border-[#eaeaec] text-[9px] font-bold text-[#282c3f] px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Camera size={10} className="text-[#ff3f6c]" />
                Change Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[240px] aspect-[3/4] bg-white border border-[#eaeaec] rounded-2xl flex flex-col items-center justify-center text-center p-5 gap-4 shadow-sm">
            <div className="w-12 h-12 bg-pink-50 border border-pink-100 rounded-full flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5 text-[#ff3f6c]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#282c3f]">Set Up Your Fitting Room</p>
              <p className="text-[9px] text-[#9496a2] mt-1 max-w-[170px] leading-relaxed">
                Choose a model preset or upload your photo to see garments on a twin instantly
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#ff3f6c] text-white text-[10px] font-extrabold px-4 py-2 rounded-xl shadow-xs cursor-pointer"
            >
              Upload Your Photo
            </button>
          </div>
        )}

        {/* Starter Model Picker */}
        <div className="flex flex-col gap-1.5 items-center w-full max-w-[320px]">
          <span className="text-[8px] uppercase tracking-widest text-[#9496a2] font-black select-none">
            Or select model preset
          </span>
          <div className="flex gap-2">
            {STARTER_MODELS.map((model) => {
              const isSelected = baseUserImage === model.url;
              return (
                <button
                  key={model.id}
                  onClick={() => setBaseUserImage(model.url)}
                  className={`px-3.5 py-1.5 rounded-full text-[9px] font-extrabold transition-all border cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#ff3f6c] text-white border-transparent shadow-xs"
                      : "bg-white text-[#535766] border-[#eaeaec] hover:bg-gray-50"
                  }`}
                >
                  {model.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. SLOTS SELECTOR */}
      <div className="bg-white border-t border-[#eaeaec] p-3 shrink-0 select-none">
        <p className="text-[9px] font-black text-[#9496a2] uppercase tracking-widest mb-2 px-1">
          Active Outfit Slots
        </p>
        <div className="grid grid-cols-4 gap-2">
          {(["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"] as const).map((slot) => {
            const item = canvasItems[slot];
            const isActive = activeSwapCategory === slot;
            const isLocked = lockedItems[slot];
            return (
              <div
                key={slot}
                onClick={() => setSwapCategory(slot)}
                className={`relative flex flex-col justify-between p-2 rounded-xl border transition-all cursor-pointer aspect-square ${
                  isActive
                    ? "border-[#ff3f6c] bg-pink-50/10 ring-1 ring-[#ff3f6c]"
                    : "border-[#eaeaec] bg-white hover:border-gray-300"
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-[8px] font-bold text-[#9496a2] uppercase tracking-wider">
                    {slot.toLowerCase()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(slot);
                    }}
                    className="text-gray-400 hover:text-[#ff3f6c] transition-colors"
                  >
                    {isLocked ? (
                      <Lock size={10} className="text-teal-500" />
                    ) : (
                      <Unlock size={10} />
                    )}
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="my-1 flex items-center justify-center">
                  {item ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#eaeaec] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[8px] text-gray-400 font-bold border border-dashed border-[#eaeaec]">
                      Empty
                    </div>
                  )}
                </div>

                {/* Cost label */}
                <div className="text-center">
                  <span className="text-[9px] font-bold text-[#282c3f]">
                    {item ? `₹${item.price}` : "-"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ALTERNATIVES SWAPPER */}
      {activeSwapCategory && (
        <div className="bg-[#f5f5f6] border-t border-[#eaeaec] p-3 shrink-0 select-none">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[8px] font-black text-[#9496a2] uppercase tracking-widest">
              {isSwapLoading ? "Searching alternates..." : `${activeSwapCategory.toLowerCase()} swaps`}
            </span>
            <span className="text-[8px] font-black text-[#ff3f6c] bg-white border border-[#eaeaec] px-1.5 py-0.5 rounded uppercase">
              Under Budget
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
            {isSwapLoading ? (
              <div className="w-full flex items-center justify-center py-5 text-[9px] font-bold text-[#535766]">
                <Loader2 className="w-3 h-3 animate-spin mr-1 text-[#ff3f6c]" />
                Stylist is finding alternates...
              </div>
            ) : swapAlternatives.length === 0 ? (
              <div className="w-full py-5 text-center text-[9px] text-[#9496a2] font-bold">
                No alternatives within budget.
              </div>
            ) : (
              swapAlternatives.map((alt) => {
                const isCurrent = canvasItems[activeSwapCategory]?.id === alt.id;
                return (
                  <div
                    key={alt.id}
                    onClick={() => handleAlternativeClick(alt)}
                    className={`flex items-center gap-2 px-2 py-1.5 bg-white border rounded-xl cursor-pointer snap-start shrink-0 min-w-[180px] transition-all ${
                      isCurrent
                        ? "border-[#ff3f6c] bg-pink-50/10 shadow-2xs"
                        : "border-[#eaeaec] hover:border-gray-300"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#eaeaec] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-[#282c3f] truncate">{alt.name}</p>
                      <p className="text-[8px] text-[#ff3f6c] font-bold mt-0.5">₹{alt.price}</p>
                    </div>
                  </div>
                );
              })
            )}
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
        <div className="fixed bottom-4 left-4 right-4 z-40 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 shadow-md flex items-start gap-2 animate-in slide-in-from-bottom duration-250">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-500" />
          <p className="flex-1 text-[10px] font-bold leading-normal">{errorToast}</p>
          <button
            onClick={() => setErrorToast(null)}
            className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-lg border border-[#eaeaec] animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-[#282c3f] flex items-center gap-1.5">
                <ShoppingBag size={16} className="text-[#ff3f6c]" />
                Unified Checkout
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-[#9496a2] hover:text-[#282c3f] p-1 rounded-full hover:bg-[#f5f5f6] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-pink-50/50 border border-pink-100 rounded-xl flex items-center gap-2 text-[9px] font-bold text-[#ff3f6c]">
                <Info size={14} />
                <span>Select sizes to proceed with checkout.</span>
              </div>

              <div className="divide-y divide-[#eaeaec] max-h-[220px] overflow-y-auto pr-1">
                {Object.entries(canvasItems).map(([category, item]) => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-[#f5f5f6] rounded-lg overflow-hidden flex items-center justify-center border border-[#eaeaec] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[10px] font-bold text-[#282c3f] truncate max-w-[120px]">{item.name}</h4>
                        <p className="text-[8px] text-[#9496a2] uppercase">{category}</p>
                      </div>
                    </div>

                    <select
                      value={selectedSizes[category] || ""}
                      onChange={(e) => setSelectedSizes({
                        ...selectedSizes,
                        [category]: e.target.value,
                      })}
                      className="bg-[#f5f5f6] border border-[#eaeaec] text-[9px] font-black text-[#282c3f] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      {category === "FOOTEAR" || category === "FOOTWEAR" ? (
                        ["5", "6", "7", "8", "9", "10"].map((sz) => (
                          <option key={sz} value={sz}>UK {sz}</option>
                        ))
                      ) : category === "ACCESSORY" ? (
                        <option value="One Size">One Size</option>
                      ) : (
                        ["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))
                      )}
                    </select>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#eaeaec] pt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] text-[#535766] font-semibold">
                  <span>Subtotal</span>
                  <span>₹{usedBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#535766] font-semibold">
                  <span>Shipping</span>
                  <span className="text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#282c3f] border-t border-[#eaeaec] pt-2">
                  <span>Grand Total</span>
                  <span className="text-[#ff3f6c]">₹{usedBudget.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 border border-[#eaeaec] text-[#282c3f] hover:bg-[#f5f5f6] font-bold py-2 rounded-xl text-[10px] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Order successfully placed with Myntra Instant Pay!");
                  setShowCheckoutModal(false);
                }}
                className="flex-1 bg-[#ff3f6c] text-white hover:bg-opacity-95 font-bold py-2 rounded-xl text-[10px] transition-all shadow-sm cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalTwin;
