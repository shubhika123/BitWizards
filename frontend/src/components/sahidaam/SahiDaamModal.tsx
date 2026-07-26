"use client";

import React, { useEffect, useState } from "react";
import { CardDeck } from "./CardDeck";
import { useAuthStore } from "../../store/authStore";

import { API_BASE_URL } from "@/lib/apiConfig";

interface Props {
  onClose: () => void;
}

const SPARKS = [
  { top: "18%", left: "12%", delay: "0s", size: 3 },
  { top: "28%", left: "82%", delay: "0.6s", size: 2 },
  { top: "62%", left: "8%", delay: "1.1s", size: 2.5 },
  { top: "70%", left: "88%", delay: "0.3s", size: 3 },
  { top: "42%", left: "90%", delay: "1.4s", size: 2 },
  { top: "78%", left: "22%", delay: "0.9s", size: 2 },
  { top: "22%", left: "48%", delay: "1.7s", size: 2 },
  { top: "85%", left: "55%", delay: "0.4s", size: 2.5 },
];

export function SahiDaamModal({ onClose }: Props) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    const userId = user?.uid || "demo_user_123";
    fetch(`${API_BASE_URL}/api/sahidaam/deck/today`, {
      headers: {
        "X-User-Id": userId,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setCards(data.cards);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch deck:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes sahiSparkDrift {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.25; }
          50% { transform: translateY(-14px) scale(1.35); opacity: 0.7; }
        }
        .sahi-spark {
          animation: sahiSparkDrift 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* Dark base + warm carnival vignette */}
      <div className="absolute inset-0 bg-black/78 backdrop-blur-md pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(255,62,108,0.18) 0%, rgba(251,191,36,0.08) 35%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(40,44,63,0.5) 0%, transparent 55%)",
        }}
      />

      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="sahi-spark absolute rounded-full pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: i % 2 === 0 ? "#FF3E6C" : "#fbbf24",
            boxShadow: `0 0 6px ${i % 2 === 0 ? "rgba(255,62,108,0.6)" : "rgba(251,191,36,0.55)"}`,
            animationDelay: s.delay,
          }}
        />
      ))}

      <div
        className="w-full h-full flex flex-col items-center justify-center mt-16 relative z-10"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-[#ff3f6c] rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-300 animate-pulse">Building your deck...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-center px-6">
            <span className="text-4xl mb-2">🤔</span>
            <p className="font-bold text-white">Oops, something went wrong.</p>
            <p className="text-xs text-gray-400">
              Failed to load today&apos;s Sahi Daam deck. Check if the server is running.
            </p>
          </div>
        ) : (
          <CardDeck initialCards={cards} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
