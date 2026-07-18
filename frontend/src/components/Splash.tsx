// components/Splash.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Splash() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-36 h-36 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      >
        {/* Official Myntra capital M overlapping curves */}
        <svg viewBox="10 5 80 70" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 68 C14 68 12 55 18 35 C24 15 31 10 35 10 C39 10 41 16 38 30 C34 50 30 68 22 68 Z" fill="#ec008c" opacity="0.95" />
          <path d="M48 68 C40 68 30 50 35 10 C39 10 42 20 44 35 C46 50 56 68 48 68 Z" fill="#f26522" opacity="0.9" />
          <path d="M52 68 C44 68 42 55 48 35 C54 15 61 10 65 10 C69 10 71 16 68 30 C64 50 60 68 52 68 Z" fill="#f37021" opacity="0.9" />
          <path d="M78 68 C70 68 60 50 65 10 C69 10 72 20 74 35 C76 50 86 68 78 68 Z" fill="#ec008c" opacity="0.95" />
        </svg>
      </motion.div>
    </div>
  );
}
