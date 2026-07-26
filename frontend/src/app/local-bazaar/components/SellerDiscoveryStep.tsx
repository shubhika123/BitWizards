import React from "react";
import { useBazaarStore } from "../../../store/useBazaarStore";
import { MapPin, BadgeCheck, Clock, Navigation, Sparkles } from "lucide-react";
import BazaarSearchBar from "./BazaarSearchBar";

export default function SellerDiscoveryStep() {
  const {
    boutiques,
    themeColors,
    setStep,
  } = useBazaarStore();

  const accent = themeColors?.hexColor || "#ff3f6c";

  return (
    <div className="w-full flex flex-col pb-24 overflow-y-auto animate-fade-in bg-gray-50/50 min-h-screen">
      {/* Search Bar — high z so typeahead sits above theme banner */}
      <div className="px-3.5 py-4 sticky top-0 z-50 bg-gray-50/90 backdrop-blur-md border-b border-gray-100">
        <BazaarSearchBar variant="discover" />
      </div>

      {/* Theme banner */}
      {themeColors && (
        <div
          className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-gray-100 relative z-0 flex flex-col p-4 select-none min-h-[170px] text-left shadow-3xs"
          style={{ backgroundColor: "#fffdf5" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl z-0">
            <div
              className="absolute inset-0 z-10 w-[45%]"
              style={{ backgroundImage: "linear-gradient(to right, #fffdf5, transparent)" }}
            />
            <img
              src={themeColors.bannerImg}
              alt={themeColors.bannerTitle}
              className="w-full h-full object-cover object-right scale-105"
            />
          </div>

          {/* Circular festive seal */}
          {themeColors.bannerBadge && (
            <div
              className="absolute top-3 right-3 z-10 text-white rounded-full w-[56px] h-[56px] flex flex-col items-center justify-center text-center shadow-md rotate-6 leading-tight border border-white/40"
              style={{ backgroundColor: accent }}
            >
              <span className="text-[7.5px] font-black uppercase tracking-wide">
                {themeColors.bannerBadge.split(" ")[0]}
              </span>
              <span className="text-[6.5px] font-extrabold uppercase text-white/90">
                {themeColors.bannerBadge.split(" ").slice(1).join(" ") || "Special"}
              </span>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-start w-[62%]">
            {themeColors.bannerTag && (
              <span className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: accent }}>
                {themeColors.bannerTag}
              </span>
            )}
            <h2 className="text-xl font-black leading-tight tracking-tight text-[#282c3f] whitespace-pre-line">
              {themeColors.bannerTitle}
              {themeColors.bannerHighlight && <span style={{ color: accent }}>{themeColors.bannerHighlight}</span>}
            </h2>
            <p className="text-[10px] font-bold mt-1.5 leading-snug text-slate-600 max-w-[95%]">
              {themeColors.bannerDesc}
            </p>

            <button
              className="mt-4 px-4 py-2 rounded-xl text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform text-white"
              style={{ backgroundColor: accent }}
            >
              <Sparkles className="w-3.5 h-3.5" /> {themeColors.bannerBtn}
            </button>
          </div>
        </div>
      )}

      {/* Sellers List */}
      <div className="px-3.5 py-2">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-lg font-black text-[#282c3f] tracking-tight">
            Sellers Near You
          </h2>
        </div>

        {boutiques.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
            <MapPin className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No sellers found</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              We couldn't find any sellers delivering to your current location right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-1">
            {[...boutiques].sort((a, b) => a.distance - b.distance).slice(0, 6).map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  useBazaarStore.getState().fetchSellerShop(b.id);
                  setStep(1.7);
                }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md hover:border-gray-200 relative overflow-hidden group"
              >
                {/* Simulated Image Area */}
                <div className="aspect-[4/5] w-full bg-gradient-to-br from-pink-50/50 to-orange-50/50 relative flex items-center justify-center overflow-hidden">
                   {b.image ? (
                     <img 
                       src={b.image} 
                       alt={b.name} 
                       className="w-full h-full object-cover absolute inset-0 z-0" 
                       onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                     />
                   ) : (
                     <div className="text-pink-200 z-0">
                       <BadgeCheck className="w-12 h-12 opacity-40" />
                     </div>
                   )}
                   
                   <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded text-[10px] font-black border border-white shadow-sm flex items-center gap-0.5 z-10">
                     {b.rating} <span className="text-green-600 text-[9px]">★</span>
                   </div>
                   
                   <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-pink-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-white shadow-sm flex items-center gap-1 z-10">
                     <Clock className="w-2.5 h-2.5 text-pink-500" />
                     {b.deliveryTime || "Same-day"}
                   </div>
                </div>

                {/* Details Area */}
                <div className="p-2.5 flex flex-col gap-0.5 bg-white">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-[#282c3f] text-[13px] leading-tight line-clamp-1">
                      {b.name}
                    </h3>
                    {b.verified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                    {b.speciality}
                  </p>
                  
                  <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold mt-1">
                    <Navigation className="w-3 h-3 text-slate-400" />
                    {b.distance} km away
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
