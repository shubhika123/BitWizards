"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { SahiDaamModal } from "./SahiDaamModal";
import { useAuthStore } from "../../store/authStore";

export function SahiDaamFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<{ points_balance: number; streak_count: number } | null>(null);
  const [showStreak, setShowStreak] = useState(false);

  const { user } = useAuthStore();
  useEffect(() => {
    const userId = user?.uid || "demo_user_123";
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bitwizards.onrender.com";
    fetch(`${API_BASE_URL}/api/sahidaam/rewards/summary`, {
      headers: {
        "X-User-Id": userId
      }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error("Failed to fetch Sahi Daam stats:", err));
  }, [isOpen]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const cycle = () => {
      setShowStreak(false); // Show logo
      timeout = setTimeout(() => {
        setShowStreak(true); // Show streak
        timeout = setTimeout(cycle, 3000); // Streak duration 3s
      }, 7000); // Logo duration 7s
    };
    cycle();
    return () => clearTimeout(timeout);
  }, []);

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
          {showStreak ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-orange-50 to-amber-100 animate-in fade-in duration-300">
              <span className="text-[16px] leading-none">🔥</span>
              <span className="text-[12px] font-black text-orange-600 leading-none mt-0.5">{stats?.streak_count || 0}</span>
            </div>
          ) : (
            <img src="/guess.png" alt="Sahi Daam" className="w-full h-full object-cover animate-in fade-in duration-300" />
          )}
        </button>
      </div>

      {isOpen && <SahiDaamModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
