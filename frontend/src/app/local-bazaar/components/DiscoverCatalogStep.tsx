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
} from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";

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
  } = useBazaarStore();

  if (!themeColors) return null;

  const accent = themeColors.hexColor || "#ff3f6c";
  const essentialsTitle = `${themeColors.name.split(" ")[0]} Essentials`;

  const filteredBoutiques = boutiques.filter((b) => b.distance <= selectedRadius);
  const uniqueCategories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];

  const filteredProducts = allProducts.filter(
    (p) =>
      p.distance <= selectedRadius &&
      (activeCategory === "All" || p.category === activeCategory) &&
      (!selectedBoutique || p.boutique.toLowerCase() === selectedBoutique.toLowerCase())
  );

  return (
    <div className="flex flex-col font-sans">
      {/* Theme banner */}
      <div
        className="mx-3.5 mt-3.5 rounded-2xl overflow-hidden border border-gray-100 relative flex flex-col p-4 select-none min-h-[170px] text-left shadow-3xs"
        style={{ backgroundColor: "#fffdf5" }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-[55%] overflow-hidden pointer-events-none rounded-r-2xl">
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
            className="absolute top-3 right-3 z-20 text-white rounded-full w-[56px] h-[56px] flex flex-col items-center justify-center text-center shadow-md rotate-6 leading-tight border border-white/40"
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

        <div className="relative z-20 flex flex-col items-start w-[62%]">
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

      {/* Delivery speed chips + seller cards + trust strip */}
      <div className="mx-3.5 mt-4 select-none">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {DELIVERY_TIERS.map((tier) => {
            const isActive = selectedRadius === tier.r;
            const count = boutiques.filter((b) => b.distance <= tier.r).length;
            return (
              <button
                key={tier.r}
                onClick={() => setSelectedRadius(tier.r)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  isActive ? "text-white shadow-sm" : "bg-white border-gray-200 text-[#282c3f] hover:border-gray-300"
                }`}
                style={isActive ? { backgroundColor: accent, borderColor: accent } : {}}
              >
                <span className="text-xs">{tier.icon}</span>
                <span>{tier.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-[#535766]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seller cards */}
        <div className="mt-3 -mx-3.5 px-3.5">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {filteredBoutiques.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBoutique(b.name === selectedBoutique ? null : b.name)}
                className={`shrink-0 w-[200px] bg-white border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedBoutique === b.name ? "shadow-sm" : "border-gray-200"
                }`}
                style={selectedBoutique === b.name ? { borderColor: accent } : {}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                      <Store className="w-4 h-4" style={{ color: accent }} />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#282c3f] leading-tight line-clamp-1 max-w-[120px]">
                        {b.name}
                      </div>
                      {b.verified && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <CheckCircle className="w-2.5 h-2.5 text-teal-600" />
                          <span className="text-[9px] font-bold text-teal-600">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-[#14958f] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0">
                    <span>{b.rating}</span>
                    <span className="text-[8px]">★</span>
                  </div>
                </div>

                <p className="text-[10px] text-[#535766] mt-2 line-clamp-2 leading-relaxed">{b.speciality}</p>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[10px] text-[#282c3f]">
                    <MapPin className="w-3 h-3" style={{ color: accent }} />
                    <span className="font-bold">{b.distance} km away</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#14958f]">{b.deliveryTime || "—"}</span>
                </div>
              </div>
            ))}

            {filteredBoutiques.length === 0 && (
              <div className="w-full py-6 text-center">
                <p className="text-[12px] text-[#535766]">No sellers found in this delivery window.</p>
                <button
                  onClick={() => setSelectedRadius(15)}
                  className="text-[12px] font-bold mt-1 hover:underline"
                  style={{ color: accent }}
                >
                  Try Same-Day delivery →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-3 flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#14958f]" />
            <span className="text-[11px] font-bold text-[#282c3f]">All Sellers Verified</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#14958f]" />
            <span className="text-[11px] font-bold text-[#282c3f]">Easy Returns</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#14958f]" />
            <span className="text-[11px] font-bold text-[#282c3f]">Fast Delivery</span>
          </div>
        </div>
      </div>

      {/* Essentials category row */}
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

      {bazaarLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: accent }} />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Local Bazaar...</span>
        </div>
      ) : (
        <div className="mt-6 px-4 pb-24">
          {/* Product section header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#282c3f]">Verified Local Attires</h3>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-extrabold text-gray-400">Same-Day Delivery</span>
              <button className="border border-gray-200 bg-white text-slate-600 px-2 py-0.5 rounded-md text-[8.5px] font-black flex items-center gap-1 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all shadow-3xs">
                <span>🎚️</span>
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide py-1 select-none">
            {uniqueCategories.map((cat, idx) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  style={isActive ? { backgroundColor: accent, borderColor: accent, color: "#fff" } : {}}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    isActive ? "text-white shadow-sm" : "bg-white text-slate-700 border-gray-200 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {selectedBoutique && (
            <div className="mt-3 bg-[#fffbeb] border border-amber-200 text-amber-900 rounded-xl px-4 py-2 flex items-center justify-between text-xs font-bold shadow-3xs select-none">
              <span>
                Showing catalog for <strong>{selectedBoutique}</strong>
              </span>
              <button
                onClick={() => setSelectedBoutique(null)}
                className="text-amber-600 hover:text-amber-800 font-black uppercase text-[10px] cursor-pointer"
              >
                Clear Filter ✕
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="mt-4 border border-dashed border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
              <Store className="w-8 h-8 text-gray-300" />
              <span className="text-xs text-gray-400 font-bold">
                No active local sellers found in this delivery window.
              </span>
              <button
                onClick={() => {
                  setSelectedRadius(15);
                  setSelectedBoutique(null);
                }}
                className="text-xs font-black hover:underline"
                style={{ color: accent }}
              >
                Expand search to Same-day Delivery
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
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
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">
                      {p.boutique}
                    </span>
                    <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-500 font-bold">
                      <MapPin className="w-2.5 h-2.5" style={{ color: accent }} /> {p.deliveryTime || "—"}
                    </div>

                    <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                      <span className="font-black text-sm" style={{ color: accent }}>
                        ₹{p.price}
                      </span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-400 font-bold line-through">₹{p.originalPrice}</span>
                      )}
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
