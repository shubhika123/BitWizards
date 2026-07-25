import React from "react";
import {
  Star,
  MapPin,
  Sparkles,
  Loader2,
  Check,
  Store,
  CheckCircle,
  ShieldCheck,
  Truck,
  Zap,
  BadgeCheck,
  Clock,
  Navigation,
} from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";
import BazaarSearchBar from "./BazaarSearchBar";

const DELIVERY_TIERS = [
  { r: 2, label: "Under 30 min", icon: "⚡" },
  { r: 5, label: "Within 2 hrs", icon: "🚀" },
  { r: 10, label: "Within 4 hrs", icon: "📦" },
  { r: 15, label: "Same Day", icon: "🛍️" },
];

export default function DiscoverCatalogStep() {
  const {
    themeColors,
    boutiques,
    allProducts,
    activeCategory,
    setActiveCategory,
    selectedRadius,
    setSelectedRadius,
    selectedBoutique,
    setSelectedBoutique,
    bazaarLoading,
    setSelectedProduct,
    setStep,
    activeCity,
    activeFestivalName,
  } = useBazaarStore();

  if (!themeColors) return null;

  const accent = themeColors.hexColor || "#ff3f6c";
  const essentialsTitle = `${themeColors.name.split(" ")[0]} Essentials`;



  const filteredBoutiques = boutiques.filter((b) => {
    const withinRadius = b.distance <= selectedRadius;
    const matchesCategory =
      activeCategory === "All" ||
      allProducts.some((p) => p.boutique.toLowerCase() === b.name.toLowerCase() && p.category === activeCategory);
    return withinRadius && matchesCategory;
  })
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 6);
  
  const uniqueCategories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];

  const filteredProducts = allProducts.filter(
    (p) =>
      p.distance <= selectedRadius &&
      (activeCategory === "All" || p.category === activeCategory) &&
      (!selectedBoutique || p.boutique.toLowerCase() === selectedBoutique.toLowerCase())
  );

  return (
    <div className="flex flex-col font-sans min-h-screen pb-20 bg-white">
      {/* Search Bar — high z so typeahead sits above festival banner */}
      <div className="px-3.5 py-4 sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <BazaarSearchBar variant="festival" />
      </div>

      {/* Theme banner */}
      {activeFestivalName === "Chhath Puja" ? (
        <div className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-rose-200 relative z-0 flex flex-col p-5 select-none bg-[#FFF0F2]/50 text-center items-center justify-center">
          {/* Top pink line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ff3f6c]" />

          {/* Mouse pointer icon hovering at the top middle */}
          <div className="absolute top-3 right-1/4 animate-bounce pointer-events-none select-none z-20">
            <svg className="w-4 h-4 text-black fill-current" viewBox="0 0 24 24">
              <path d="M4 0l16 12.279-6.943 1.848 4.775 8.16-3.16 1.713-4.707-8.04-5.965 4.916v-20.876z" />
            </svg>
          </div>

          {/* Decorative Hanging element on Left - Soop with fruits SVG */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 select-none pointer-events-none z-10 opacity-90 scale-95">
            <svg className="w-16 h-16" viewBox="0 0 100 100">
              {/* Soop base */}
              <path d="M 10 50 Q 50 85 90 50 L 80 40 Q 50 70 20 40 Z" fill="#d97706" stroke="#b45309" strokeWidth="2" />
              {/* Gold patterns */}
              <path d="M 25 48 L 75 48 M 32 55 L 68 55 M 40 62 L 60 62" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Fruits: Coconut */}
              <circle cx="50" cy="38" r="10" fill="#78350f" />
              <circle cx="48" cy="36" r="2" fill="#fff" opacity="0.3" />
              {/* Banana */}
              <path d="M 32 30 Q 42 22 55 32 Q 45 28 32 30" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
              {/* Apple / Pomegranate */}
              <circle cx="65" cy="40" r="8" fill="#dc2626" />
              <path d="M 64 32 L 66 30" stroke="#b45309" strokeWidth="1" />
            </svg>
          </div>

          {/* Right Decor - Circular Floral Ornament SVG */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 select-none pointer-events-none z-10 opacity-90 scale-95">
            <svg className="w-16 h-16" viewBox="0 0 100 100">
              {/* Thread */}
              <path d="M 0 50 Q 25 42 50 50 Q 75 58 100 50" stroke="#ff3f6c" strokeWidth="2" fill="none" />
              {/* Floral outer body */}
              <circle cx="50" cy="50" r="18" fill="#f59e0b" stroke="#be123c" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="12" fill="#be123c" />
              <circle cx="50" cy="50" r="7" fill="#ffd700" />
              <circle cx="50" cy="50" r="3" fill="#be123c" />
              {/* Petals/Beads */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x = 50 + 15 * Math.cos(angle);
                const y = 50 + 15 * Math.sin(angle);
                return <circle key={i} cx={x} cy={y} r="1.5" fill="#ffd700" stroke="#d97706" strokeWidth="0.5" />;
              })}
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Title with gold stars */}
            <div className="flex items-center gap-2.5 justify-center">
              <span className="text-amber-500 font-extrabold text-sm">✦</span>
              <h2 className="font-serif font-black tracking-widest text-xl text-[#5c0f1e] uppercase">
                CHHATH PUJA
              </h2>
              <span className="text-amber-500 font-extrabold text-sm">✦</span>
            </div>

            {/* Tagline flanked by gold horizontal lines */}
            <div className="flex items-center gap-2 mt-2 w-full justify-center">
              <span className="w-8 h-[1px] bg-amber-400"></span>
              <span className="text-[10px] font-bold tracking-wider capitalize font-serif text-rose-700/80">
                Celebrate the Sun God, Festively Styled
              </span>
              <span className="w-8 h-[1px] bg-amber-400"></span>
            </div>
          </div>
        </div>
      ) : activeFestivalName ? (
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
      ) : null}

      {/* Categories section */}
      {activeFestivalName && (activeCity === "Patna" || activeCity === "Coimbatore") ? (
        <div className="px-3.5 grid grid-cols-2 gap-3 mt-4 z-10 relative">
          {themeColors.categories?.filter(cat => cat.name.toUpperCase() !== "ALL").map((cat, idx) => (
             <div 
               key={idx} 
               onClick={() => { 
                 setActiveCategory(cat.value || cat.name);
                 setStep(1.5); // Navigate to search results for this category
               }} 
               className="bg-white flex flex-col items-center pb-3 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-xl overflow-hidden border border-pink-100"
             >
                <div className="w-full aspect-[4/5] bg-pink-50 relative overflow-hidden">
                   {/* Placeholder large image */}
                   <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-50 flex items-center justify-center">
                     <Sparkles className="w-12 h-12 text-pink-200/50" />
                   </div>
                   {cat.img && <img src={cat.img} alt={cat.name} className="w-full h-full object-cover absolute inset-0 z-10" />}
                </div>
                <div className="mt-3.5 text-[10px] font-black uppercase text-slate-800 tracking-wider text-center px-1">
                   {cat.name}
                </div>
                <div className="mt-1 text-[13px] font-black text-slate-900 tracking-tight">
                    {cat.name.toUpperCase().includes("MEN") ? "UP TO 30% OFF" :
                     cat.name.toUpperCase().includes("WOMEN") ? "UP TO 40% OFF" :
                     cat.name.toUpperCase().includes("PRASAD") ? "UP TO 50% OFF" :
                     cat.name.toUpperCase().includes("RITUAL") ? "UP TO 25% OFF" :
                     `UP TO ${30 + (idx * 5)}% OFF`}
                </div>
                <div className="mt-2 text-[10px] font-black text-[#ff3f6c] uppercase tracking-widest hover:underline">
                   Shop Now
                </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="mx-3.5 mt-3.5 bg-white border border-gray-100 rounded-2xl p-4 text-left shadow-3xs select-none">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🏺</span>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{essentialsTitle}</h3>
            </div>
            <button
              onClick={() => setActiveCategory("All")}
              className="text-[9.5px] font-black hover:underline flex items-center gap-0.5"
              style={{ color: accent }}
            >
              <span>View all</span>
              <span>→</span>
            </button>
          </div>
  
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide w-full justify-start">
            {themeColors.categories?.map((cat, idx) => {
              const value = cat.value ?? cat.name;
              const isSelected = activeCategory === value;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveCategory(value)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
                >
                  <div
                    className={`w-14 h-14 rounded-full overflow-hidden border bg-white flex items-center justify-center transition-all ${
                      isSelected ? "border-2 scale-105" : "border-gray-200 hover:scale-105"
                    }`}
                    style={isSelected ? { borderColor: accent, boxShadow: `0 0 8px ${accent}33` } : {}}
                  >
                    {cat.img ? (
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles className="w-5 h-5" style={{ color: accent }} />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-black tracking-wide max-w-[64px] text-center leading-tight ${
                      isSelected ? "text-slate-800" : "text-gray-500"
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 4-Badge Trust Strip (Raksha Bandhan Style) */}
      {activeFestivalName && (activeCity === "Patna" || activeCity === "Coimbatore") && (
        <div className="mx-3.5 mt-4 bg-[#fafafa] border border-gray-100 rounded-lg px-3 py-3 grid grid-cols-2 gap-y-3 gap-x-2">
          <div className="flex items-start gap-1.5">
            <Truck className="w-4 h-4 text-[#ff3f6c] shrink-0" />
            <div>
              <div className="text-[9px] font-black text-slate-800 leading-tight">Same Day Delivery</div>
              <div className="text-[8px] text-slate-500">Quick & Reliable</div>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#ff3f6c] shrink-0" />
            <div>
              <div className="text-[9px] font-black text-slate-800 leading-tight">Secure Payments</div>
              <div className="text-[8px] text-slate-500">100% Safe Checkout</div>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Sparkles className="w-4 h-4 text-[#ff3f6c] shrink-0" />
            <div>
              <div className="text-[9px] font-black text-slate-800 leading-tight">Premium Quality</div>
              <div className="text-[8px] text-slate-500">Handpicked for You</div>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <svg className="w-4 h-4 text-[#ff3f6c] shrink-0 fill-none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <div className="text-[9px] font-black text-slate-800 leading-tight">24/7 Support</div>
              <div className="text-[8px] text-slate-500">We're Here for You</div>
            </div>
          </div>
        </div>
      )}



      {bazaarLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: accent }} />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Local Bazaar...</span>
        </div>
      ) : (
        <div className="mt-6 px-4 pb-24">
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-lg font-black text-[#282c3f] tracking-tight">
              Sellers Near You
            </h2>
          </div>

          {filteredBoutiques.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
              <MapPin className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800 mb-1">No sellers found</h3>
              <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
                We couldn't find any sellers delivering to your current location right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-1">
              {filteredBoutiques.map((b) => (
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
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {b.distance} km away
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
