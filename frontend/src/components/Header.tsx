"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  Heart, 
  Bell,
  X
} from "lucide-react";
import { useGenieUiStore } from "../store/genieUiStore";
import { GenieEntryButton } from "./genie/GenieEntryButton";
import { useAuthStore } from "../store/authStore";
import { categories } from "../lib/Categories";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isGenieRoute = pathname.startsWith("/genie");
  const openGenie = useGenieUiStore((s) => s.openGenie);
  const setGenieButtonActive = useGenieUiStore((s) => s.setGenieButtonActive);

  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Daily Guessing Contest states
  const [showContest, setShowContest] = useState(false);
  const [guess, setGuess] = useState("");
  const [contestStatus, setContestStatus] = useState<{
    played: boolean;
    guessValue?: number;
    actualPrice?: number;
    coinsWon?: number;
    resultMsg?: string;
  }>({ played: false });

  // Dynamically build contest products from categories catalog to guarantee working images & matched prices
  const allCatalogProducts = categories.flatMap(cat => 
    cat.products.map(p => ({
      id: p.product_id,
      name: p.product_name,
      price: p.product_price,
      image_url: p.product_image_url,
      category: cat.name
    }))
  );

  const getTodayProduct = () => {
    const today = new Date();
    // Deterministic index per day
    const dayIndex = (today.getFullYear() * 365 + today.getMonth() * 30 + today.getDate()) % allCatalogProducts.length;
    return allCatalogProducts[dayIndex];
  };

  const todayProduct = getTodayProduct();

  // Load contest state on mount or when modal opens
  const checkContestState = () => {
    if (!user) {
      setContestStatus({ played: false });
      return;
    }
    const todayStr = new Date().toDateString();
    const userKey = user.uid;
    const lastPlayedDate = localStorage.getItem(`myntra_contest_last_played_date_${userKey}`);
    if (lastPlayedDate === todayStr) {
      setContestStatus({
        played: true,
        guessValue: Number(localStorage.getItem(`myntra_contest_last_guess_${userKey}`)),
        actualPrice: Number(localStorage.getItem(`myntra_contest_last_actual_${userKey}`)),
        coinsWon: Number(localStorage.getItem(`myntra_contest_last_won_coins_${userKey}`)),
        resultMsg: localStorage.getItem(`myntra_contest_last_result_msg_${userKey}`) || ""
      });
    } else {
      setContestStatus({ played: false });
    }
  };

  useEffect(() => {
    checkContestState();
  }, [showContest, user]);

  const handleSubmitGuess = () => {
    if (!user) {
      alert("Please log in to participate in the contest.");
      return;
    }
    const numericGuess = Number(guess);
    if (!guess.trim() || isNaN(numericGuess) || numericGuess <= 0) {
      alert("Please enter a valid positive MRP price.");
      return;
    }

    const actual = todayProduct.price;
    const diffPct = Math.abs(numericGuess - actual) / actual;
    
    let won = 2;
    let msg = "Incorrect guess! Keep trying.";
    if (numericGuess === actual) {
      won = 100;
      msg = "🎯 EXACT MATCH! Magnificent!";
    } else if (diffPct <= 0.05) {
      won = 50;
      msg = "🔥 SUPER CLOSE (within 5%)!";
    } else if (diffPct <= 0.10) {
      won = 20;
      msg = "⭐ GREAT GUESS (within 10%)!";
    } else if (diffPct <= 0.20) {
      won = 10;
      msg = "👍 CLOSE GUESS (within 20%)!";
    } else {
      won = 2;
      msg = "Good effort! You earned a participation reward.";
    }

    const userKey = user.uid;
    const currentCoins = Number(localStorage.getItem(`myntra_contest_coins_${userKey}`) || "0");
    const newCoins = currentCoins + won;
    const todayStr = new Date().toDateString();

    localStorage.setItem(`myntra_contest_coins_${userKey}`, String(newCoins));
    localStorage.setItem(`myntra_contest_last_played_date_${userKey}`, todayStr);
    localStorage.setItem(`myntra_contest_last_guess_${userKey}`, String(numericGuess));
    localStorage.setItem(`myntra_contest_last_actual_${userKey}`, String(actual));
    localStorage.setItem(`myntra_contest_last_won_coins_${userKey}`, String(won));
    localStorage.setItem(`myntra_contest_last_result_msg_${userKey}`, msg);

    // Store the guessed price for today's category
    try {
      const categoryGuesses = JSON.parse(localStorage.getItem(`myntra_contest_category_guesses_${userKey}`) || "{}");
      categoryGuesses[todayProduct.category] = numericGuess;
      localStorage.setItem(`myntra_contest_category_guesses_${userKey}`, JSON.stringify(categoryGuesses));
    } catch (err) {
      console.error("Failed to write category guess pricing:", err);
    }

    // Fire storage update
    window.dispatchEvent(new Event("storage"));

    setContestStatus({
      played: true,
      guessValue: numericGuess,
      actualPrice: actual,
      coinsWon: won,
      resultMsg: msg
    });
  };

  useEffect(() => {
    setGenieButtonActive(isGenieRoute);
  }, [isGenieRoute, setGenieButtonActive]);

  const handleGenieClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openGenie(searchQuery);
    const params = new URLSearchParams({ enter: "1" });
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    router.push(`/genie?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Normal search for: "${searchQuery}"`);
  };

  // Dynamic Theme Classes
  const headerBg = "bg-white border-b border-[#eaeaec]";
  const textColor = "text-[#282c3f]";
  const hoverBorderColor = "hover:border-[#ff3f6c]";
  const inputBg = "bg-[#f5f5f6] focus-within:bg-white focus-within:border-[#eaeaec]";
  const inputTextColor = "text-[#282c3f] placeholder-[#9496a2]";
  return (
    <>
      {/* HEADER CONTAINER */}
      <header className={`w-full sticky top-0 z-50 px-4 flex flex-col transition-colors duration-300 ${headerBg} py-3 gap-2.5 shrink-0`}>
        
        {/* ROW 1: Logo & Compact Actions */}
        <div className="flex items-center justify-between w-full gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Myntra Logo" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://images.indianexpress.com/2021/01/myntra-logo.jpg";
                }}
              />
            </Link>

            {/* Festive Live Tag */}
            <Link 
              href="/Category/Rakhi"
              className="flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-[#fffbf0] via-[#fff1f2] to-[#fffbf0] border-2 border-double border-amber-300 rounded-full text-[#9f1239] text-[7.5px] font-black tracking-widest uppercase shadow-3xs select-none min-w-0 animate-pulse"
            >
              <span className="truncate">🌸 RAKHI FESTIVAL LIVE 🌸</span>
            </Link>
          </div>

          {/* Compact Actions (Bell, Heart, Profile) */}
          <div className="flex items-center gap-3 text-[#282c3f] pr-1">
            {/* Daily Guess & Win Contest Trigger */}
            <button
              onClick={() => setShowContest(true)}
              className="relative flex items-center gap-1 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border border-amber-300 rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-900 shadow-2xs hover:shadow-xs hover:border-amber-400 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Daily Price Guessing Contest"
            >
              <span>🎯 MRP Master</span>
            </button>

            {/* Bell (Notification) */}
            <div className="relative p-1 hover:text-[#ff3f6c] transition-colors cursor-pointer">
              <Bell className="w-4.5 h-4.5 stroke-[1.5]" />
              <span className="absolute top-0 right-0 bg-[#ff3f6c] text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center scale-90">
                1
              </span>
            </div>

            {/* Wishlist */}
            <button className="p-1 hover:text-[#ff3f6c] transition-colors">
              <Heart className="w-4.5 h-4.5 stroke-[1.5]" />
            </button>

            {/* Profile */}
            <Link href="/profile" className="p-1 hover:text-[#ff3f6c] transition-colors cursor-pointer flex items-center gap-1 shrink-0">
              <User className="w-4.5 h-4.5 stroke-[1.5]" />
              {user && (
                <span className="text-[10px] font-black max-w-[55px] truncate text-gray-700 hover:text-[#ff3f6c]">
                  {user.name}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ROW 2: Search Bar + Genie entry */}
        <div className="w-full flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center min-w-0">
            <div className={`relative w-full flex items-center border border-transparent rounded-md transition-all ${inputBg}`}>
              <div className="pl-3 text-[#535766]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search for Rakhi, Gifts & more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 min-w-0 bg-transparent text-[13px] pl-2 pr-3 py-2.5 rounded-md focus:outline-none ${inputTextColor}`}
              />
            </div>
          </form>
          <GenieEntryButton active={isGenieRoute} onClick={handleGenieClick} />
        </div>
      </header>

      {showContest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative border border-rose-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowContest(false);
                setGuess("");
              }}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="text-lg">🎯</span>
              <div>
                <h3 className="text-sm font-black text-[#282c3f] uppercase tracking-wide">Daily Price Guessing Contest</h3>
                <span className="text-[8px] font-black text-[#ff3f6c] uppercase tracking-widest block">New Day, New Challenge</span>
              </div>
            </div>

            {/* Product Card for Guessing */}
            <div className="flex flex-col items-center bg-gray-50 border border-gray-100 rounded-2xl p-4 gap-2">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-white border border-gray-200 relative select-none">
                <img
                  src={todayProduct.image_url}
                  alt={todayProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center font-black text-white text-3xl select-none pointer-events-none">
                  ❓
                </div>
              </div>
              <span className="text-xs font-black text-gray-800 tracking-wide text-center">{todayProduct.name}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">{todayProduct.category}</span>
            </div>

            {!contestStatus.played ? (
              <div className="space-y-3">
                <p className="text-[10px] text-gray-500 font-semibold leading-relaxed text-center">
                  Guess the correct price of this item in ₹. Get closer to win up to 100 Myntra Coins!
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs font-black text-gray-400">₹</span>
                    <input
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter price guess"
                      type="number"
                      className="w-full border border-gray-200 rounded-xl pl-6 pr-3 py-2 text-xs outline-none focus:border-[#ff3f6c] transition-all font-bold"
                    />
                  </div>
                  <button
                    onClick={handleSubmitGuess}
                    className="bg-[#ff3f6c] text-white text-xs font-black px-4 py-2.5 rounded-xl uppercase tracking-wider hover:bg-[#e63560] active:scale-[0.98] transition-all"
                  >
                    Guess
                  </button>
                </div>

                {/* Score Chart */}
                <div className="bg-rose-50/50 border border-rose-100/50 rounded-xl p-2.5 text-[8.5px] font-semibold text-gray-500 grid grid-cols-2 gap-y-1">
                  <div className="font-black text-[#ff3f6c]">🎯 Exact Match: +100 Coins</div>
                  <div className="font-bold text-amber-700">🔥 Within 5%: +50 Coins</div>
                  <div className="font-bold text-gray-600">⭐ Within 10%: +20 Coins</div>
                  <div className="font-bold text-gray-500">👍 Within 20%: +10 Coins</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center gap-1">
                  <span className="text-[14px] font-black text-amber-800">{contestStatus.resultMsg}</span>
                  <span className="text-[10px] font-bold text-amber-600">
                    Your Guess: <b>₹{contestStatus.guessValue}</b> • Actual Price: <b>₹{contestStatus.actualPrice}</b>
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 border border-amber-300 text-amber-950 shadow-md">
                  <span className="text-[8px] font-black uppercase tracking-wider block">Coins Claimed</span>
                  <span className="text-xl font-black flex items-center gap-1 mt-0.5">
                    🪙 +{contestStatus.coinsWon} Coins
                  </span>
                </div>

                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  Thanks for playing today! New item drops tomorrow morning.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
