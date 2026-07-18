"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BagPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans select-none">
      {/* 1. Myntra Checkout Funnel Header */}
      <header className="w-full bg-white px-4 py-3 border-b border-[#eaeaec] flex items-center justify-between sticky top-0 z-30">
        {/* Left: Back Link */}
        <div className="w-12 flex items-center justify-start">
          <Link href="/" className="p-1 hover:bg-gray-50 rounded-full cursor-pointer transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
        </div>

        {/* Center: Funnel Steps */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-[10.5px] font-black tracking-widest uppercase select-none">
          <span className="text-[#14b8a6] border-b-2 border-[#14b8a6] pb-1 cursor-pointer">BAG</span>
          <span className="text-gray-300 font-normal text-[8px] sm:text-[10px]">----------</span>
          <span className="text-gray-400 cursor-default">ADDRESS</span>
          <span className="text-gray-300 font-normal text-[8px] sm:text-[10px]">----------</span>
          <span className="text-gray-400 cursor-default">PAYMENT</span>
        </div>

        {/* Right: Secure Checkout Icon */}
        <div className="w-12 flex items-center justify-end">
          <svg className="w-4.5 h-4.5 text-emerald-500 fill-current opacity-80" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-28 text-center bg-white">
        {/* Floating Pink Bag Illustration */}
        <div className="relative w-56 h-56 mb-4.5 flex items-center justify-center">
          <svg className="w-full h-full drop-shadow-[0_8px_16px_rgba(255,63,108,0.08)]" viewBox="0 -40 200 210" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wind Lines (Left) */}
            <path d="M 30 102 h 16 a 4 4 0 1 0 0 -8 a 4 4 0 0 0 -4 4" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 28 110 h 8" stroke="#4a5568" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            
            {/* Ground Shadow */}
            <ellipse cx="110" cy="165" rx="32" ry="2.5" fill="#f1f5f9" />

            {/* Rotated & Floating Shopping Bag group */}
            <g transform="rotate(6, 110, 95)" className="animate-bounce" style={{ animationDuration: '3s' }}>
              {/* Handle */}
              <path d="M 97 50 v -18 a 13 13 0 0 1 26 0 v 18" stroke="#4a5568" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              
              {/* Bag Body */}
              <path d="M 85 50 h 50 a 6 6 0 0 1 6 5.5 l -6 78 a 8 8 0 0 1 -8 7.5 H 93 a 8 8 0 0 1 -8 -7.5 l -6 -78 a 6 6 0 0 1 6 -5.5 z" fill="#ff3f6c" />
              
              {/* Eyelets */}
              <circle cx="97" cy="50" r="2.5" fill="#ffffff" stroke="#4a5568" strokeWidth="1.2" />
              <circle cx="123" cy="50" r="2.5" fill="#ffffff" stroke="#4a5568" strokeWidth="1.2" />
              
              {/* Center Official White Logo */}
              <g transform="translate(91, 78) scale(0.38)">
                <path d="M22 68 C14 68 12 55 18 35 C24 15 31 10 35 10 C39 10 41 16 38 30 C34 50 30 68 22 68 Z" fill="#ffffff" />
                <path d="M48 68 C40 68 30 50 35 10 C39 10 42 20 44 35 C46 50 56 68 48 68 Z" fill="#ffffff" />
                <path d="M52 68 C44 68 42 55 48 35 C54 15 61 10 65 10 C69 10 71 16 68 30 C64 50 60 68 52 68 Z" fill="#ffffff" />
                <path d="M78 68 C70 68 60 50 65 10 C69 10 72 20 74 35 C76 50 86 68 78 68 Z" fill="#ffffff" />
              </g>
            </g>
          </svg>
        </div>

        {/* Text Details */}
        <h2 className="text-[#282c3f] text-base font-black tracking-wide">
          Hey, it feels so light!
        </h2>
        <p className="text-gray-400 text-[11px] font-semibold mt-2 max-w-[280px] leading-relaxed">
          There is nothing in your bag. Let's add some items.
        </p>

        {/* Wishlist Redirect Button */}
        <Link 
          href="/profile"
          className="mt-8 px-6 py-3.5 border border-[#ff3f6c] hover:bg-[#fff0f2] text-[#ff3f6c] text-[10.5px] font-black uppercase tracking-wider rounded-xs shadow-3xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Add Items From Wishlist
        </Link>
      </main>
    </div>
  );
}
