"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CardDeck } from "./CardDeck";

interface Props {
  onClose: () => void;
}

export function SahiDaamModal({ onClose }: Props) {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/sahidaam/deck/today")
      .then(res => res.json())
      .then(data => {
        if (data.cards) {
          setCards(data.cards);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.error("Failed to fetch deck:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-lg animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      
      {/* Header: Fixed top bar */}
      <div className="fixed top-0 w-full flex justify-center items-center p-4 shadow-[0_4px_20px_rgba(255,62,108,0.15)] z-50 bg-black/20 pointer-events-none">
        <span className="text-[#FF3E6C] font-bold text-lg pointer-events-auto">🎯 Sahi Daam — GUESS THE PRICE</span>
      </div>

      {/* Content Area */}
      <div 
        className="w-full h-full flex flex-col items-center justify-center mt-16 relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-rose-200 border-t-[#ff3f6c] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-300 animate-pulse">Building your deck...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-center px-6">
            <span className="text-4xl mb-2">🤔</span>
            <p className="font-bold text-white">Oops, something went wrong.</p>
            <p className="text-xs text-gray-400">Failed to load today's Sahi Daam deck. Check if the server is running.</p>
          </div>
        ) : (
          <CardDeck initialCards={cards} onClose={onClose} />
        )}
      </div>
    </div>
  );
}
