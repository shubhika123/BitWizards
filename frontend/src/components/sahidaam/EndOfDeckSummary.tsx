"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "@/lib/apiConfig";

interface Props {
  onClose: () => void;
}

type RewardsSummary = {
  points_balance: number;
  streak_count: number;
  points_earned_today?: number;
};

export function EndOfDeckSummary({ onClose }: Props) {
  const { user } = useAuthStore();
  const [rewards, setRewards] = useState<RewardsSummary | null>(null);
  const [particles, setParticles] = useState<
    { id: number; tx: number; ty: number; color: string; delay: number; rotation: number }[]
  >([]);

  useEffect(() => {
    const colors = ["#FF3E6C", "#f59e0b", "#282c3f", "#fda4af", "#fbbf24"];
    setParticles(
      Array.from({ length: 28 }).map((_, i) => {
        const angle = Math.random() * Math.PI + Math.PI;
        const velocity = Math.random() * 130 + 40;
        return {
          id: i,
          tx: Math.cos(angle) * velocity,
          ty: Math.sin(angle) * velocity,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.2,
          rotation: Math.random() * 360,
        };
      })
    );
  }, []);

  useEffect(() => {
    const userId = user?.uid || "demo_user_123";
    fetch(`${API_BASE_URL}/api/sahidaam/rewards/summary`, {
      headers: { "X-User-Id": userId },
    })
      .then((res) => res.json())
      .then((data) => setRewards(data))
      .catch(console.error);
  }, [user?.uid]);

  const coinsEarned = rewards?.points_earned_today ?? 0;
  const totalCoins = rewards?.points_balance ?? 0;

  return (
    <>
      <style>{`
        @keyframes confettiDrop {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--tx) * 1.4), calc(var(--ty) + 320px)) rotate(calc(var(--rot) * 3)) scale(0.75);
            opacity: 0;
          }
        }
        .confetti-particle {
          animation: confettiDrop 2.2s ease-out forwards;
        }
      `}</style>

      <div className="relative w-full h-full flex items-center justify-center px-5 pointer-events-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2.5 h-2.5 rounded-sm confetti-particle"
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

        <div className="relative z-10 w-full max-w-[340px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-rose-100 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#FF3E6C] via-amber-400 to-[#FF3E6C]" />

          <div className="px-6 pt-8 pb-7 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-white shadow-md flex items-center justify-center -mt-2 mb-5 ring-1 ring-amber-100">
              <span className="text-4xl" aria-hidden>
                🪙
              </span>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF3E6C] mb-2">
              Sahi Daam
            </p>
            <h2 className="text-2xl font-black text-[#282c3f] tracking-tight">Deck Completed!</h2>

            <div className="mt-5 w-full rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 px-4 py-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-700/80">
                Coins earned today
              </p>
              <p className="mt-1 text-3xl font-black text-amber-700 tabular-nums">+{coinsEarned}</p>
              {totalCoins > 0 && (
                <p className="mt-1 text-[11px] font-semibold text-amber-800/70">
                  Total balance: {totalCoins} coins
                </p>
              )}
            </div>

            <p className="mt-4 text-sm font-medium text-gray-600 leading-relaxed max-w-[260px]">
              Come tomorrow for the next challenge and keep your streak alive!
            </p>

            <button
              onClick={onClose}
              className="mt-7 w-full bg-[#FF3E6C] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(255,62,108,0.35)] hover:bg-[#e63560] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
