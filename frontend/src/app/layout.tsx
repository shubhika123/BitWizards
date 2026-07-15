"use client";

import { Assistant } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ShoppingBag } from "lucide-react";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const MyntraLogo = ({ className = "w-5.5 h-5.5" }: { className?: string }) => (
  <svg viewBox="10 5 80 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 68 C14 68 12 55 18 35 C24 15 31 10 35 10 C39 10 41 16 38 30 C34 50 30 68 22 68 Z" fill="#E71B5A" opacity="0.95" />
    <path d="M48 68 C40 68 30 50 35 10 C39 10 42 20 44 35 C46 50 56 68 48 68 Z" fill="#F15A24" opacity="0.9" />
    <path d="M52 68 C44 68 42 55 48 35 C54 15 61 10 65 10 C69 10 71 16 68 30 C64 50 60 68 52 68 Z" fill="#F37021" opacity="0.9" />
    <path d="M78 68 C70 68 60 50 65 10 C69 10 72 20 74 35 C76 50 86 68 78 68 Z" fill="#E71B5A" opacity="0.95" />
  </svg>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname() || "/";

  return (
    <html
      lang="en"
      className={`${assistant.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg viewBox='10 5 80 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M22 68 C14 68 12 55 18 35 C24 15 31 10 35 10 C39 10 41 16 38 30 C34 50 30 68 22 68 Z' fill='%23E71B5A' opacity='0.95'/%3E%3Cpath d='M48 68 C40 68 30 50 35 10 C39 10 42 20 44 35 C46 50 56 68 48 68 Z' fill='%23F15A24' opacity='0.9'/%3E%3Cpath d='M52 68 C44 68 42 55 48 35 C54 15 61 10 65 10 C69 10 71 16 68 30 C64 50 60 68 52 68 Z' fill='%23F37021' opacity='0.9'/%3E%3Cpath d='M78 68 C70 68 60 50 65 10 C69 10 72 20 74 35 C76 50 86 68 78 68 Z' fill='%23E71B5A' opacity='0.95'/%3E%3C/svg%3E" />
      </head>
      <body className="min-h-full bg-[#0b1329] flex items-center justify-center p-0 sm:p-6 select-none font-sans overflow-hidden">
        
        {/* SMARTPHONE DEVICE BEZEL SHELL */}
        <div className="w-full max-w-[400px] h-screen sm:h-[830px] bg-white rounded-none sm:rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] border-0 sm:border-[12px] sm:border-black ring-4 ring-zinc-900 relative flex flex-col z-10">
          
          {/* Ring/Silent Switch */}
          <div className="absolute top-24 -left-[15px] w-[3px] h-6 bg-zinc-800 rounded-l shadow-[inset_1px_0_1px_rgba(255,255,255,0.2)] hidden sm:block z-50"></div>
          {/* Volume Up */}
          <div className="absolute top-36 -left-[15px] w-[3px] h-12 bg-zinc-800 rounded-l shadow-[inset_1px_0_1px_rgba(255,255,255,0.2)] hidden sm:block z-50"></div>
          {/* Volume Down */}
          <div className="absolute top-52 -left-[15px] w-[3px] h-12 bg-zinc-800 rounded-l shadow-[inset_1px_0_1px_rgba(255,255,255,0.2)] hidden sm:block z-50"></div>
          {/* Side Button / Power */}
          <div className="absolute top-44 -right-[15px] w-[3px] h-18 bg-zinc-800 rounded-r shadow-[inset_-1px_0_1px_rgba(255,255,255,0.2)] hidden sm:block z-50"></div>
 
          {/* iPhone Dynamic Island */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.1)] border border-zinc-900">
            <div className="w-2.5 h-2.5 bg-[#0f0f15] rounded-full border border-zinc-800 flex items-center justify-center">
              <div className="w-1 h-1 bg-[#1d4ed8] rounded-full"></div>
            </div>
            <div className="w-8 h-1 bg-zinc-900 rounded-full"></div>
          </div>
 
          {/* INNER SCREEN CONTAINER WRAPPER */}
          <div className="w-full h-full flex flex-col overflow-hidden rounded-none sm:rounded-[38px] bg-white relative transform translate-x-0">
            
            {/* iOS Status Bar */}
            <div className="w-full bg-[#fff0eb] h-8 px-5 pt-2 flex items-center justify-between text-[10px] font-black text-gray-800 shrink-0 select-none z-40 border-b border-orange-100/50">
              <span>23:50</span>
              <div className="flex items-center gap-1.5">
                {/* Alarm */}
                <span className="text-[7px] bg-amber-500/10 text-amber-800 px-1 py-0.2 rounded font-extrabold uppercase scale-90">ALARM</span>
                {/* Cell Signal */}
                <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 11.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                </svg>
                {/* Battery */}
                <div className="w-5 h-2.5 border border-gray-800 rounded-sm p-0.5 flex items-center">
                  <div className="w-1 h-full bg-red-500 rounded-2xs animate-pulse"></div>
                  <span className="text-[6px] font-extrabold ml-0.5">2%</span>
                </div>
              </div>
            </div>
 
            {/* Scrollable Children Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-transparent scrollbar-none pb-1">
              {children}
            </div>

            {/* Bottom Mobile Navigation Bar */}
            <nav className="w-full h-14 bg-white border-t border-gray-150 flex items-center justify-around z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] select-none shrink-0 px-2 pb-1">
              {/* Home Tab */}
              <Link href="/" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/" ? "text-[#ff3f6c]" : "text-gray-400 hover:text-[#ff3f6c]"}`}>
                <MyntraLogo className="w-5.5 h-5.5" />
                <span className="text-[8.5px] font-extrabold tracking-wider uppercase">Home</span>
              </Link>

              {/* Genie Stylist Tab */}
              <Link href="/genie" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/genie" ? "text-[#ff3f6c]" : "text-gray-450 hover:text-[#ff3f6c]"}`}>
                <Sparkles className="w-4.5 h-4.5" />
                <span className="text-[8.5px] font-bold tracking-wider uppercase mt-0.5">Genie AI</span>
              </Link>

              {/* Bharat Feed Tab */}
              <Link href="/bharat-feed" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/bharat-feed" ? "text-[#ff3f6c]" : "text-gray-450 hover:text-[#ff3f6c]"}`}>
                <span className="text-[10px] font-black italic tracking-tighter">fwd</span>
                <span className="text-[8.5px] font-bold tracking-wider uppercase">Bharat</span>
              </Link>

              {/* Luxe Tab */}
              <Link href="/" className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-400 hover:text-[#ff3f6c]">
                <span className="text-[9px] font-serif tracking-widest font-black uppercase">LUXE</span>
                <span className="text-[8.5px] font-bold tracking-wider uppercase">Luxury</span>
              </Link>

              {/* Bag Tab */}
              <Link href="/" className="flex flex-col items-center gap-0.5 cursor-pointer text-gray-400 hover:text-[#ff3f6c]">
                <ShoppingBag className="w-4.5 h-4.5" />
                <span className="text-[8.5px] font-bold tracking-wider uppercase">Bag</span>
              </Link>
            </nav>
 
            {/* iOS Home Indicator Bar */}
            <div className="w-full bg-white py-2 shrink-0 flex items-center justify-center z-40">
              <div className="w-32 h-1 bg-zinc-300 rounded-full"></div>
            </div>
 
          </div>
 
        </div>
 
      </body>
    </html>
  );
}
