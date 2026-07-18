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
} from "lucide-react";
import { GenieAmbientBackground } from "./GenieAmbientBackground";
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

function InlineOutfitPreview({ onTryOnTwin }: { onTryOnTwin: () => void }) {
  const { canvasItems } = useGenieStore();
  const slots = ["TOP", "BOTTOM", "FOOTWEAR", "ACCESSORY"] as const;

  return (
    <div className="mt-3 pt-3 border-t border-[#eaeaec]/80 flex flex-col gap-2 bg-white rounded-xl p-2.5 shadow-sm border border-[#eaeaec]">
      <p className="text-[9px] font-bold text-[#9496a2] uppercase tracking-wider">
        Curated Outfit
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((slot) => {
          const item = canvasItems[slot];
          if (!item) return null;
          return (
            <div key={slot} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-[#f5f5f6] border border-[#eaeaec] rounded-lg overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[8px] font-bold text-[#282c3f] truncate w-full mt-1">
                {item.name}
              </span>
              <span className="text-[8px] text-[#ff3f6c] font-semibold mt-0.5">
                ₹{item.price}
              </span>
            </div>
          );
        })}
      </div>
      <button
        onClick={onTryOnTwin}
        className="w-full mt-1.5 bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] hover:from-[#ff3f6c]/90 hover:to-[#ff6b8b]/90 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
      >
        <Sparkles size={11} className="animate-pulse text-white" />
        Try on Twin
      </button>
    </div>
  );
}

type GenieChatScreenProps = {
  initialComposerValue?: string;
};

export function GenieChatScreen({ initialComposerValue = "" }: GenieChatScreenProps) {
  const { submitQuery, isParsing } = useGenieNlpSubmit();
  const { userGender, setUserGender } = useGenieStore();
  const [composer, setComposer] = useState(initialComposerValue);
  const [activeTab, setActiveTab] = useState<"chat" | "twin">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(
    userGender 
      ? [
          {
            id: "welcome",
            role: "genie",
            text: "Hi, I'm Genie — your AI stylist. Tell me the occasion, vibe, and budget. Try Hinglish or your regional language.",
            time: "",
          }
        ] 
      : [
          {
            id: "welcome-gender",
            role: "genie",
            text: "Hi, I'm Genie — your AI stylist. Before we begin, are you shopping for Men or Women?",
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
    if (!trimmed || isParsing) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
      time: formatTime(),
    };
    setMessages((m) => [...m, userMsg]);
    setComposer("");

    const context = await submitQuery(trimmed);
    if (context) {
      const genieMsg: ChatMessage = {
        id: `g-${Date.now()}`,
        role: "genie",
        text: buildGenieReplyText(context),
        time: formatTime(),
        context,
      };
      setMessages((m) => [...m, genieMsg]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(composer);
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
      text: "Great! Tell me the occasion, vibe, and budget. Try Hinglish or your regional language.",
      time: formatTime(),
    };
    
    setMessages((m) => [...m, userMsg, genieMsg]);
  };

  return (
    <div className="relative h-[100dvh] flex flex-col overflow-hidden text-[#282c3f]">
      {activeTab === "chat" && <GenieAmbientBackground />}

      <header className="relative z-20 shrink-0 bg-white/90 backdrop-blur-sm border-b border-[#eaeaec] flex flex-col">
        <div className="px-3 py-2 flex items-center gap-3 w-full">
          <Link
            href="/"
            className="min-w-11 min-h-11 flex items-center justify-center -ml-1 rounded-full hover:bg-[#f5f5f6] transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff3f6c]" />
              Genie Stylist
            </span>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready to style
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center border-t border-[#eaeaec]/50 py-2 bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex bg-[#f5f5f6] p-0.5 rounded-full border border-[#eaeaec] text-xs">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-5 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-white text-[#ff3f6c] shadow-sm"
                  : "text-[#535766] hover:text-[#282c3f]"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("twin")}
              className={`px-5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "twin"
                  ? "bg-white text-[#ff3f6c] shadow-sm"
                  : "text-[#535766] hover:text-[#282c3f]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#ff3f6c]" />
              Fitting Room
            </button>
          </div>
        </div>
      </header>

      {activeTab === "chat" ? (
        <>
          <main
            ref={scrollRef}
            className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-3"
          >
            <p className="text-[9px] text-[#9496a2] font-bold text-center uppercase tracking-widest select-none py-1">
              Your styling session
            </p>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[88%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div
                  className={`p-3 rounded-2xl text-[12px] leading-relaxed font-medium shadow-xs ${
                    msg.role === "user"
                      ? "bg-[#ff3f6c] text-white rounded-br-md"
                      : "bg-white/95 border border-[#eaeaec] text-[#282c3f] rounded-bl-md"
                  }`}
                >
                  {msg.text}
                  {msg.role === "genie" && msg.context && (
                    <>
                      <IntentChips context={msg.context} />
                      <InlineOutfitPreview onTryOnTwin={() => setActiveTab("twin")} />
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
                  className="px-4 py-2 bg-white border border-[#eaeaec] rounded-xl text-[12px] font-bold text-[#282c3f] hover:border-[#ff3f6c]/40 hover:bg-[#ff3f6c]/5 transition-colors shadow-sm cursor-pointer"
                >
                  Men
                </button>
                <button
                  onClick={() => handleGenderSelect("Women")}
                  className="px-4 py-2 bg-white border border-[#eaeaec] rounded-xl text-[12px] font-bold text-[#282c3f] hover:border-[#ff3f6c]/40 hover:bg-[#ff3f6c]/5 transition-colors shadow-sm cursor-pointer"
                >
                  Women
                </button>
              </div>
            )}

            {isParsing && (
              <div className="flex mr-auto max-w-[88%]">
                <div className="bg-white/95 border border-[#eaeaec] p-3 rounded-2xl rounded-bl-md flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#535766] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#535766] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#535766] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </main>

          <div
            className="relative z-20 shrink-0 bg-white/95 backdrop-blur-sm border-t border-[#eaeaec] p-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {["Sangeet outfit under 2500", "Winter office look under 3k"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setComposer(chip)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#f5f5f6] border border-[#eaeaec] text-[#535766] hover:border-[#ff3f6c]/40 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <div className="flex-1 flex items-center bg-[#f5f5f6] border border-[#eaeaec] rounded-xl px-3 py-2.5 focus-within:border-[#ff3f6c]/40 transition-colors min-h-11">
                <Sparkles className="w-4 h-4 text-[#ff3f6c] shrink-0 mr-2" />
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  disabled={isParsing || !userGender}
                  placeholder={!userGender ? "Please select your gender above..." : 'e.g. "Bhai ki shaadi sherwani under 5k"'}
                  className="flex-1 min-w-0 bg-transparent text-[13px] outline-none placeholder-[#9496a2] disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={isParsing || !composer.trim() || !userGender}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-[#ff3f6c] text-white disabled:opacity-50 shadow-xs cursor-pointer"
                aria-label="Send"
              >
                {isParsing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </>
      ) : (
        <main className="relative z-10 flex-1 min-h-0 overflow-y-auto bg-gray-50 flex flex-col">
          <DigitalTwin />
        </main>
      )}
    </div>
  );
}
