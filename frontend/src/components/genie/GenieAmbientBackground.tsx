"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  { src: "/genie/a.jpg", label: "modern" as const },
  { src: "/genie/b.jpg", label: "tradition" as const },
  { src: "/genie/c.jpg", label: "modern" as const },
  { src: "/genie/d.jpg", label: "tradition" as const },
  { src: "/genie/e.jpg", label: "tradition" as const },
  { src: "/genie/f.jpg", label: "tradition" as const }
];

const CYCLE_MS = 10000;

export function GenieAmbientBackground() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.12 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.src})` }}
          />
        </motion.div>
      </AnimatePresence>

      {slide.label === "tradition" && (
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff3f6c' fill-opacity='1'%3E%3Cpath d='M30 30c0-8 6-14 14-14v4c-5.5 0-10 4.5-10 10s4.5 10 10 10v4c-8 0-14-6-14-14zm0 0c0 8-6 14-14 14v-4c5.5 0 10-4.5 10-10S11.5 20 6 20v-4c8 0 14 6 14 14z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      )}

      <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
    </div>
  );
}
