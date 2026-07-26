"use client";

import React, { useEffect, useState } from "react";
import { SahiDaamModal } from "./SahiDaamModal";
import { useAuthStore } from "../../store/authStore";

import { API_BASE_URL } from "@/lib/apiConfig";

type FabPhase = "logo" | "streak" | "coins";

type RewardsSummary = {
  points_balance: number;
  streak_count: number;
  played_today?: boolean;
  points_earned_today?: number;
};

export function SahiDaamFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<RewardsSummary | null>(null);
  const [phase, setPhase] = useState<FabPhase>("logo");

  const { user } = useAuthStore();

  useEffect(() => {
    const userId = user?.uid || "demo_user_123";
    fetch(`${API_BASE_URL}/api/sahidaam/rewards/summary`, {
      headers: {
        "X-User-Id": userId,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error("Failed to fetch Sahi Daam stats:", err));
  }, [isOpen, user?.uid]);

  const showCoins = Boolean(stats?.played_today && (stats?.points_balance ?? 0) > 0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const schedule = (next: FabPhase, ms: number) => {
      timeout = setTimeout(() => {
        if (!cancelled) setPhase(next);
      }, ms);
    };

    if (phase === "logo") {
      schedule("streak", 7000);
    } else if (phase === "streak") {
      schedule(showCoins ? "coins" : "logo", 3000);
    } else {
      schedule("logo", 3000);
    }

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [phase, showCoins]);

  // If coins phase becomes unavailable mid-cycle, snap back to logo
  useEffect(() => {
    if (phase === "coins" && !showCoins) {
      setPhase("logo");
    }
  }, [phase, showCoins]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-center">
        <button
          onClick={handleOpen}
          className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl bg-white border border-gray-100 hover:scale-105 active:scale-95 transition-all outline-none overflow-hidden"
        >
          {phase === "streak" ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 animate-in fade-in duration-300">
              <span className="text-[16px] leading-none">🔥</span>
              <span className="text-[12px] font-black text-orange-600 leading-none mt-0.5">
                {stats?.streak_count || 0}
              </span>
            </div>
          ) : phase === "coins" ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-amber-50 to-yellow-100 animate-in fade-in duration-300">
              <span className="text-[15px] leading-none" aria-hidden>
                🪙
              </span>
              <span className="text-[11px] font-black text-amber-700 leading-none mt-0.5 tabular-nums">
                {stats?.points_balance ?? 0}
              </span>
            </div>
          ) : (
            <img
              src="/guess.png"
              alt="Sahi Daam"
              className="w-full h-full object-cover animate-in fade-in duration-300"
            />
          )}
        </button>
      </div>

      {isOpen && <SahiDaamModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
