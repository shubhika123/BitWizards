import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function BargainSliderStep() {
  const {
    selectedProduct,
    proposedBid,
    setProposedBid,
    setStep,
    setChatRound,
    setIsTyping,
  } = useBazaarStore();

  const [probInfo, setProbInfo] = useState({
    label: "Calculating...",
    percentage: 50,
    color_token: "amber",
    note: ""
  });

  useEffect(() => {
    if (!selectedProduct) return;
    
    // Debounce the API call slightly if the user is sliding fast
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bazaar/probability?original_price=${selectedProduct.price}&proposed_price=${proposedBid}`);
        if (res.ok) {
          const data = await res.json();
          setProbInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch probability", err);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [proposedBid, selectedProduct]);

  if (!selectedProduct) return null;

  const handleSubmitOffer = () => {
    setChatRound(1);
    setIsTyping(true);
    setStep(4);
  };

  const getTextColor = () => {
    switch(probInfo.color_token) {
      case 'emerald': return 'text-emerald-500';
      case 'amber': return 'text-amber-500';
      case 'rose': return 'text-rose-500';
      case 'red': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getBgColor = () => {
    switch(probInfo.color_token) {
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'rose': return 'bg-rose-500';
      case 'red': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b sticky top-0 z-10 shadow-3xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(2)} className="active:scale-95 transition-transform p-1">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="font-extrabold text-sm text-gray-800 tracking-wide">Propose Bargain Price</span>
        </div>
        <span className="text-[10px] text-[#ff3f6c] font-black uppercase bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded shadow-3xs">Bargain Round</span>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-6 text-center">
        {/* Price comparisons */}
        <div className="flex justify-around items-center border border-gray-100 rounded-2xl p-4 bg-white shadow-3xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Standard Price</span>
            <span className="text-base font-black text-slate-400 line-through">₹{selectedProduct.price}</span>
          </div>
          <div className="w-[1px] h-8 bg-gray-100" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Proposed Bargain</span>
            <span className="text-xl font-black text-[#ff3f6c]">₹{proposedBid}</span>
          </div>
        </div>

        {/* Custom SVG likelihood gauge */}
        <div className="flex flex-col items-center gap-2 bg-slate-50 border border-gray-100 rounded-2xl p-4">
          <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-wider">Likelihood Meter</span>

          {/* Gauge Arc */}
          <div className="relative w-44 h-[88px] flex items-end justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 50">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 36 24" fill="none" stroke="#ef4444" strokeWidth="8" />
              <path d="M 36 24 A 40 40 0 0 1 64 24" fill="none" stroke="#eab308" strokeWidth="8" />
              <path d="M 64 24 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" />

              {/* Needle line */}
              <line
                x1="50"
                y1="50"
                x2={`${50 + 36 * Math.cos((180 - (probInfo.percentage / 100) * 180) * Math.PI / 180)}`}
                y2={`${50 - 36 * Math.sin((180 - (probInfo.percentage / 100) * 180) * Math.PI / 180)}`}
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
              <circle cx="50" cy="50" r="5" fill="#1e293b" />
            </svg>
            
            <div className="absolute -bottom-2 flex flex-col items-center">
              <span className={`text-base font-black tracking-tight ${getTextColor()}`}>
                {probInfo.percentage}%
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-col items-center gap-1">
            <span className={`text-xs font-bold uppercase tracking-widest ${getTextColor()}`}>
              {probInfo.label}
            </span>
            <p className="text-[9px] text-gray-400 font-medium leading-relaxed max-w-[80%]">
              {probInfo.note}
            </p>
          </div>
        </div>

        {/* Input slider */}
        <div className="flex flex-col gap-3 w-full bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs mt-2">
          <div className="flex justify-between items-center w-full px-1">
            <span className="text-[10px] font-black text-slate-400">₹{(selectedProduct.price * 0.5).toFixed(0)}</span>
            <span className="text-[10px] font-black text-[#ff3f6c]">Adjust Bid</span>
            <span className="text-[10px] font-black text-emerald-500">₹{selectedProduct.price}</span>
          </div>
          <input
            type="range"
            min={selectedProduct.price * 0.5}
            max={selectedProduct.price}
            step={10}
            value={proposedBid}
            onChange={(e) => setProposedBid(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff3f6c]"
          />
        </div>

      </main>

      {/* Sticky Bottom Action */}
      <div className="sticky bottom-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <button
          onClick={handleSubmitOffer}
          className="w-full bg-[#2d1a3c] hover:bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl shadow-slate-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          Submit Offer of ₹{proposedBid}
        </button>
      </div>
    </div>
  );
}
