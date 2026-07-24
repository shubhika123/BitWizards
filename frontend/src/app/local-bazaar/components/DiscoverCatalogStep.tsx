import React from "react";
import { Star, MapPin, Sparkles, ChevronRight, Loader2, Check } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";

export default function DiscoverCatalogStep() {
  const {
    activeCity,
    activeState,
    activeFestivalName,
    themeColors,
    boutiques,
    allProducts,
    activeCategory,
    setActiveCategory,
    selectedRadius,
    setSelectedRadius,
    bazaarLoading,
    setSelectedProduct,
    setStep,
  } = useBazaarStore();

  if (!themeColors) return null;

  const filteredProducts = activeCategory === "All"
    ? allProducts
    : allProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col font-sans">
      {/* Agnostic Theme Banner */}
      <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-gray-100 bg-white relative flex flex-col p-4 select-none min-h-[160px] text-left shadow-3xs" style={{ backgroundColor: themeColors.headerBg || "#fffdf5" }}>
        {/* Background Image on Right half */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl">
          <div className="absolute inset-0 bg-gradient-to-r z-10 w-[40%]" style={{ backgroundImage: `linear-gradient(to right, ${themeColors.headerBg || "#fffdf5"}, transparent)` }} />
          <img
            src={themeColors.bannerImg}
            alt={themeColors.bannerTitle}
            className="w-full h-full object-cover object-right scale-105"
          />
        </div>

        <div className="relative z-20 flex flex-col items-start w-[65%]">
          {themeColors.bannerBadge && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-3xs mb-2" style={{ backgroundColor: themeColors.headerText, color: "#fff" }}>
              {themeColors.bannerBadge}
            </span>
          )}
          <h2 className="text-xl font-black leading-tight tracking-tight mt-0.5" style={{ color: themeColors.headerText }}>
            {themeColors.bannerTitle}
          </h2>
          {themeColors.bannerHighlight && (
            <h2 className="text-[17px] font-black leading-tight" style={{ color: themeColors.bannerTag || themeColors.headerText }}>
              {themeColors.bannerHighlight}
            </h2>
          )}
          <p className="text-[10px] font-bold mt-1.5 leading-snug opacity-90 max-w-[90%]" style={{ color: themeColors.headerText }}>
            {themeColors.bannerDesc}
          </p>

          <button className="mt-4 px-4 py-2 rounded-xl text-xs font-black shadow-md uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-transform" style={{ backgroundColor: themeColors.bannerBtn || "#000", color: "#fff" }}>
            <Sparkles className="w-3.5 h-3.5" /> Start Exploring
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-5">
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x">
          <div
            onClick={() => setActiveCategory("All")}
            className={`flex flex-col items-center gap-2 cursor-pointer snap-start transition-all ${activeCategory === "All" ? "scale-105" : "opacity-70 saturate-50 grayscale-[30%] hover:opacity-100 hover:grayscale-0"}`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-3xs border transition-colors ${activeCategory === "All" ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white"}`}>
              <span className="text-xl font-bold">✨</span>
            </div>
            <span className={`text-[10px] font-black tracking-wide ${activeCategory === "All" ? "text-slate-800" : "text-gray-500"}`}>All</span>
          </div>

          {themeColors.categories?.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex flex-col items-center gap-2 cursor-pointer snap-start transition-all ${activeCategory === cat.name ? "scale-105" : "opacity-70 saturate-50 grayscale-[30%] hover:opacity-100 hover:grayscale-0"}`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-3xs border transition-colors overflow-hidden ${activeCategory === cat.name ? "border-[#ff3f6c] ring-2 ring-[#ff3f6c]/20" : "border-gray-200 bg-white"}`}>
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className={`text-[10px] font-black tracking-wide ${activeCategory === cat.name ? "text-slate-800" : "text-gray-500"}`}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {bazaarLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff3f6c]" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Local Bazaar...</span>
        </div>
      ) : (
        <>
          {/* Top Verified Boutiques */}
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">Verified Local Boutiques</h3>
              <span className="text-[10px] font-bold text-[#ff3f6c] uppercase tracking-wider flex items-center cursor-pointer hover:underline">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {boutiques.slice(0, 4).map((b) => (
                <div key={b.id} className="bg-white border border-gray-100 p-3 rounded-2xl shadow-3xs flex flex-col gap-1.5 relative overflow-hidden group">
                  <div className="flex items-start justify-between">
                    <span className="font-black text-xs text-slate-800 leading-tight">{b.name}</span>
                    <div className="flex items-center gap-0.5 bg-yellow-50 text-yellow-600 px-1 py-0.5 rounded text-[9px] font-black">
                      {b.rating} <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{b.speciality}</span>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-bold">
                    <MapPin className="w-3 h-3 text-[#ff3f6c]" /> {b.distance} km away
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Feed */}
          <div className="mt-8 px-4 pb-20">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide mb-3 flex items-center gap-1.5">
              Available Near You <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 bg-gray-100 px-2 py-0.5 rounded-full">{filteredProducts.length} items</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-white border border-gray-100 rounded-2xl shadow-3xs overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedProduct(p);
                    setStep(2);
                  }}
                >
                  <div className="w-full h-40 bg-gray-100 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border border-white/50 px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-1 shadow-sm text-slate-700">
                      <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> {p.rating}
                    </div>
                    {p.trustScore >= 95 && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <span className="font-black text-xs text-slate-800 leading-snug line-clamp-2">{p.name}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">{p.boutique}</span>
                    
                    <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                      <span className="font-black text-sm text-[#ff3f6c]">₹{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-400 font-bold line-through">₹{p.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
