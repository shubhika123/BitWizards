"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Package, 
  Heart, 
  CreditCard, 
  Sliders, 
  Plus, 
  Star, 
  Settings, 
  FileText, 
  LogOut, 
  Briefcase, 
  Gift, 
  Sparkles,
  Calendar
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function MyProfile() {
  const { user, logout, initAuth } = useAuthStore();
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [height, setHeight] = useState(162);
  const [weight, setWeight] = useState(58);
  const [size, setSize] = useState("S");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [simulatedDate, setSimulatedDate] = useState<string>("");
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedDate = localStorage.getItem("simulated_date") || localStorage.getItem("profileSelectedDate") || "";
    setSimulatedDate(savedDate);
    setSelectedDate(savedDate);
  }, []);

  const handleDateChange = (val: string) => {
    setSelectedDate(val);
    setSimulatedDate(val);
    if (val) {
      localStorage.setItem("profileSelectedDate", val);
      localStorage.setItem("simulated_date", val);
    } else {
      localStorage.removeItem("profileSelectedDate");
      localStorage.removeItem("simulated_date");
    }
    window.dispatchEvent(new Event("storage"));
  };



  // Initialize auth session and load settings
  useEffect(() => {
    initAuth();

    const saved = localStorage.getItem("dummySettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.height) setHeight(parsed.height);
        if (parsed.weight) setWeight(parsed.weight);
        if (parsed.size) setSize(parsed.size);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save preferences to localStorage
  const handleSavePreferences = () => {
    const settings = { height, weight, size };
    localStorage.setItem("dummySettings", JSON.stringify(settings));
    setShowPreferenceModal(false);
    // Dispatch a storage event to alert other pages if open
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen flex flex-col font-sans relative">
      {/* 1. Profile Header */}
      <header className="w-full sticky top-0 z-40 bg-white px-3 py-2.5 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <span className="font-extrabold text-sm text-gray-800 tracking-wide">My Profile</span>
        </div>
        <div className="flex items-center gap-2">

          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10.5px] font-black shadow-3xs">
            <span className="w-4 h-3 bg-emerald-600 rounded-xs text-white text-[6px] flex items-center justify-center font-bold">₹</span>
            ₹0
          </div>
          <button className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-[10.5px] font-bold text-gray-700 shadow-3xs hover:bg-gray-50">
            <HelpCircle className="w-3.5 h-3.5 text-gray-500" /> Help
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pb-16">
        
        {/* 2. Topographic Avatar Banner */}
        <div className="w-full bg-gradient-to-b from-[#e8e9ff] via-[#f0f2ff] to-[#f5f5f7] py-8 flex flex-col items-center select-none relative overflow-hidden shrink-0 border-b border-indigo-50/50">
          {/* Subtle concentric SVG lines for topographic effect */}
          <svg className="absolute inset-0 w-full h-full text-indigo-500/5 pointer-events-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="40%" r="50" stroke="currentColor" strokeWidth="1" />
            <circle cx="50%" cy="40%" r="80" stroke="currentColor" strokeWidth="1" />
            <circle cx="50%" cy="40%" r="120" stroke="currentColor" strokeWidth="1" />
            <circle cx="50%" cy="40%" r="170" stroke="currentColor" strokeWidth="1" />
            <circle cx="50%" cy="40%" r="230" stroke="currentColor" strokeWidth="1" />
          </svg>

          {/* Avatar circle */}
          <div className="w-18 h-18 rounded-full bg-white shadow-md flex items-center justify-center relative z-10 border border-indigo-100">
            <span className="text-xl font-black text-[#ff3f6c]">{(user?.name || "Shubhika").charAt(0).toUpperCase()}</span>
          </div>

          <h2 className="text-base font-extrabold text-gray-800 mt-3 relative z-10 tracking-wide">
            {user?.name || "Shubhika"}
          </h2>

          {/* Glam Clan & Insider capsule buttons */}
          <div className="flex gap-2.5 mt-4 relative z-10 w-full px-4 justify-center">
            {/* Glam Clan */}
            <div className="bg-white rounded-full py-1.5 px-4 shadow-3xs border border-gray-150 flex items-center justify-between gap-1.5 cursor-pointer hover:bg-gray-50 scale-95">
              <span className="text-[10px] font-black text-amber-600 tracking-wider">GLAM CLAN</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Myntra Insider */}
            <div className="bg-white rounded-full py-1.5 px-4 shadow-3xs border border-gray-150 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-gray-50 scale-95">
              <div className="flex items-center gap-1">
                <span className="text-[#ff3f6c] text-[10px] font-black">M</span>
                <span className="text-amber-700 text-[10px] font-bold tracking-tight">INSIDER</span>
                <span className="text-[9px] text-gray-500 font-medium">Join</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 3. Shubhika's Preferences Card */}
        <div className="mx-3.5 -mt-2.5 relative z-25 bg-white rounded-2xl border border-gray-150 shadow-sm p-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-sm flex items-center justify-center select-none shadow-3xs">
                {(user?.name || "Shubhika").charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-extrabold text-[#282c3f] text-sm">{user?.name || "Shubhika"}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-gray-400 font-semibold">{user?.age || 23} Yrs</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-[9px] text-gray-400 font-semibold">{user?.city || "Bengaluru"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="text-[9px] text-gray-400 font-semibold truncate max-w-[120px]">{user?.phone || "+91 9876543210"}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowPreferenceModal(true)}
              className="flex items-center gap-0.5 text-gray-550 border border-gray-250 hover:bg-gray-50 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-3xs cursor-pointer"
            >
              <Plus className="w-3 h-3 text-gray-500" /> Add
            </button>
          </div>

          <div className="w-full h-[1px] bg-gray-100"></div>

          {/* Target/Special Date selection */}
          <div className="flex items-center justify-between p-1 rounded-lg transition-colors relative">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#ff3f6c]" />
              <div>
                <h5 className="text-[11.5px] font-black text-gray-800">Target / Special Date</h5>
                <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "No date selected"}
                </p>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowCustomCalendar(!showCustomCalendar)}
                className="flex items-center justify-center gap-0.5 bg-[#ff3f6c] hover:bg-[#e0355c] text-white border border-[#ff3f6c] rounded-lg px-3 py-1 text-[10px] font-black shadow-3xs cursor-pointer active:scale-95 transition-transform"
              >
                Choose Date
              </button>

              {showCustomCalendar && (
                <div className="absolute right-0 top-9 z-50 bg-white border border-gray-150 rounded-xl shadow-lg p-3.5 w-64 select-none">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentCalendarMonth === 0) {
                          setCurrentCalendarMonth(11);
                          setCurrentCalendarYear(currentCalendarYear - 1);
                        } else {
                          setCurrentCalendarMonth(currentCalendarMonth - 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-650"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <span className="text-xs font-black text-gray-800">
                      {new Date(currentCalendarYear, currentCalendarMonth).toLocaleString("default", { month: "long" })} {currentCalendarYear}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentCalendarMonth === 11) {
                          setCurrentCalendarMonth(0);
                          setCurrentCalendarYear(currentCalendarYear + 1);
                        } else {
                          setCurrentCalendarMonth(currentCalendarMonth + 1);
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-650"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1.5">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {/* Padding cells */}
                    {[...Array(new Date(currentCalendarYear, currentCalendarMonth, 1).getDay())].map((_, i) => (
                      <span key={`pad-${i}`} />
                    ))}
                    {/* Actual day cells */}
                    {[...Array(new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate())].map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                      const isSelected = selectedDate === dateStr;
                      const isToday = new Date().toDateString() === new Date(currentCalendarYear, currentCalendarMonth, dayNum).toDateString();
                      
                      return (
                        <button
                          key={`day-${dayNum}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDateChange(dateStr);
                            setShowCustomCalendar(false);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
                            isSelected 
                              ? "bg-[#ff3f6c] text-white" 
                              : isToday
                                ? "border border-[#ff3f6c] text-[#ff3f6c] hover:bg-[#fff0f3]"
                                : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100 text-[10px] font-black">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateChange("");
                        setShowCustomCalendar(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                        handleDateChange(todayStr);
                        setCurrentCalendarMonth(today.getMonth());
                        setCurrentCalendarYear(today.getFullYear());
                        setShowCustomCalendar(false);
                      }}
                      className="text-[#ff3f6c] hover:text-[#e0355c]"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-100"></div>

          {/* Preferences list item */}
          <div 
            onClick={() => setShowPreferenceModal(true)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50/50 p-1 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-gray-500" />
              <div>
                <h5 className="text-[11.5px] font-black text-gray-800">Shubhika's Preferences</h5>
                <p className="text-[9.5px] text-gray-400 font-semibold mt-0.5">Basic Details, Size, Hair & Colour Match</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 4. Main Links List */}
        <div className="mx-3.5 mt-4 bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden select-none shrink-0 text-xs font-bold text-gray-700">
          {/* My Orders */}
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Package className="w-4.5 h-4.5 text-gray-500" />
              <span>My Orders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Wishlist */}
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Heart className="w-4.5 h-4.5 text-gray-500" />
              <span>Wishlist</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Cashback Promo */}
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4.5 h-4.5 text-gray-500" />
              <span>Get 7.5% Cashback on Myntra</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          {/* Personal Loan */}
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4.5 h-4.5 text-gray-500" />
              <span>Personal Loan</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>        {/* 5. Rewards & Coupons Section */}
        <div className="mx-3.5 mt-4 bg-white rounded-2xl border border-gray-150 shadow-sm p-4 flex flex-col gap-3.5 shrink-0 select-none">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Rewards & Coupons</h4>
          
          {/* Horizontal widgets */}
          <div className="flex gap-2.5 w-full">

            {/* MynCash */}
            <div className="flex-1 bg-gray-50 border border-gray-150 rounded-xl p-2.5 flex flex-col hover:bg-gray-100 cursor-pointer transition-colors justify-between">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">MynCash</span>
              <span className="text-[11px] font-black text-gray-800 mt-1">₹0</span>
            </div>
            {/* Coupons */}
            <div className="flex-1 bg-gray-50 border border-gray-150 rounded-xl p-2.5 flex flex-col hover:bg-gray-100 cursor-pointer transition-colors justify-between">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Coupons</span>
              <span className="text-[11px] font-black text-gray-800 mt-1">4 Active</span>
            </div>
          </div>
 
          <div className="w-full h-[1px] bg-gray-100"></div>
 
          {/* Gift Cards */}
          <div className="flex items-center justify-between hover:bg-gray-50 cursor-pointer p-1 rounded-lg transition-colors text-xs font-bold text-gray-700">
            <div className="flex items-center gap-3">
              <Gift className="w-4.5 h-4.5 text-gray-500" />
              <span>Gift Cards</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>



        {/* 6. Payments & Currencies / Manage Accordions */}
        <div className="mx-3.5 mt-4 bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden select-none shrink-0 text-xs font-bold text-gray-700">
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <span>Payments & Currencies</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer">
            <span>Manage Account & Address</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 7. Bottom Utilities List */}
        <div className="mx-3.5 mt-4 bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden select-none shrink-0 text-xs font-bold text-gray-700">
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <span>Help Centre</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <span>Myntra Suggests</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
            <span>Settings</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 cursor-pointer">
            <span>Legal & Policies</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 8. Log out Button */}
        <div className="mx-3.5 mt-6 flex flex-col gap-2 shrink-0 select-none">
          <button 
            onClick={async () => {
              await logout();
              window.location.href = "/";
            }}
            className="border border-rose-350 text-[#ff3f6c] hover:bg-rose-50 text-xs font-black py-3 rounded-lg text-center cursor-pointer tracking-wider uppercase transition-all shadow-3xs"
          >
            LOG OUT
          </button>
          <span className="text-[8px] font-bold text-gray-400 text-center tracking-wide uppercase">
            APP VERSION 4.2606.43
          </span>
        </div>

      </main>

      {/* 9. Interactive Preference Modal */}
      {showPreferenceModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end justify-center select-none animate-fade-in">
          {/* Overlay click to close */}
          <div onClick={() => setShowPreferenceModal(false)} className="absolute inset-0" />
          
          {/* Modal Container */}
          <div className="relative bg-white w-full rounded-t-3xl p-5 border-t border-gray-150 z-10 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wide">Edit Twin Preferences</h3>
              <button 
                onClick={() => setShowPreferenceModal(false)}
                className="text-gray-400 hover:text-gray-650 text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Height Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Height (cm)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="140" 
                  max="195" 
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="flex-1 accent-[#ff3f6c] cursor-pointer"
                />
                <span className="text-xs font-black text-[#282c3f] border border-gray-200 px-2 py-0.5 rounded min-w-[50px] text-center bg-gray-50">{height} cm</span>
              </div>
            </div>

            {/* Weight Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Weight (kg)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="40" 
                  max="110" 
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="flex-1 accent-[#ff3f6c] cursor-pointer"
                />
                <span className="text-xs font-black text-[#282c3f] border border-gray-200 px-2 py-0.5 rounded min-w-[50px] text-center bg-gray-50">{weight} kg</span>
              </div>
            </div>

            {/* Size Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Garment Size</label>
              <div className="flex gap-2">
                {["XS", "S", "M", "L", "XL"].map((sz) => (
                  <button 
                    key={sz}
                    onClick={() => setSize(sz)}
                    className={`flex-1 text-center py-2.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                      size === sz 
                        ? "border-[#ff3f6c] bg-pink-50 text-[#ff3f6c] shadow-3xs" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSavePreferences}
              className="bg-gradient-to-r from-[#ff3f6c] to-[#ff6b8b] hover:from-[#e02f59] hover:to-[#f05275] text-white text-xs font-extrabold w-full py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all cursor-pointer text-center"
            >
              Save Twin Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
