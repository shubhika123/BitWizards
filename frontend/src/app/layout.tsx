"use client";

import { Assistant } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ShoppingBag, Users, Store } from "lucide-react";

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
      <body className="min-h-screen flex flex-col bg-white text-[#282c3f] font-sans antialiased overflow-x-hidden">
        
        {/* Scrollable Children Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-transparent pb-16">
          {children}
        </div>

        {/* Bottom Mobile Navigation Bar - Fixed at viewport base */}
        <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-150 flex items-center justify-around z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] select-none shrink-0 px-2 pb-1">
          {/* Home Tab */}
          <Link href="/" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/" ? "text-[#ff3f6c]" : "text-gray-400 hover:text-[#ff3f6c]"}`}>
            <MyntraLogo className="w-5.5 h-5.5" />
            <span className="text-[8.5px] font-extrabold tracking-wider uppercase">Home</span>
          </Link>

          {/* Apna Bazaar Tab */}
          <Link href="/local-bazaar" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/local-bazaar" ? "text-[#ff3f6c]" : "text-gray-400 hover:text-[#ff3f6c]"}`}>
            <Store className="w-4.5 h-4.5" />
            <span className="text-[8.5px] font-bold tracking-wider uppercase">Apna Bazaar</span>
          </Link>

          {/* Outfit Circle Tab */}
          <Link href="/OutfitCircle" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/OutfitCircle" ? "text-[#ff3f6c]" : "text-gray-400 hover:text-[#ff3f6c]"}`}>
            <Users className="w-4.5 h-4.5" />
            <span className="text-[8.5px] font-bold tracking-wider uppercase">Circle</span>
          </Link>

          {/* Bag Tab */}
          <Link href="/bag" className={`flex flex-col items-center gap-0.5 cursor-pointer ${pathname === "/bag" ? "text-[#ff3f6c]" : "text-gray-400 hover:text-[#ff3f6c]"}`}>
            <ShoppingBag className="w-4.5 h-4.5" />
            <span className="text-[8.5px] font-bold tracking-wider uppercase">Bag</span>
          </Link>
        </nav>

      </body>
    </html>
  );
}
