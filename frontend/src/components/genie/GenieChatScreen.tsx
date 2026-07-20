"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Calendar,
  Tag,
  Globe,
  RefreshCw,
  ChevronLeft,
  ShoppingBag,
  Shirt,
  Camera,
  BookmarkPlus,
  Square,
} from "lucide-react";
import PinToBoardModal from "../OutfitCircle/PinToBoardModal";
// Removed GenieAmbientBackground as we are using a custom CSS gradient
import { useGenieStore, GenieParsedContext } from "../../store/genieStore";
import { buildGenieReplyText, useGenieNlpSubmit } from "../../hooks/useGenieNlpSubmit";
import { DigitalTwin } from "../DigitalTwin";

export type ChatMessage =
  | { id: string; role: "user"; text: string; time: string }
  | {
      id: string;
      role: "genie";
      text: string;
      time: string;
      context?: GenieParsedContext;
      snapshotItems?: Record<string, any>;
      snapshotPrefs?: string[];
    };

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function IntentChips({ context }: { context: GenieParsedContext }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-[#eaeaec]/80">
      <span className="inline-flex items-center gap-1 bg-white border border-[#eaeaec] px-2 py-1 rounded-lg text-[10px] font-semibold text-[#282c3f]">
        <Calendar size={11} className="text-[#ff3f6c]" />
        {context.occasionCategory || context.occasionRaw || "Casual"}
      </span>
      {context.maxBudget != null && (
        <span className="inline-flex items-center gap-1 bg-white border border-[#eaeaec] px-2 py-1 rounded-lg text-[10px] font-semibold text-[#282c3f]">
          ₹{context.maxBudget.toLocaleString()}
        </span>
      )}
      {context.primaryColor && (
        <span className="inline-flex items-center gap-1 bg-white border border-[#eaeaec] px-2 py-1 rounded-lg text-[10px] font-semibold text-[#282c3f] capitalize">
          <Tag size={11} className="text-[#ff3f6c]" />
          {context.primaryColor}
        </span>
      )}
      <span className="inline-flex items-center gap-1 bg-white border border-[#eaeaec] px-2 py-1 rounded-lg text-[10px] font-semibold text-[#282c3f]">
        <Globe size={11} className="text-[#ff3f6c]" />
        {context.detectedLanguage}
      </span>
      {context.aestheticTags?.length > 0 && (
        <span className="inline-flex items-center gap-1 bg-pink-50/80 border border-pink-100 px-2 py-1 rounded-lg text-[10px] font-semibold text-[#282c3f]">
          <Sparkles size={11} className="text-[#ff3f6c]" />
          {context.aestheticTags.join(", ")}
        </span>
      )}
    </div>
  );
}

function InlineOutfitPreview({ 
  onTryOnTwin,
  snapshotItems,
  snapshotPrefs
}: { 
  onTryOnTwin: () => void;
  snapshotItems?: Record<string, any>;
  snapshotPrefs?: string[];
}) {
  const { canvasItems, stylePreferences, setDisplayImage } = useGenieStore();
  const items = snapshotItems || canvasItems;
  const prefs = snapshotPrefs || stylePreferences;
  const slots = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"] as const;

  const totalBudgetSpent = slots.reduce((acc, slot) => {
    // Only calculate if the slot is in stylePreferences
    if (prefs.includes(slot) && items[slot]) {
      return acc + (items[slot]?.price || 0);
    }
    return acc;
  }, 0);

  const [showPinModal, setShowPinModal] = useState(false);

  // Map canvas items to ProductToPin format
  const productsToPin = slots
    .filter((slot) => prefs.includes(slot) && items[slot])
    .map((slot) => {
      const item = items[slot]!;
      return {
        product_id: item.id,
        product_name: item.name,
        product_image_url: item.image,
        product_price: item.price,
      };
    });

  const handleTryOnAll = () => {
    onTryOnTwin();
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#eaeaec]/80 flex flex-col gap-2 -mx-4 -mb-3 px-4 pb-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-[#9496a2] uppercase tracking-wider">
          Curated Outfit
        </p>
        <span className="text-[10px] font-bold bg-[#ff3f6c]/10 text-[#ff3f6c] px-2 py-0.5 rounded-full">
          Budget Spent: ₹{totalBudgetSpent.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {slots.map((slot) => {
          // If the user didn't ask for this slot, don't show it!
          if (!prefs.includes(slot)) return null;

          const item = items[slot];
          if (!item) return null;
          return (
            <div key={slot} className="flex flex-col items-center text-center bg-[#f5f5f6]/50 rounded-xl p-1.5 border border-[#eaeaec]/50">
              <div className="w-[70px] h-[70px] bg-white border border-[#eaeaec] rounded-lg overflow-hidden shrink-0 shadow-sm">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-bold text-[#282c3f] truncate w-full mt-1.5 px-1">
                {item.name}
              </span>
              <span className="text-[9px] text-[#ff3f6c] font-semibold mt-0.5">
                ₹{item.price}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setShowPinModal(true)}
          className="flex-1 bg-white border border-[#eaeaec] hover:bg-gray-50 text-[#282c3f] text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
        >
          <BookmarkPlus size={12} className="text-[#282c3f]" />
          Add to Board
        </button>
        <button
          onClick={handleTryOnAll}
          className="flex-1 bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] hover:from-[#ff3f6c]/90 hover:to-[#ff6b8b]/90 text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles size={12} className="animate-pulse text-white" />
          Try it on you
        </button>
      </div>

      {showPinModal && (
        <PinToBoardModal
          products={productsToPin}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
}

type GenieChatScreenProps = {
  initialComposerValue?: string;
};

export function GenieChatScreen({ initialComposerValue = "" }: GenieChatScreenProps) {
  const { submitQuery, isParsing, abort } = useGenieNlpSubmit();
  const { userGender, setUserGender, stylePreferences, setStylePreferences, removeItem, canvasItems, setDisplayImage, baseUserImage, setBaseUserImage } = useGenieStore();
  const [composer, setComposer] = useState(initialComposerValue);
  const [activeTab, setActiveTab] = useState<"chat" | "twin">("chat");
  const [tempPrefs, setTempPrefs] = useState<string[]>(stylePreferences);
  const [preferencesConfirmed, setPreferencesConfirmed] = useState(stylePreferences.length > 0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom mock loading states
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isTryOnLoading, setIsTryOnLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(
    userGender 
      ? [
          {
            id: "welcome",
            role: "genie",
            text: "Hi Shuchi, I'm Genie — your AI stylist. Tell me the occasion, vibe, and budget. Try Hinglish or your regional language.",
            time: "",
          }
        ] 
      : [
          {
            id: "welcome-gender",
            role: "genie",
            text: "Hi Shuchi, I'm Genie — your AI stylist. Before we begin, are you shopping for Men or Women?",
            time: "",
          }
        ]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    // Set current time on client side to avoid hydration mismatch
    setMessages((prev) =>
      prev.map((msg) =>
        (msg.id === "welcome" || msg.id === "welcome-gender") ? { ...msg, time: formatTime() } : msg
      )
    );
  }, []);

  useEffect(() => {
    if (initialComposerValue && !seededRef.current) {
      seededRef.current = true;
      setComposer(initialComposerValue);
    }
  }, [initialComposerValue]);

  useEffect(() => {
    if (activeTab === "chat") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isParsing, activeTab]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isParsing || isDemoLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: formatTime(),
    };
    setMessages((m) => [...m, userMsg]);
    setComposer("");

    setIsDemoLoading(true);

    const context = await submitQuery(trimmed);
    
    // Artificial delay to mimic "magic" loading
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsDemoLoading(false);

    if (context) {
      const state = useGenieStore.getState();
      const genieMsg: ChatMessage = {
        id: `g-${Date.now()}`,
        role: "genie",
        text: buildGenieReplyText(context),
        time: formatTime(),
        context,
        snapshotItems: state.canvasItems,
        snapshotPrefs: state.stylePreferences,
      };
      setMessages((m) => [...m, genieMsg]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(composer);
  };

  const handleStop = () => {
    abort();
    setIsDemoLoading(false);
  };

  const handleGenderSelect = (gender: "Men" | "Women") => {
    setUserGender(gender);
    
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: gender,
      time: formatTime(),
    };
    
    const genieMsg: ChatMessage = {
      id: `g-${Date.now()}`,
      role: "genie",
      text: "Got it! 🌟 What parts of your outfit are we styling today? Feel free to pick as many as you like!",
      time: formatTime(),
    };
    
    setMessages((m) => [...m, userMsg, genieMsg]);
  };

  const toggleTempPref = (pref: string) => {
    setTempPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleConfirmPreferences = () => {
    if (tempPrefs.length === 0) return;
    setStylePreferences(tempPrefs);
    setPreferencesConfirmed(true);

    // Clear any canvas item that is NOT in the selected preferences list!
    const categories: ("TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY")[] = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"];
    categories.forEach(cat => {
      if (!tempPrefs.includes(cat)) {
        removeItem(cat);
      }
    });

    const labelsMap: Record<string, string> = {
      TOP: "Topwear 👕",
      BOTTOM: "Bottomwear 👖",
      FOOTWEAR: "Footwear 👟",
      ACCESSORY: "Accessories 💍"
    };

    const selectedLabels = tempPrefs.map(p => labelsMap[p] || p).join(", ");

    const userMsg: ChatMessage = {
      id: `u-pref-${Date.now()}`,
      role: "user",
      text: `Looking for: ${selectedLabels}`,
      time: formatTime(),
    };

    const genieMsg: ChatMessage = {
      id: `g-pref-${Date.now()}`,
      role: "genie",
      text: "Perfect! Now tell me the occasion, vibe, and budget. E.g. 'Sangeet outfit under 2500' or 'Winter office look'.",
      time: formatTime(),
    };

    setMessages((m) => [...m, userMsg, genieMsg]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBaseUserImage(reader.result);
        
        // After upload, keep isTryOnLoading true so the "getting stuff ready" overlay shows
        // for a few seconds before entering the Digital Twin
        setTimeout(() => {
          setIsTryOnLoading(false);
          setActiveTab("twin");
        }, 3000);
      }
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative h-[100dvh] flex flex-col overflow-hidden text-[#282c3f] bg-white">
      {/* Background Gradients */}
      {activeTab === "chat" && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#FFE9EE_0%,#FFFFFF_100%)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-64 opacity-10 pointer-events-none"
               style={{
                 backgroundImage: "radial-gradient(circle at 50% 0%, #FF3F6C 0%, transparent 70%)",
               }}
          />
        </>
      )}

      {/* Hidden file input for overlay photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
        id="chat-screen-photo-upload"
      />

      {/* Header (conditionally rendered) */}
      {activeTab === "chat" ? (
        <header className="relative z-20 shrink-0 bg-transparent flex flex-col pt-3 pb-1">
          <div className="px-3 py-2 flex items-center justify-between w-full">
            <Link
              href="/"
              className="w-10 h-10 bg-[#F7F7F8] border border-[#E5E5E8] flex items-center justify-center rounded-full hover:bg-white transition-colors shadow-sm"
              aria-label="Back to home"
            >
              <ChevronLeft className="w-6 h-6 text-[#3E4152]" />
            </Link>
            
            <div className="flex-1 flex justify-center items-center gap-1">
              <h1 className="text-3xl font-extrabold text-[#282C3F] italic tracking-tight" style={{ fontFamily: "cursive" }}>
                Genie
              </h1>
              <Sparkles size={18} className="text-[#FF3F6C] mb-2" />
            </div>
            
            <div className="w-10 h-10" /> {/* Spacer for centering */}
          </div>
        </header>
      ) : null}

      {activeTab === "chat" ? (
        <>
          <main
            ref={scrollRef}
            className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3 py-2 flex flex-col gap-4"
          >
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[88%] ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}>
                <div
                  className={`px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#ff3f6c] text-white rounded-2xl rounded-br-md"
                      : "bg-white/95 border border-[#eaeaec] rounded-2xl rounded-bl-md"
                  }`}
                >
                  {msg.text}
                  {msg.role === "genie" && msg.context && (
                    <>
                      <IntentChips context={msg.context} />
                      <InlineOutfitPreview 
                        snapshotItems={msg.snapshotItems}
                        snapshotPrefs={msg.snapshotPrefs}
                        onTryOnTwin={() => {
                        if (msg.snapshotItems) {
                          const store = useGenieStore.getState();
                          Object.keys(msg.snapshotItems).forEach(cat => {
                            const item = msg.snapshotItems![cat];
                            if (item) store.swapItem(cat as any, item);
                          });
                          store.setStylePreferences(msg.snapshotPrefs || []);
                        }
                        setIsTryOnLoading(true);
                        if (baseUserImage) {
                          // Already have image, just do the loading overlay then switch
                          setTimeout(() => {
                            const activeTopId = (msg.snapshotItems || canvasItems)["TOP"]?.id;
                            if (activeTopId === "top_prompt1") {
                              setDisplayImage("/catalog/prompt1_result.png");
                            }
                            setIsTryOnLoading(false);
                            setActiveTab("twin");
                          }, 3000);
                        }
                      }} />
                    </>
                  )}
                </div>
                <span className="text-[8px] text-[#9496a2] font-bold self-end mx-1.5 mb-1 shrink-0">
                  {msg.time}
                </span>
              </div>
            ))}


            {!userGender && (
              <div className="flex items-center gap-3 mt-1 ml-2">
                <button
                  onClick={() => handleGenderSelect("Men")}
                  className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-[#eaeaec] rounded-2xl text-[14px] font-bold text-[#282c3f] hover:border-[#ff3f6c] hover:text-[#ff3f6c] transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span className="text-lg">👨</span> Men
                </button>
                <button
                  onClick={() => handleGenderSelect("Women")}
                  className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-[#eaeaec] rounded-2xl text-[14px] font-bold text-[#282c3f] hover:border-[#ff3f6c] hover:text-[#ff3f6c] transition-all shadow-sm cursor-pointer flex items-center gap-2"
                >
                  <span className="text-lg">👩</span> Women
                </button>
              </div>
            )}

            {userGender && !preferencesConfirmed && (
              <div className="flex flex-col gap-3 mt-1 ml-2 bg-white/95 border border-[#eaeaec] p-4 rounded-2xl max-w-[85%] shadow-md">
                <span className="text-[12px] font-bold text-[#282c3f]">
                  What are we styling today? ✨
                </span>
                <div className="flex flex-col gap-2">
                  {[
                    { key: "TOP", label: "Topwear 👕" },
                    { key: "BOTTOM", label: "Bottomwear 👖" },
                    { key: "FOOTWEAR", label: "Footwear 👟" },
                    { key: "ACCESSORY", label: "Accessories 💍" },
                  ].map((pref) => {
                    const isSelected = tempPrefs.includes(pref.key);
                    return (
                      <button
                        key={pref.key}
                        type="button"
                        onClick={() => toggleTempPref(pref.key)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                          isSelected
                            ? "bg-[#ff3f6c]/10 border-[#ff3f6c] text-[#ff3f6c]"
                            : "bg-[#f5f5f6] border-[#eaeaec] text-[#282c3f] hover:border-[#ff3f6c]/30"
                        }`}
                      >
                        <span>{pref.label}</span>
                        {isSelected && <span className="text-[10px] bg-[#ff3f6c] text-white px-1.5 py-0.5 rounded-full">Selected</span>}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPreferences}
                  disabled={tempPrefs.length === 0}
                  className="w-full py-2.5 rounded-xl bg-[#ff3f6c] text-white text-[12px] font-bold hover:bg-[#ff3f6c]/90 transition-colors disabled:opacity-50 cursor-pointer text-center"
                >
                  Let's style! 🚀
                </button>
              </div>
            )}

            {(isParsing || isDemoLoading) && (
              <div className="flex mr-auto max-w-[88%] mt-2">
                <div className="bg-white/95 border border-[#eaeaec] px-4 py-3 rounded-2xl rounded-bl-md flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b8b] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff9eb2] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#ff3f6c] animate-pulse">Loading up your results...</span>
                </div>
              </div>
            )}
          </main>

          {/* Removed Enter Digital Twin Arrow as requested */}
          {/* Custom Fullscreen Try-On Loading Overlay */}
          {isTryOnLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                  display: flex;
                  width: 200%;
                  animation: marquee 8s linear infinite;
                }
              `}</style>
              
              {baseUserImage ? (
                <>
                  <div className="relative flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-[#ff3f6c]/20 border-t-[#ff3f6c] animate-spin" />
                    <Sparkles size={24} className="absolute text-[#ffd700] animate-pulse" fill="#ffd700" />
                  </div>
                  
                  <h2 className="text-2xl font-extrabold text-[#ff3f6c] tracking-wide mb-2 animate-pulse drop-shadow-sm" style={{ fontFamily: "cursive" }}>
                    getting your stuff ready for you...
                  </h2>
                  <p className="text-xs text-[#535766] mb-8 font-medium">
                    Creating your personalized digital twin avatar
                  </p>

                  {/* Horizontal Scroll of shopping items */}
                  <div className="overflow-hidden w-full max-w-[280px] border-y border-[#ff3f6c]/10 py-3 relative bg-pink-50/30 rounded-xl">
                    <div className="animate-marquee flex gap-8 items-center text-[#ff3f6c]/80">
                      <div className="flex gap-8 shrink-0 justify-around w-full items-center">
                        <ShoppingBag size={24} />
                        <span className="text-xl">👗</span>
                        <Shirt size={24} />
                        <span className="text-xl">👜</span>
                        <Sparkles size={24} fill="#ffd700" className="text-[#ffd700]" />
                        <span className="text-xl">👠</span>
                      </div>
                      <div className="flex gap-8 shrink-0 justify-around w-full items-center">
                        <ShoppingBag size={24} />
                        <span className="text-xl">👗</span>
                        <Shirt size={24} />
                        <span className="text-xl">👜</span>
                        <Sparkles size={24} fill="#ffd700" className="text-[#ffd700]" />
                        <span className="text-xl">👠</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(255,63,108,0.2)] border border-pink-100 max-w-[280px] flex flex-col items-center animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-3">
                    <Camera size={24} className="text-[#ff3f6c]" />
                  </div>
                  <h3 className="text-lg font-black text-[#282c3f] mb-2">Upload Photo</h3>
                  <p className="text-xs text-[#535766] text-center font-medium mb-6">
                    Please upload a clear, full-body photo of yourself to create your Digital Twin.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-[#ff3f6c] hover:bg-[#ff3f6c]/90 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Select Image
                  </button>
                  <button 
                    onClick={() => setIsTryOnLoading(false)} 
                    className="mt-4 text-[10px] text-[#9496a2] hover:text-[#282c3f] font-bold underline cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className="relative z-20 shrink-0 bg-transparent p-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {["Sangeet outfit under 2500", "Winter office look under 3k"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setComposer(chip)}
                  disabled={!userGender || !preferencesConfirmed}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#FFFFFF] text-[#FF3F6C] border border-[#FF3F6C] shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <div className="flex-1 flex items-center bg-white rounded-xl px-3 py-2.5 shadow-sm border border-[#E5E5E8] min-h-11">
                <Sparkles className="w-4 h-4 text-[#FF3F6C] shrink-0 mr-2" />
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  disabled={isParsing || !userGender || !preferencesConfirmed}
                  autoFocus
                  placeholder={
                    !userGender 
                      ? "Please select your gender above..." 
                      : !preferencesConfirmed 
                        ? "Please select what you're styling today..." 
                        : 'e.g. "Bhai ki shaadi sherwani under 5k"'
                  }
                  className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder-[#9496a2] text-[#282c3f] disabled:opacity-50"
                />
              </div>
              {isParsing || isDemoLoading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-[#282c3f] shadow-sm cursor-pointer hover:bg-[#1a1c29] transition-colors"
                  aria-label="Stop"
                >
                  <Square className="w-4 h-4 text-white" fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!composer.trim() || !userGender || !preferencesConfirmed}
                  className="min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-[#FF3F6C] shadow-sm cursor-pointer disabled:opacity-50 hover:bg-[#ff3f6c]/90 transition-colors"
                  aria-label="Send"
                >
                  <Sparkles className="w-5 h-5 text-white" fill="#ffffff" />
                </button>
              )}
            </form>
          </div>
        </>
      ) : (
        <DigitalTwin onBack={() => setActiveTab("chat")} />
      )}
    </div>
  );
}
