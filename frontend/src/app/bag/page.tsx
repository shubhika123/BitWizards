"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

export default function BagPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans select-none">
      {/* Sticky Header */}
      <header className="w-full bg-white px-4 py-3.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </Link>
          <span className="font-extrabold text-[13px] text-gray-800 tracking-wider uppercase">
            Shopping Bag
          </span>
        </div>
        <button className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
          <Heart className="w-5 h-5 text-gray-800" />
        </button>
      </header>

      {/* Main Empty State Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center">
        {/* Floating Pink Bag Illustration */}
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
          
          {/* Wind Lines on the left (SVG) */}
          <div className="absolute left-2 top-[48%] -translate-y-1/2 select-none pointer-events-none opacity-40">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M2 10h10a3 3 0 0 0 3-3" />
              <path d="M4 16h8" />
            </svg>
          </div>

          {/* Pink Shopping Bag with bounce animation */}
          <div className="relative w-28 h-36 bg-gradient-to-b from-[#ff3f6c] to-[#ff1e56] rounded-2xl shadow-[0_12px_24px_rgba(255,63,108,0.15)] flex flex-col items-center justify-center transform rotate-6 animate-bounce" style={{ animationDuration: '3s' }}>
            
            {/* Bag Handle */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-10 border-[3.5px] border-gray-700 rounded-t-full bg-transparent" />
            
            {/* White Signature "M" Logo */}
            <div className="flex items-end justify-center w-12 h-10 select-none">
              <svg className="w-full h-full text-white fill-current" viewBox="0 0 24 24">
                <path d="M4 18h2.5V8.5L10 14l3.5-5.5V18H16V6h-2.5L10 11.5 6.5 6H4v12z" />
              </svg>
            </div>
          </div>

          {/* Ground shadow beneath the bag */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-2 bg-gray-150 rounded-full blur-[2.5px] opacity-70 animate-pulse" />
        </div>

        {/* Text Details */}
        <h2 className="text-[#282c3f] text-base font-black tracking-wide">
          Hey, it feels so light!
        </h2>
        <p className="text-gray-400 text-[11px] font-medium mt-2 max-w-[280px] leading-relaxed">
          There is nothing in your bag. Let's add some items.
        </p>

        {/* Action Button to go back home */}
        <Link 
          href="/"
          className="mt-7 px-8 py-3 bg-[#ff3f6c] hover:bg-[#e6325c] text-white text-[10.5px] font-black uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          Add Items From Home
        </Link>
      </main>
    </div>
  );
}
