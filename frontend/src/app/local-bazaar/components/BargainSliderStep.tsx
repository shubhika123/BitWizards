import React, { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";
import { API_BASE_URL } from "@/lib/apiConfig";

function suggestedBidFor(price: number): number {
  return Math.max(Math.floor((price * 0.92) / 10) * 10, Math.floor((price * 0.5) / 10) * 10);
}

type ProbToken = "emerald" | "amber" | "rose" | "red" | string;

function meterTheme(token: ProbToken) {
  switch (token) {
    case "emerald":
      return {
        accent: "#10b981",
        accentSoft: "#d1fae5",
        wash: "from-emerald-50/80 via-white to-white",
        border: "border-emerald-100",
        glow: "shadow-emerald-500/10",
        pill: "bg-emerald-500 text-white",
        text: "text-emerald-600",
      };
    case "amber":
      return {
        accent: "#f59e0b",
        accentSoft: "#fef3c7",
        wash: "from-amber-50/90 via-white to-white",
        border: "border-amber-100",
        glow: "shadow-amber-500/10",
        pill: "bg-amber-500 text-white",
        text: "text-amber-600",
      };
    case "rose":
      return {
        accent: "#f43f5e",
        accentSoft: "#ffe4e6",
        wash: "from-rose-50/90 via-white to-white",
        border: "border-rose-100",
        glow: "shadow-rose-500/10",
        pill: "bg-rose-500 text-white",
        text: "text-rose-600",
      };
    case "red":
      return {
        accent: "#dc2626",
        accentSoft: "#fee2e2",
        wash: "from-red-50/90 via-white to-white",
        border: "border-red-100",
        glow: "shadow-red-500/10",
        pill: "bg-red-600 text-white",
        text: "text-red-600",
      };
    default:
      return {
        accent: "#94a3b8",
        accentSoft: "#f1f5f9",
        wash: "from-slate-50 via-white to-white",
        border: "border-gray-100",
        glow: "shadow-slate-500/5",
        pill: "bg-slate-500 text-white",
        text: "text-slate-500",
      };
  }
}

/** Polar point on semicircle: 0% = left (-180°), 100% = right (0°). */
function arcPoint(pct: number, radius: number, cx = 100, cy = 100) {
  const angle = Math.PI * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return {
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  };
}

function LikelihoodMeter({
  percentage,
  label,
  note,
  colorToken,
}: {
  percentage: number;
  label: string;
  note: string;
  colorToken: ProbToken;
}) {
  const theme = meterTheme(colorToken);
  const clamped = Math.min(100, Math.max(0, percentage));
  // Needle rotation: -90deg at 0%, +90deg at 100%
  const needleDeg = -90 + (clamped / 100) * 180;
  const progressEnd = arcPoint(clamped, 72);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.wash} shadow-lg ${theme.glow} px-4 pt-5 pb-5`}
    >
      {/* Soft atmospheric blob */}
      <div
        className="pointer-events-none absolute -top-8 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: theme.accentSoft }}
      />

      <div className="relative flex items-center justify-center gap-1.5 mb-1">
        <TrendingUp className={`w-3 h-3 ${theme.text}`} strokeWidth={2.5} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em]">
          Acceptance Chance
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-[240px] aspect-[2/1.15]">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="meterTrack" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="35%" stopColor="#fde68a" />
              <stop offset="70%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="needleShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Track background */}
          <path
            d="M 28 100 A 72 72 0 0 1 172 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Gradient arc track */}
          <path
            d="M 28 100 A 72 72 0 0 1 172 100"
            fill="none"
            stroke="url(#meterTrack)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Active progress overlay (accent stroke along same path via dash) */}
          <path
            d="M 28 100 A 72 72 0 0 1 172 100"
            fill="none"
            stroke={theme.accent}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(clamped / 100) * 226} 226`}
            className="transition-[stroke-dasharray,stroke] duration-500 ease-out"
            opacity="0.35"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const outer = arcPoint(tick, 82);
            const inner = arcPoint(tick, 64);
            return (
              <line
                key={tick}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#94a3b8"
                strokeWidth={tick % 50 === 0 ? 2 : 1.25}
                strokeLinecap="round"
                opacity={0.55}
              />
            );
          })}

          {/* Zone labels */}
          <text x="36" y="112" fontSize="7" fontWeight="800" fill="#94a3b8" letterSpacing="0.06em">
            LOW
          </text>
          <text x="88" y="112" fontSize="7" fontWeight="800" fill="#94a3b8" letterSpacing="0.06em">
            FAIR
          </text>
          <text x="148" y="112" fontSize="7" fontWeight="800" fill="#94a3b8" letterSpacing="0.06em">
            HIGH
          </text>

          {/* Needle group — CSS rotate animates smoothly around hub */}
          <g
            style={{
              transform: `rotate(${needleDeg}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 500ms cubic-bezier(0.34, 1.2, 0.64, 1)",
            }}
            filter="url(#needleShadow)"
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="36"
              stroke="#1e293b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="36" r="3.5" fill={theme.accent} />
          </g>

          {/* Hub */}
          <circle cx="100" cy="100" r="9" fill="#1e293b" />
          <circle cx="100" cy="100" r="4.5" fill={theme.accent} className="transition-colors duration-500" />

          {/* Tip glow at progress end */}
          <circle
            cx={progressEnd.x}
            cy={progressEnd.y}
            r="4"
            fill={theme.accent}
            className="transition-all duration-500 ease-out"
            opacity="0.9"
          />
        </svg>

        {/* Big percentage sitting in the dial bowl */}
        <div className="absolute inset-x-0 bottom-[18%] flex flex-col items-center pointer-events-none">
          <span
            className={`text-3xl font-black tabular-nums tracking-tight leading-none transition-all duration-500 ease-out ${theme.text}`}
          >
            {clamped}
            <span className="text-lg align-super ml-0.5 opacity-80">%</span>
          </span>
        </div>
      </div>

      <div className="relative mt-1 flex flex-col items-center gap-2">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors duration-500 ${theme.pill}`}
        >
          {label}
        </span>
        <p className="text-[11px] text-slate-500 font-medium leading-snug max-w-[90%] text-center">
          {note || "Slide your bid to see how likely the boutique is to accept."}
        </p>
      </div>
    </div>
  );
}

export default function BargainSliderStep() {
  const {
    selectedProduct,
    proposedBid,
    setProposedBid,
    setStep,
    startBargainChat,
    buyNowDirect,
  } = useBazaarStore();

  const [probInfo, setProbInfo] = useState({
    label: "Calculating...",
    percentage: 50,
    color_token: "amber",
    note: ""
  });

  useEffect(() => {
    if (!selectedProduct) return;
    
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

  const suggested = suggestedBidFor(selectedProduct.price);
  const minBid = Math.floor(selectedProduct.price * 0.5);

  const handleSubmitOffer = () => {
    startBargainChat();
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
        <span className="text-[10px] text-[#ff3f6c] font-black uppercase bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded shadow-3xs">
          Round 1 of 2
        </span>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-5 text-center pb-36">
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

        <LikelihoodMeter
          percentage={probInfo.percentage}
          label={probInfo.label}
          note={probInfo.note}
          colorToken={probInfo.color_token}
        />

        {/* Suggested bid */}
        <button
          type="button"
          onClick={() => setProposedBid(suggested)}
          className="self-center flex items-center gap-1.5 bg-pink-50 border border-pink-100 text-[#ff3f6c] text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-full shadow-3xs active:scale-95 transition-transform"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Suggested Bid ₹{suggested}
        </button>

        {/* Input slider */}
        <div className="flex flex-col gap-3 w-full bg-white border border-gray-100 rounded-2xl p-5 shadow-3xs">
          <div className="flex justify-between items-center w-full px-1">
            <span className="text-[10px] font-black text-slate-400">₹{minBid}</span>
            <span className="text-[10px] font-black text-[#ff3f6c]">Adjust Bid</span>
            <span className="text-[10px] font-black text-emerald-500">₹{selectedProduct.price}</span>
          </div>
          <input
            type="range"
            min={minBid}
            max={selectedProduct.price}
            step={10}
            value={proposedBid}
            onChange={(e) => setProposedBid(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff3f6c]"
          />
        </div>
      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-20">
        <button
          onClick={handleSubmitOffer}
          className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white font-black py-4 rounded-xl shadow-xl shadow-pink-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          Submit Offer of ₹{proposedBid}
        </button>
        <button
          type="button"
          onClick={() => buyNowDirect()}
          className="w-full mt-2.5 text-[11px] font-bold text-gray-500 hover:text-[#ff3f6c] transition-colors"
        >
          Buy at ₹{selectedProduct.price} instead
        </button>
      </div>
    </div>
  );
}
