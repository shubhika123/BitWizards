"use client";

import React, { useState, useCallback } from "react";
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

/** Fixed fan offsets for cards behind the active one (peek from top). */
const STACK_LAYERS = [
  { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 },
  { scale: 0.97, x: 10, y: -16, rotate: 5, opacity: 0.92 },
  { scale: 0.94, x: -14, y: -30, rotate: -8, opacity: 0.85 },
] as const;

export function CardDeck({ initialCards, onClose }: Props) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleAdvance = useCallback(() => {
    setIsFlipping(false);
    setTimeout(() => {
      setCards((prev) => prev.slice(1));
    }, 280);
  }, []);

  const handleSwipe = (_action: string) => {
    // Swipe logic is handled inside Card (network calls).
  };

  const handleFlipChange = useCallback((flipping: boolean) => {
    setIsFlipping(flipping);
  }, []);

  if (cards.length === 0) {
    return <EndOfDeckSummary onClose={onClose} />;
  }

  const visibleCards = cards.slice(0, 3);

  return (
    <div className="relative w-full flex-1 h-full min-h-[500px] flex items-center justify-center [perspective:1200px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {[...visibleCards].reverse().map((card, idx, arr) => {
          const index = arr.length - 1 - idx;
          const isActive = index === 0;
          const layer = STACK_LAYERS[index] ?? STACK_LAYERS[STACK_LAYERS.length - 1];
          const zIndex = 10 - index;

          // Mid-flip: next cards visible through edge-on flip, but blurred
          const behindBlur = !isActive
            ? isFlipping
              ? index === 1
                ? 6
                : 10
              : index === 1
                ? 0.5
                : 1.5
            : 0;

          const behindBrightness = !isActive ? (isFlipping ? 0.72 : 0.88) : 1;

          return (
            <motion.div
              key={card.id}
              initial={{ scale: 0.88, opacity: 0, y: 40, rotate: 0 }}
              animate={{
                scale: layer.scale,
                x: layer.x,
                y: layer.y,
                rotate: layer.rotate,
                opacity: layer.opacity,
                zIndex,
              }}
              exit={{
                scale: 1.05,
                opacity: 0,
                y: -40,
                transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="absolute flex items-center justify-center"
              style={{
                pointerEvents: isActive ? "auto" : "none",
                // CSS filter — no Framer spring on blur (that was fighting the flip)
                filter: `blur(${behindBlur}px) brightness(${behindBrightness})`,
                transition: "filter 280ms ease",
                willChange: "transform, filter",
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
              }}
            >
              <Card
                card={card}
                isActive={isActive}
                onSwipe={handleSwipe}
                onAdvance={handleAdvance}
                onFlipChange={isActive ? handleFlipChange : undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
