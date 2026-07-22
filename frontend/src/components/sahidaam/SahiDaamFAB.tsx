"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { SahiDaamModal } from "./SahiDaamModal";

export function SahiDaamFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<{ points_balance: number; streak_count: number } | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sahidaam/rewards/summary")
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => console.error("Failed to fetch Sahi Daam stats:", err));
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-center">
        {stats && (
          <div className="absolute bottom-full mb-2 whitespace-nowrap bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            🔥 {stats.streak_count} Day Streak • 🪙 {stats.points_balance} pts
          </div>
        )}
        <button
          onClick={handleOpen}
          className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl bg-gradient-to-br from-[#FF3E6C] to-rose-500 text-white hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <Sparkles className="w-6 h-6" />
          <span className="absolute inset-0 rounded-full animate-ping shadow-[0_0_15px_#eab308] opacity-50 border-2 border-yellow-400 pointer-events-none"></span>
        </button>
      </div>

      {isOpen && <SahiDaamModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
