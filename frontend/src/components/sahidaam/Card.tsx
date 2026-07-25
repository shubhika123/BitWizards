"use client";

import React, { useState, useEffect, useEffectEvent, useCallback, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { Heart, ThumbsDown } from "lucide-react";
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
  onFlipChange?: (isFlipping: boolean) => void;
}

const FLIP_EASE = [0.4, 0, 0.2, 1] as const;

type ConfettiParticle = {
  id: number;
  tx: number;
  ty: number;
  color: string;
  delay: number;
  rotation: number;
};

export function Card({ card, isActive, onSwipe, onAdvance, onFlipChange }: Props) {
  const [status, setStatus] = useState<"pending" | "shown" | "submitted" | "dismissed">("pending");
  const [localShownAt, setLocalShownAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [guess, setGuess] = useState<number>(Math.round(card.actual_price * 0.8));
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const [showRevealFX, setShowRevealFX] = useState(false);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const submittingRef = useRef(false);
  const sliderAdjustmentsRef = useRef(0);
  const firstInteractAtRef = useRef<number | null>(null);

  const { user } = useAuthStore();
  const userId = user?.uid || "demo_user_123";

  const handleSliderChange = (value: number) => {
    setGuess(value);
    if (status !== "shown") return;
    sliderAdjustmentsRef.current += 1;
    if (firstInteractAtRef.current == null && localShownAt != null) {
      firstInteractAtRef.current = Date.now();
    }
  };

  // Drag layer — only x/y/rotateZ live here (never rotateY)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotateZ = useTransform(x, [-200, 200], [-12, 12]);

  const leftOpacity = useTransform(x, [0, -150], [0, 1]);
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);
  const upOpacity = useTransform(y, [0, -150], [0, 1]);

  // Flip layer — dedicated rotateY motion value (GPU, no spring)
  const rotateY = useMotionValue(0);

  // Swipe before guess + after reveal; lock only while the flip is running
  const canDrag =
    isActive &&
    !isFlipAnimating &&
    (status === "shown" || (status === "submitted" && flipped));

  useEffect(() => {
    if (isActive && status === "pending") {
      fetch(`${API_BASE_URL}/api/sahidaam/deck/card/${card.id}/shown`, {
        method: "POST",
        headers: { "X-User-Id": userId },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.shown_at) {
            setStatus("shown");
            setLocalShownAt(Date.now());
          }
        })
        .catch(console.error);
    }
  }, [isActive, status, card.id, userId]);

  const spawnConfetti = useCallback(() => {
    const colors = ["#FF3E6C", "#f59e0b", "#282c3f", "#fda4af", "#fbbf24"];
    setParticles(
      Array.from({ length: 10 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 70 + 30;
        return {
          id: i,
          tx: Math.cos(angle) * velocity,
          ty: Math.sin(angle) * velocity - 40,
          color: colors[i % colors.length],
          delay: Math.random() * 0.12,
          rotation: Math.random() * 360,
        };
      })
    );
  }, []);

  const settleOnBackFace = useCallback(async () => {
    const current = rotateY.get();
    // Back face is visible at 180 + 360k — pick the next such angle ahead of current.
    let target = 180 + 360 * Math.ceil((current - 180) / 360);
    if (target < current + 45) target += 360;

    await animate(rotateY, target, {
      duration: 0.4,
      ease: FLIP_EASE,
    });

    setIsFlipAnimating(false);
    onFlipChange?.(false);
    setShowRevealFX(true);
    spawnConfetti();
  }, [onFlipChange, rotateY, spawnConfetti]);

  const handleSubmit = async () => {
    if (status !== "shown" || submittingRef.current) return;
    submittingRef.current = true;
    setStatus("submitted");

    x.set(0);
    y.set(0);
    setIsFlipAnimating(true);
    onFlipChange?.(true);
    setFlipped(true);

    let spinning = true;
    let angle = rotateY.get();

    // Keep rotating at varying speed until the API returns.
    const spinLoop = (async () => {
      while (spinning) {
        const segment = 100 + Math.random() * 120; // 100–220°
        const duration = 0.5 + Math.random() * 0.35; // varying, gentler speed
        angle += segment;
        await animate(rotateY, angle, {
          duration,
          ease: "linear",
        });
      }
    })();

    try {
      const hesitationSeconds =
        localShownAt != null
          ? ((firstInteractAtRef.current ?? Date.now()) - localShownAt) / 1000
          : elapsed;

      const res = await fetch(`${API_BASE_URL}/api/sahidaam/deck/card/${card.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          guess_amount: guess,
          slider_adjustments: sliderAdjustmentsRef.current,
          hesitation_seconds: Math.max(0, Math.round(hesitationSeconds * 10) / 10),
        }),
      });
      const data: RevealData = await res.json();
      if (!res.ok || data.actual_price == null) {
        throw new Error("Submit failed");
      }

      spinning = false;
      await spinLoop;

      setRevealData(data);
      // Paint populated back face before settling onto it
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await settleOnBackFace();
    } catch (err) {
      console.error(err);
      spinning = false;
      await spinLoop;
      await animate(rotateY, 0, {
        duration: 0.35,
        ease: FLIP_EASE,
      });
      submittingRef.current = false;
      setFlipped(false);
      setIsFlipAnimating(false);
      setStatus("shown");
      onFlipChange?.(false);
    }
  };

  const submitOnTimeout = useEffectEvent(() => {
    void handleSubmit();
  });

  useEffect(() => {
    if (!isActive || status !== "shown" || !localShownAt) return;

    let reqId: number;
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const el = (Date.now() - localShownAt) / 1000;
      setElapsed(el);
      if (el >= 60) {
        submitOnTimeout();
      } else {
        reqId = requestAnimationFrame(loop);
      }
    };
    reqId = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(reqId);
    };
  }, [isActive, status, localShownAt]);

  const handleDragEnd = async (_e: unknown, info: PanInfo) => {
    const { x: ox, y: oy } = info.offset;
    const { x: vx, y: vy } = info.velocity;

    if (ox < -100 || vx < -500) {
      await Promise.all([
        animate(x, -360, { duration: 0.28, ease: FLIP_EASE }),
        animate(opacity, 0, { duration: 0.28, ease: FLIP_EASE }),
      ]);
      handleSwipeAction("wishlist");
    } else if (ox > 100 || vx > 500) {
      await Promise.all([
        animate(x, 360, { duration: 0.28, ease: FLIP_EASE }),
        animate(opacity, 0, { duration: 0.28, ease: FLIP_EASE }),
      ]);
      handleSwipeAction("unrecommend");
    } else if (oy < -100 || vy < -500) {
      await Promise.all([
        animate(y, -360, { duration: 0.28, ease: FLIP_EASE }),
        animate(opacity, 0, { duration: 0.28, ease: FLIP_EASE }),
      ]);
      handleSwipeAction("dismiss");
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
      animate(y, 0, { type: "spring", stiffness: 400, damping: 28 });
    }
  };

  const handleSwipeAction = (action: string) => {
    if (status !== "submitted") setStatus("dismissed");

    fetch(`${API_BASE_URL}/api/sahidaam/deck/card/${card.id}/swipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({ action }),
    }).catch(console.error);

    onAdvance();
  };

  const timerPct = Math.max(0, 100 - (elapsed / 60) * 100);

  return (
    <>
      <style>{`
        .custom-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 28px;
          margin: 0;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        .custom-slider:focus {
          outline: none;
        }
        .custom-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #fce7f3;
          border-radius: 999px;
          border: 1px solid #f9a8d4;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #ff3f6c;
          cursor: pointer;
          margin-top: -8px;
          box-shadow: 0 2px 8px rgba(255, 63, 108, 0.45);
          border: 2px solid #ffffff;
        }
        .custom-slider::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #fce7f3;
          border-radius: 999px;
          border: 1px solid #f9a8d4;
        }
        .custom-slider::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #ff3f6c;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 63, 108, 0.45);
          border: 2px solid #ffffff;
        }
        .custom-slider:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
        .custom-slider-track {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 8px;
          border-radius: 999px;
          background: #fce7f3;
          border: 1px solid #f9a8d4;
          pointer-events: none;
          z-index: 0;
        }
        .custom-slider-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          border-radius: 999px;
          background: #ff3f6c;
          opacity: 0.35;
        }
        @keyframes sahiPillShimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .sahi-pill-shimmer {
          background-image: linear-gradient(
            110deg,
            rgba(255,255,255,0.15) 0%,
            rgba(255,255,255,0.35) 45%,
            rgba(255,255,255,0.15) 90%
          );
          background-size: 200% 100%;
          animation: sahiPillShimmer 2.8s linear infinite;
        }
        @keyframes revealConfetti {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          25% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--tx) * 1.2), calc(var(--ty) + 120px)) rotate(calc(var(--rot) * 2)) scale(0.6);
            opacity: 0;
          }
        }
        .reveal-confetti {
          animation: revealConfetti 1.1s ease-out forwards;
        }
        .sahi-face {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
        .sahi-face-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Perspective shell — static, no Framer animate on this node */}
      <div
        className="relative w-[85vw] max-w-[380px] h-[65vh] min-h-[480px] max-h-[650px]"
        style={{ perspective: "1200px", WebkitPerspective: "1200px" }}
      >
        {/* Drag shell — x / y / rotateZ only */}
        <motion.div
          className="relative w-full h-full rounded-2xl"
          drag={canDrag}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          style={{
            x,
            y,
            rotateZ,
            opacity,
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            touchAction: canDrag ? "none" : undefined,
            cursor: canDrag ? "grab" : undefined,
          }}
          whileTap={canDrag ? { cursor: "grabbing" } : undefined}
        >
          {/* 3D scene */}
          <div
            className="relative w-full h-full"
            style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
          >
            {/* Flipper — rotateY only via motion value */}
            <motion.div
              className="relative w-full h-full"
              style={{
                rotateY,
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
                willChange: "transform",
              }}
            >
              {/* FRONT */}
              <div className="sahi-face absolute inset-0 bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl pointer-events-auto">
                <div className="relative h-1/2 w-full bg-gray-50 flex-shrink-0">
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
                    <div className="relative overflow-hidden text-white font-bold text-sm bg-black/35 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      <span className="relative z-10">Sahi Daam?</span>
                      <span className="absolute inset-0 sahi-pill-shimmer pointer-events-none opacity-70" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-0 w-full flex justify-between px-4 text-white opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs bg-black/40 px-2 py-1 rounded-full">
                      <ThumbsDown className="w-3 h-3 inline" /> Unrecommend
                    </span>
                    <span className="text-xs bg-black/40 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 inline" /> Wishlist
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#282c3f] leading-tight line-clamp-2">{card.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {card.detail_tiers.map((tier, idx) => {
                        const revealed = elapsed >= tier.reveal_at_seconds;
                        return (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-500 ${
                              revealed
                                ? "bg-pink-100 text-[#FF3E6C] blur-none"
                                : "bg-gray-200 text-transparent blur-[4px]"
                            }`}
                          >
                            {tier.label}: {tier.value}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center text-gray-500 text-xs font-bold">
                      <span>₹300</span>
                      <span className="text-2xl text-[#282c3f] font-black">₹{guess}</span>
                      <span>₹10000</span>
                    </div>
                    <div className="relative w-full h-7 flex items-center">
                      <div className="custom-slider-track" aria-hidden>
                        <div
                          className="custom-slider-fill"
                          style={{
                            width: `${Math.max(0, Math.min(100, ((guess - 300) / (10000 - 300)) * 100))}%`,
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min="300"
                        max="10000"
                        step="50"
                        value={guess}
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                        className="custom-slider"
                        disabled={status !== "shown"}
                      />
                    </div>
                    <button
                      onClick={() => void handleSubmit()}
                      disabled={status !== "shown"}
                      className="relative w-full overflow-hidden bg-gray-200 disabled:bg-gray-200 disabled:cursor-wait disabled:opacity-80 text-white font-bold py-3.5 rounded-xl uppercase tracking-wide active:scale-[0.98] transition-transform shadow-md"
                    >
                      <div
                        className="absolute inset-0 bg-[#FF3E6C] transition-[width] duration-100 ease-linear"
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

              {/* BACK — always mounted (artwork until data) so mid-flip doesn't remount DOM */}
              <div className="sahi-face sahi-face-back absolute inset-0 bg-white rounded-2xl shadow-2xl border border-rose-100 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {showRevealFX && (
                  <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                    {particles.map((p) => (
                      <div
                        key={p.id}
                        className="absolute w-2 h-2 rounded-sm reveal-confetti"
                        style={{
                          backgroundColor: p.color,
                          ["--tx" as string]: `${p.tx}px`,
                          ["--ty" as string]: `${p.ty}px`,
                          ["--rot" as string]: `${p.rotation}deg`,
                          animationDelay: `${p.delay}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {revealData ? (
                  <div className="space-y-6 w-full flex flex-col items-center relative z-10 pointer-events-none">
                    <div className="w-full">
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Actual Price</p>
                      <p className="text-4xl font-black text-[#282c3f]">₹{revealData.actual_price}</p>
                      <p
                        className={`text-sm mt-1 font-bold ${
                          revealData.deviation_pct <= 0.1 ? "text-emerald-500" : "text-amber-500"
                        }`}
                      >
                        Your guess: ₹{revealData.guess_amount}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Accuracy</p>
                        <p className="text-xl font-black text-[#282c3f]">+{revealData.base_points}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Speed Bonus</p>
                        <p className="text-xl font-black text-[#282c3f]">+{revealData.speed_bonus_points}</p>
                      </div>
                    </div>

                    <div className="space-y-2 w-full flex flex-col items-center">
                      <p className="text-xs text-gray-400 font-medium italic">
                        &ldquo;{revealData.social_proof_line}&rdquo;
                      </p>
                      <div className="relative mt-2">
                        <motion.div
                          initial={false}
                          animate={
                            showRevealFX
                              ? { scale: [0.92, 1.06, 1], opacity: 1 }
                              : { scale: 1, opacity: 1 }
                          }
                          transition={{ duration: 0.4, ease: FLIP_EASE, times: [0, 0.55, 1] }}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-[#FF3E6C] text-white px-6 py-2 rounded-full font-black text-lg shadow-[0_0_15px_rgba(255,62,108,0.35)]"
                        >
                          <span>+{revealData.total_points}</span>
                          <span className="text-xs tracking-wider uppercase opacity-90">Coins</span>
                        </motion.div>
                        {revealData.streak_count > 1 && (
                          <span className="absolute -top-3 -right-6 bg-[#FF3E6C] text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md animate-bounce">
                            Streak Multiplier x{1 + revealData.streak_count * 0.1}!
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={onAdvance}
                      className="pointer-events-auto w-full mt-4 py-3 bg-[#282c3f] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#1a1d2b] shadow-md transition-transform active:scale-[0.98]"
                    >
                      Next Item
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-white pointer-events-none flex items-center justify-center p-4">
                    <img
                      src="/guess.png"
                      alt=""
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {canDrag && (
            <>
              <motion.div
                className="absolute inset-0 z-[100] flex items-center justify-center rounded-2xl bg-pink-500/80 pointer-events-none"
                style={{ opacity: leftOpacity }}
              >
                <Heart className="w-32 h-32 text-white" fill="white" />
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
                <span className="text-white text-3xl font-black uppercase tracking-widest bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm">
                  Skip
                </span>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
