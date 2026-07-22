"use client";

import React, { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
}

export function EndOfDeckSummary({ onClose }: Props) {
  const [particles, setParticles] = useState<{id: number, tx: number, ty: number, color: string, delay: number, rotation: number}[]>([]);

  useEffect(() => {
    // Generate static CSS variables for confetti spread
    const colors = ["#FF3E6C", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];
    const newParticles = Array.from({ length: 40 }).map((_, i) => {
      // Randomize destination (spread outwards and downwards)
      const angle = (Math.random() * Math.PI) + Math.PI; // Upper semi-circle burst
      const velocity = Math.random() * 150 + 50;
      const tx = Math.cos(angle) * velocity;
      // Gravity will be applied via CSS animation
      const ty = Math.sin(angle) * velocity;
      
      return {
        id: i,
        tx,
        ty,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.2,
        rotation: Math.random() * 360
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <>
      <style>{`
        @keyframes confettiDrop {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--tx) * 1.5), calc(var(--ty) + 400px)) rotate(calc(var(--rot) * 3)) scale(0.8);
            opacity: 0;
          }
        }
        .confetti-particle {
          animation: confettiDrop 2.5s ease-out forwards;
        }
      `}</style>
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-in fade-in zoom-in-95 duration-700 ease-out relative w-full">
        
        {/* Simple DOM Confetti Generator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
          {particles.map(p => (
            <div 
              key={p.id}
              className="absolute w-3 h-3 rounded-sm confetti-particle"
              style={{
                backgroundColor: p.color,
                ['--tx' as any]: `${p.tx}px`,
                ['--ty' as any]: `${p.ty}px`,
                ['--rot' as any]: `${p.rotation}deg`,
                animationDelay: `${p.delay}s`
              }}
            />
          ))}
        </div>

        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center shadow-inner relative z-10 border-4 border-white">
          <span className="text-5xl">🎉</span>
        </div>
        
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl font-black text-[#282c3f]">Deck Completed!</h2>
          <p className="text-gray-500 font-medium px-4 max-w-[300px]">
            You've guessed all the prices today. Come back tomorrow for a new deck and keep your streak alive!
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-8 bg-[#FF3E6C] text-white font-bold py-3.5 px-12 rounded-full shadow-[0_8px_20px_rgba(255,62,108,0.3)] hover:bg-[#e63560] active:scale-95 transition-all relative z-10 uppercase tracking-widest text-sm"
        >
          Return to Home
        </button>
      </div>
    </>
  );
}
