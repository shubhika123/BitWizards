import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface PromoCarouselProps {
  isGenerating: boolean;
}

const CARDS = [
  {
    accent: "#FF3F6C",
    badgeType: "pill",
    badgeBg: "rgba(255, 255, 255, 0.9)",
    badgeText: "NEW",
    badgeIcon: "✨",
    headlineText: "Get AI-powered outfit picks.",
    headlineHighlight: "AI-powered",
    subcopy: "Smart suggestions based on your style.",
    heroImage: "/catalog/glamstreme.png",
    cta: "Explore →",
    ctaBg: "#FF3F6C",
    ctaText: "#FFFFFF",
  },
  {
    accent: "#6C4CE0",
    badgeType: "icon",
    badgeBg: "#6C4CE0",
    badgeText: "",
    badgeIcon: "🤖",
    headlineText: "Smart styling engine.",
    headlineHighlight: "Smart styling",
    subcopy: "We analyze millions of trends for you.",
    heroImage: "/catalog/AIrecommendation.png",
    cta: "Discover →",
    ctaBg: "#6C4CE0",
    ctaText: "#FFFFFF",
  },
  {
    accent: "#1F8A4C",
    badgeType: "icon",
    badgeBg: "#1F8A4C",
    badgeText: "",
    badgeIcon: "🏪",
    headlineText: "Shop local sellers you trust.",
    headlineHighlight: "local sellers",
    subcopy: "Unique finds from verified stores.",
    heroImage: "/catalog/localbazar.png",
    cta: "Shop →",
    ctaBg: "#1F8A4C",
    ctaText: "#FFFFFF",
  },
  {
    accent: "#C6FF3D", // lime
    badgeType: "black-pill",
    badgeBg: "#111111",
    badgeText: "FWD",
    badgeIcon: "",
    headlineText: "Catch Gen-Z trends.",
    headlineHighlight: "Gen-Z trends",
    subcopy: "Fresh drops and viral community styles.",
    heroImage: "/catalog/genz.png",
    cta: "Trending →",
    ctaBg: "#111111",
    ctaText: "#C6FF3D",
  }
];

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ isGenerating }) => {
  const [progress, setProgress] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated 30s progress up to 95%
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setCurrentCardIndex(0);
      return;
    }

    const intervalTime = 100; // ms
    const totalSimulatedTime = 28000; // 28s to reach 95%
    const increment = 95 / (totalSimulatedTime / intervalTime);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [isGenerating]);

  // Card Rotation logic
  const startAutoAdvance = (delay: number) => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % CARDS.length);
      startAutoAdvance(7500); // normal 7.5s loop
    }, delay);
  };

  useEffect(() => {
    if (isGenerating) {
      startAutoAdvance(7500);
    } else {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    }
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  const handleDotClick = (idx: number) => {
    setCurrentCardIndex(idx);
    startAutoAdvance(5000); // Pause briefly for 5s after interaction
  };

  if (!isGenerating) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-md flex flex-col justify-center items-center px-6 animate-in fade-in duration-300">
      {/* Persistent Status Block */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={22} className="text-[#FF3F6C] animate-pulse" />
          <h2 className="text-[17px] font-extrabold text-[#282C3F]">Making your Twin…</h2>
        </div>
        <p className="text-[13px] text-[#7E7E7E]">Almost ready — hang tight</p>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-[340px] relative overflow-hidden rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div
          className="flex transition-transform ease-out"
          style={{ 
            transform: `translateX(-${currentCardIndex * 100}%)`,
            transitionDuration: "350ms"
          }}
        >
          {CARDS.map((card, idx) => (
            <div
              key={idx}
              className="w-full flex-shrink-0 flex flex-col relative overflow-hidden bg-white"
              style={{ height: '480px' }}
            >
              {/* Top ~78% - Hero Image */}
              <div className="relative w-full flex-1" style={{ flex: '0 0 78%' }}>
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${card.heroImage})` }}
                />
                
                {/* Gradient Scrim */}
                <div 
                  className="absolute inset-0" 
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }}
                />

                {/* Content on Image (Badge + Headline) */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                  {/* Badge Top-Left */}
                  <div className="flex justify-start">
                    {card.badgeType === "pill" && (
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider backdrop-blur-md shadow-sm"
                        style={{ backgroundColor: card.badgeBg, color: card.accent }}
                      >
                        <span className="text-[12px]">{card.badgeIcon}</span>
                        {card.badgeText}
                      </div>
                    )}
                    {card.badgeType === "black-pill" && (
                      <div
                        className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider shadow-sm"
                        style={{ backgroundColor: card.badgeBg, color: card.accent }}
                      >
                        {card.badgeText}
                      </div>
                    )}
                    {card.badgeType === "icon" && (
                      <div
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[16px] shadow-sm"
                        style={{ backgroundColor: card.badgeBg, color: 'white' }}
                      >
                        {card.badgeIcon}
                      </div>
                    )}
                  </div>

                  {/* Headline Bottom-Left */}
                  <h3 
                    className="text-[22px] leading-tight font-black text-white max-w-[95%]"
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
                  >
                    {(() => {
                      const parts = card.headlineText.split(card.headlineHighlight);
                      if (parts.length === 2) {
                        return (
                          <>
                            {parts[0]}
                            <span style={{ color: card.accent }}>{card.headlineHighlight}</span>
                            {parts[1]}
                          </>
                        );
                      }
                      return card.headlineText;
                    })()}
                  </h3>
                </div>
              </div>

              {/* Bottom ~22% - White Panel */}
              <div className="flex-1 bg-white p-4 flex items-center justify-between gap-3 relative z-20">
                <p className="text-[12px] text-[#535766] font-medium leading-snug flex-1">
                  {card.subcopy}
                </p>
                <button 
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-[12px] font-extrabold whitespace-nowrap shadow-sm transition-transform active:scale-95"
                  style={{ backgroundColor: card.ctaBg, color: card.ctaText }}
                >
                  {card.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotation Dots */}
      <div className="flex gap-2.5 mt-5 mb-8">
        {CARDS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
              currentCardIndex === idx ? 'bg-[#282C3F]/80' : 'bg-[#E5E5E8]'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-[340px] px-2 flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-[#F1F1F3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF3F6C] rounded-full transition-all ease-linear"
            style={{ width: `${progress}%`, transitionDuration: '100ms' }}
          />
        </div>
        <span className="text-[11px] text-[#7E7E7E] font-extrabold w-8 text-right">
          {Math.floor(progress)}%
        </span>
      </div>
    </div>
  );
};
