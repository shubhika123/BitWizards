import React from "react";
import { useBazaarStore } from "../../../store/useBazaarStore";
import { ChevronLeft, BadgeCheck, ShieldCheck, Truck, Zap, Store, Star, MapPin, Check } from "lucide-react";
import { getImageUrl } from "../../../utils/imageUtils";

export default function SellerShopStep() {
  const {
    shopSeller,
    shopProducts,
    shopLoading,
    setStep,
    setSelectedProduct,
    boutiques,
  } = useBazaarStore();

  if (shopLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-gray-50/50">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold mt-4 text-gray-500">Loading shop details...</p>
      </div>
    );
  }

  if (!shopSeller) {
    return (
      <div className="p-4 text-center mt-10">
        <p className="text-gray-500">Seller not found.</p>
        <button onClick={() => setStep(1)} className="mt-4 text-pink-600 font-bold">Go Back</button>
      </div>
    );
  }

  // Find seller distance from discover feed boutiques if available
  const boutiqueData = boutiques.find((b) => b.id === shopSeller.id);
  const distanceStr = boutiqueData ? `${boutiqueData.distance} km away` : "Nearby";
  const deliveryStr = boutiqueData?.deliveryTime || "Same-day";

  return (
    <div className="w-full flex flex-col pb-24 overflow-y-auto animate-fade-in bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="px-3.5 py-4 sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center gap-3">
        <button 
          onClick={() => setStep(1)} 
          className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-black text-[#282c3f] leading-tight line-clamp-1">
              {shopSeller.name}
            </h1>
            {shopSeller.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-0.5">
            <MapPin className="w-3 h-3" /> {distanceStr}
          </div>
        </div>
      </div>

      <div className="px-3.5 py-4">
        {/* Trust strip */}
        <div className="flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-lg px-4 py-2.5 mb-5 shadow-3xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#14958f]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#282c3f]">Verified Seller</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#14958f]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#282c3f]">Easy Returns</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#14958f]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#282c3f]">Fast Delivery</span>
          </div>
        </div>

        <h2 className="text-[13px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
          All Products
        </h2>

        {shopProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
            <Store className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              This seller hasn't listed any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {shopProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-3xs overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                onClick={() => {
                  setSelectedProduct({
                    ...p,
                    distance: boutiqueData?.distance || 0,
                    deliveryTime: deliveryStr,
                    pickupTime: deliveryStr, // fallback
                    boutique: shopSeller.name,
                    location: distanceStr,
                  });
                  setStep(2);
                }}
              >
                <div className="w-full h-40 bg-gray-100 relative">
                  <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
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
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-500 font-bold">
                    <MapPin className="w-2.5 h-2.5 text-[#ff3f6c]" /> {deliveryStr}
                  </div>
                  <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                    <span className="font-black text-sm text-[#ff3f6c]">
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
    </div>
  );
}
