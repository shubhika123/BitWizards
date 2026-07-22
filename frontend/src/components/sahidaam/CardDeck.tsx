"use client";

import React, { useState } from "react";
import { Card } from "./Card";
import { EndOfDeckSummary } from "./EndOfDeckSummary";

import { motion, AnimatePresence } from "framer-motion";

interface CardData {
  id: string;
  actual_price: number;
  name: string;
  image_url: string;
  detail_tiers: { reveal_at_seconds: number; label: string; value: string }[];
}

interface Props {
  initialCards: CardData[];
  onClose: () => void;
}

export function CardDeck({ initialCards, onClose }: Props) {
  const [cards, setCards] = useState<CardData[]>(initialCards);

  const handleAdvance = () => {
    // Small delay to allow exit animations to play
    setTimeout(() => {
      setCards(prev => prev.slice(1));
    }, 300);
  };

  const handleSwipe = (action: string) => {
    // Swipe logic is mostly handled inside Card (network calls). We just advance the stack.
  };

  if (cards.length === 0) {
    return <EndOfDeckSummary onClose={onClose} />;
  }

  // Render top 3 cards for a visual stack
  const visibleCards = cards.slice(0, 3);

  return (
    <div className="relative w-full flex-1 h-full min-h-[500px] flex items-center justify-center [perspective:1000px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {/* Render in reverse order so the first card is on top */}
        {[...visibleCards].reverse().map((card, idx, arr) => {
          // Reverse index so 0 is top
          const index = arr.length - 1 - idx;
          const isActive = index === 0;
          
          // Spec: 
          // index 0: scale 1, translateY: 0, zIndex 10
          // index 1: scale 0.95, translateY: 20px, opacity 0.7, zIndex 9
          // index 2: scale 0.90, translateY: 40px, opacity 0.4, zIndex 8
          
          const scale = 1 - index * 0.05;
          const yOffset = index * 20;
          const zIndex = 10 - index;
          const opacity = index === 0 ? 1 : index === 1 ? 0.7 : 0.4;
          
          return (
            <motion.div 
              key={card.id}
              layout
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ 
                scale, 
                y: yOffset, 
                opacity,
                zIndex 
              }}
              exit={{ scale: 1.1, opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="absolute flex items-center justify-center"
              style={{
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              <Card 
                card={card} 
                isActive={isActive} 
                onSwipe={handleSwipe} 
                onAdvance={handleAdvance}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
