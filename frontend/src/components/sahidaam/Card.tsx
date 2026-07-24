"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { CheckCircle2, XCircle, Heart, ThumbsDown, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "@/lib/apiConfig";

interface DetailTier {
  reveal_at_seconds: number;
  label: string;
  value: string;
}

interface CardData {
  id: string;
  actual_price: number;
  name: string;
  image_url: string;
  detail_tiers: DetailTier[];
}

interface RevealData {
  actual_price: number;
  guess_amount: number;
  deviation_pct: number;
  base_points: number;
  speed_bonus_points: number;
  total_points: number;
  streak_count: number;
  social_proof_line: string;
}

interface Props {
  card: CardData;
  isActive: boolean;
  onSwipe: (action: string) => void;
  onAdvance: () => void;
}

export function Card({ card, isActive, onSwipe, onAdvance }: Props) {
  const [status, setStatus] = useState<"pending" | "shown" | "submitted" | "dismissed">("pending");
  const [localShownAt, setLocalShownAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [guess, setGuess] = useState<number>(Math.round(card.actual_price * 0.8)); // Default starting point
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  
  const { user } = useAuthStore();
  const userId = user?.uid || "demo_user_123";
  
  // Framer motion drag state
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Overlays
  const leftOpacity = useTransform(x, [0, -150], [0, 1]);
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);
  const upOpacity = useTransform(y, [0, -150], [0, 1]);
  
  const controls = useAnimation();
  
  // 3D Flip state
  const flipControls = useAnimation();

  // Timer loop
  useEffect(() => {
    if (!isActive || status !== "shown" || !localShownAt) return;
    
    let reqId: number;
    const loop = () => {
      const now = Date.now();
      const el = (now - localShownAt) / 1000;
      setElapsed(el);
      
      if (el >= 60) {
        // Auto-submit on timeout
        handleSubmit();
      } else {
        reqId = requestAnimationFrame(loop);
      }
    };
    reqId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(reqId);
  }, [isActive, status, localShownAt]);

  // Mark as shown when it becomes active
  useEffect(() => {
    if (isActive && status === "pending") {
      fetch(`${API_BASE_URL}/api/sahidaam/deck/card/${card.id}/shown`, { 
        method: "POST",
        headers: { "X-User-Id": userId }
      })
        .then(res => res.json())
        .then(data => {
          if (data.shown_at) {
            // Compute the drift to ensure 60s is accurate based on server time, but for demo we just use Date.now() locally
            setStatus("shown");
            setLocalShownAt(Date.now());
          }
        })
        .catch(console.error);
    }
  }, [isActive, status, card.id]);

  const handleSubmit = () => {
    if (status !== "shown") return;
    setStatus("submitted");
    
    fetch(`${API_BASE_URL}/api/sahidaam/deck/card/${card.id}/submit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Id": userId
      },
      body: JSON.stringify({ guess_amount: guess })
    })
      .then(res => res.json())
      .then((data: RevealData) => {
        setRevealData(data);
        // Trigger flip animation
        flipControls.start({ rotateY: 180, transition: { duration: 0.6, type: "spring" } });
      })
      .catch(console.error);
  };

  const handleDragEnd = async (e: any, info: any) => {
    const offsetX = info.offset.x;
    const velocityX = info.velocity.x;
    const offsetY = info.offset.y;
    const velocityY = info.velocity.y;

    if (offsetX < -100 || velocityX < -500) {
      // Swiped left (Wishlist)
      await controls.start({ x: -300, opacity: 0 });
      handleSwipeAction("wishlist");
    } else if (offsetX > 100 || velocityX > 500) {
      // Swiped right (Unrecommend)
      await controls.start({ x: 300, opacity: 0 });
      handleSwipeAction("unrecommend");
    } else if (offsetY < -100 || velocityY < -500) {
      // Swiped up (Dismiss)
      await controls.start({ y: -300, opacity: 0 });
      handleSwipeAction("dismiss");
    } else {
      // Snap back
      controls.start({ x: 0, y: 0, opacity: 1 });
    }
  };

  const handleSwipeAction = (action: string) => {
    if (status !== "submitted") {
      setStatus("dismissed");
    }
    
    fetch(`${API_BASE_URL}/api/sahidaam/deck/card/${card.id}/swipe`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-Id": userId
      },
      body: JSON.stringify({ action })
    }).catch(console.error);
    
    onAdvance(); // tell parent to shift stack
  };

  // Render logic
  const timerPct = Math.max(0, 100 - (elapsed / 60) * 100);
  const isUrgent = elapsed > 50;

  return (
    <>
      <style>{`
        .custom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          background: transparent;
        }
        .custom-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #fdf2f8; /* pink-50 */
          border-radius: 999px;
          border: 1px solid #fbcfe8; /* pink-200 */
        }
        .custom-slider::-webkit-slider-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #FF3E6C;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -9px;
          box-shadow: 0 2px 6px rgba(255, 62, 108, 0.4);
          border: 2px solid white;
        }
      `}</style>
      <motion.div
        className="relative w-[85vw] max-w-[380px] h-[65vh] min-h-[480px] max-h-[650px] rounded-2xl bg-white shadow-2xl preserve-3d"
        drag={isActive ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotateZ: rotate, transformStyle: "preserve-3d" }}
        animate={controls}
        whileTap={{ cursor: "grabbing" }}
      >
        <motion.div 
          className="relative w-full h-full preserve-3d"
          animate={flipControls}
          initial={{ rotateY: 0 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT FACE */}
          <div 
            className="absolute inset-0 bg-white rounded-2xl overflow-hidden flex flex-col pointer-events-auto"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            
            {/* Header & Timer */}
            <div className="relative h-1/2 w-full bg-gray-50 flex-shrink-0">
              <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
              
              <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
                <div className="text-white font-bold text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  Sahi Daam?
                </div>
                
                {/* Timer moved to submit button */}
              </div>
              
              {/* Drag cues */}
              <div className="absolute bottom-2 left-0 w-full flex justify-between px-4 text-white opacity-0 hover:opacity-100 transition-opacity">
                 <span className="text-xs bg-black/40 px-2 py-1 rounded-full"><ThumbsDown className="w-3 h-3 inline"/> Unrecommend</span>
                 <span className="text-xs bg-black/40 px-2 py-1 rounded-full"><Heart className="w-3 h-3 inline"/> Wishlist</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800 leading-tight line-clamp-2">{card.name}</h3>
                
                {/* Progressive Reveal Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {card.detail_tiers.map((tier, idx) => {
                    const revealed = elapsed >= tier.reveal_at_seconds;
                    return (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-500 ${
                          revealed ? "bg-pink-100 text-pink-600 blur-none" : "bg-gray-200 text-transparent blur-[4px]"
                        }`}
                      >
                        {tier.label}: {tier.value}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Slider */}
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
                  <span>₹300</span>
                  <span className="text-2xl text-gray-900 font-black">₹{guess}</span>
                  <span>₹10000</span>
                </div>
                <input 
                  type="range" 
                  min="300" max="10000" step="50"
                  value={guess}
                  onChange={(e) => setGuess(Number(e.target.value))}
                  className="custom-slider"
                  disabled={status !== "shown"}
                />
                
                <button
                  onClick={handleSubmit}
                  disabled={status !== "shown"}
                  className="relative w-full overflow-hidden bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-xl uppercase tracking-wide active:scale-95 transition-all shadow-md group"
                >
                  <div 
                    className="absolute inset-0 bg-[#FF3E6C] transition-all duration-100 ease-linear"
                    style={{ width: `${timerPct}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>Submit Guess</span>
                    {status === "shown" && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm">
                        {Math.max(0, Math.ceil(60 - elapsed))}s
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* BACK FACE (Reveal) */}
          <div 
            className="absolute inset-0 bg-white rounded-2xl shadow-2xl border border-rose-100 flex flex-col items-center justify-center p-6 text-center pointer-events-auto" 
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            {revealData ? (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="w-full">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Actual Price</p>
                  <p className="text-4xl font-black text-[#282c3f]">₹{revealData.actual_price}</p>
                  <p className={`text-sm mt-1 font-bold ${revealData.deviation_pct <= 0.1 ? 'text-green-500' : 'text-amber-500'}`}>
                    Your guess: ₹{revealData.guess_amount}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Accuracy</p>
                    <p className="text-xl font-black text-gray-800">+{revealData.base_points}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Speed Bonus</p>
                    <p className="text-xl font-black text-gray-800">+{revealData.speed_bonus_points}</p>
                  </div>
                </div>

                <div className="space-y-2 w-full flex flex-col items-center">
                  <p className="text-xs text-gray-400 font-medium italic">"{revealData.social_proof_line}"</p>
                  
                  <div className="relative mt-2">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-black text-lg shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                      <span>+{revealData.total_points}</span>
                      <span className="text-xs tracking-wider uppercase opacity-90">Coins</span>
                    </div>
                    {revealData.streak_count > 1 && (
                      <span className="absolute -top-3 -right-6 bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce">
                        Streak Multiplier x{1 + revealData.streak_count * 0.1}!
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={onAdvance}
                  className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 shadow-md transition-all active:scale-95"
                >
                  Next Item
                </button>
              </div>
            ) : (
              <div className="animate-pulse w-full h-full bg-gray-100 rounded-2xl"></div>
            )}
          </div>
        </motion.div>

        {/* Overlays for swipe feedback - placed outside the flipping div so they show on both faces */}
        <motion.div 
          className="absolute inset-0 z-[100] flex items-center justify-center rounded-2xl bg-pink-500/80 pointer-events-none"
          style={{ opacity: leftOpacity }}
        >
          <Heart className="w-32 h-32 text-white animate-pulse" fill="white" />
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 z-[100] flex items-center justify-center rounded-2xl bg-red-500/80 pointer-events-none"
          style={{ opacity: rightOpacity }}
        >
          <ThumbsDown className="w-32 h-32 text-white" fill="white" />
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 z-[100] flex items-center justify-center rounded-2xl bg-yellow-400/80 pointer-events-none"
          style={{ opacity: upOpacity }}
        >
          <span className="text-white text-3xl font-black uppercase tracking-widest bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm">Skip</span>
        </motion.div>
      </motion.div>
    </>
  );
}
