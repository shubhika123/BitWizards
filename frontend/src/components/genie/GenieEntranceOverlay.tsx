"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Footprints,
  Shirt,
  Gem,
  Watch,
  Sparkles,
} from "lucide-react";

const FLOAT_ITEMS = [
  { Icon: ShoppingBag, x: "12%", y: "18%", delay: 0, rotate: -12 },
  { Icon: Footprints, x: "78%", y: "22%", delay: 0.15, rotate: 8 },
  { Icon: Shirt, x: "22%", y: "62%", delay: 0.3, rotate: -6 },
  { Icon: Gem, x: "70%", y: "58%", delay: 0.2, rotate: 14 },
  { Icon: Watch, x: "48%", y: "12%", delay: 0.25, rotate: -4 },
  { Icon: ShoppingBag, x: "85%", y: "72%", delay: 0.35, rotate: 10 },
  { Icon: Shirt, x: "8%", y: "78%", delay: 0.4, rotate: -18 },
  { Icon: Sparkles, x: "52%", y: "78%", delay: 0.1, rotate: 0 },
];

type GenieEntranceOverlayProps = {
  onComplete: () => void;
  durationMs?: number;
};

export function GenieEntranceOverlay({
  onComplete,
  durationMs = 2200,
}: GenieEntranceOverlayProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(onComplete, durationMs);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [onComplete, durationMs]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f7] via-[#fffbf0] to-[#f5f0ff]" />

      {FLOAT_ITEMS.map(({ Icon, x, y, delay, rotate }, i) => (
        <motion.div
          key={i}
          className="absolute text-[#ff3f6c]/35"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.4, y: 40 }}
          animate={{
            opacity: [0.3, 0.55, 0.35],
            scale: [0.9, 1.1, 1],
            y: [0, -24, -8],
            rotate: [rotate, rotate + 8, rotate],
          }}
          transition={{
            duration: 2,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.25]" />
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4 px-8 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ff3f6c] to-[#ff6b8b] flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <p className="text-[#282c3f] text-base sm:text-lg font-semibold tracking-tight">
          Getting this ready for you…
        </p>
        <p className="text-[#535766] text-xs font-medium max-w-[240px] leading-relaxed">
          Curating styles with a touch of tradition and today&apos;s aesthetic
        </p>
      </motion.div>
    </motion.div>
  );
}
