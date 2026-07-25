import React from "react";
import { ArrowLeft, Star, MapPin, Check, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";

export default function ProductDetailStep() {
  const {
    selectedProduct,
    setStep,
  } = useBazaarStore();

  if (!selectedProduct) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b sticky top-0 z-10 shadow-3xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(1)} className="active:scale-95 transition-transform p-1">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="font-extrabold text-sm text-gray-800 tracking-wide">Boutique Profile</span>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* Product Hero */}
        <div className="w-full bg-white relative pb-6 border-b border-gray-100">
          <div className="w-full h-[350px] relative bg-gray-100">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/90 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded shadow-sm w-fit">{selectedProduct.category}</span>
                <h1 className="text-2xl font-black text-white leading-tight drop-shadow-md">{selectedProduct.name}</h1>
              </div>
            </div>
          </div>

          <div className="px-4 mt-5 flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#ff3f6c]">₹{selectedProduct.price}</span>
                {selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="text-xs font-bold text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                )}
              </div>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Fair Price Guarantee
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg border border-yellow-100 text-xs font-black shadow-3xs">
              <Star className="w-3.5 h-3.5 fill-current" /> {selectedProduct.rating}
            </div>
          </div>
        </div>

        {/* Boutique Info */}
        <div className="mt-2 bg-white p-4 border-y border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Sold By</h3>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-black text-slate-400">{selectedProduct.boutique.charAt(0)}</span>
            </div>
            
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-slate-800">{selectedProduct.boutique}</span>
                {selectedProduct.trustScore >= 95 && (
                  <Check className="w-3.5 h-3.5 text-white bg-blue-500 rounded-full p-0.5 shadow-sm" />
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-500 mt-0.5">{selectedProduct.location}</span>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#ff3f6c]" /> {selectedProduct.distance} km</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> {selectedProduct.deliveryTime} delivery</span>
              </div>
            </div>
          </div>
          
          {selectedProduct.trustScore >= 95 && (
            <div className="mt-4 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider">Top Rated Boutique</span>
                <span className="text-[10px] font-medium text-blue-600/80 leading-snug mt-0.5">High trust score ({selectedProduct.trustScore}%) based on local customer reviews.</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-20">
        <button
          onClick={() => setStep(3)}
          className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white font-black py-4 rounded-xl shadow-xl shadow-pink-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
        >
          <MessageCircle className="w-5 h-5" />
          Request Best Price
        </button>
      </div>
    </div>
  );
}
