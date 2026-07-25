import React from "react";
import { ArrowLeft, Clock, ShoppingBag, Truck } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";

export default function FulfillmentStep() {
  const {
    selectedProduct,
    negotiatedPrice,
    setStep,
    fulfillmentMode,
    setFulfillmentMode,
    purchasePath,
  } = useBazaarStore();

  if (!selectedProduct) return null;

  const atListPrice = negotiatedPrice >= selectedProduct.price;
  const backStep = purchasePath === "direct" ? 2 : 4;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b sticky top-0 z-10 shadow-3xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(backStep)} className="active:scale-95 transition-transform p-1">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="font-extrabold text-sm text-gray-800 tracking-wide">Select Fulfillment</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-5">
        <div className="bg-white p-4 rounded-2xl shadow-3xs border border-gray-100 flex gap-4 items-center">
          <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden relative shadow-inner shrink-0">
            {selectedProduct.image && <img src={selectedProduct.image} alt={selectedProduct.name} className="object-cover w-full h-full" />}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-black text-sm text-gray-800 leading-tight">{selectedProduct.name}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedProduct.boutique}</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-sm font-black text-[#ff3f6c]">₹{negotiatedPrice}</span>
              {!atListPrice && (
                <span className="text-[10px] text-gray-400 font-bold line-through">₹{selectedProduct.price}</span>
              )}
              {purchasePath === "bargain" && !atListPrice && (
                <span className="text-[9px] font-black text-emerald-500 uppercase ml-1">Bargained</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">How would you like to receive it?</span>
          
          <button 
            onClick={() => setFulfillmentMode("delivery")}
            className={`text-left p-4 rounded-2xl border transition-all flex gap-4 items-start ${
              fulfillmentMode === "delivery" 
                ? "border-[#ff3f6c] bg-pink-50/50 shadow-md ring-1 ring-[#ff3f6c]/20" 
                : "border-gray-200 bg-white shadow-3xs opacity-80"
            }`}
          >
            <div className={`p-2.5 rounded-xl ${fulfillmentMode === "delivery" ? "bg-[#ff3f6c] text-white" : "bg-gray-100 text-gray-500"}`}>
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between items-center w-full">
                <span className={`font-black text-sm ${fulfillmentMode === "delivery" ? "text-[#ff3f6c]" : "text-gray-700"}`}>Instant Delivery</span>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">+ ₹40</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-snug">Delivered to your address by Genie in {selectedProduct.deliveryTime}</p>
            </div>
          </button>

          <button 
            onClick={() => setFulfillmentMode("pickup")}
            className={`text-left p-4 rounded-2xl border transition-all flex gap-4 items-start ${
              fulfillmentMode === "pickup" 
                ? "border-[#ff3f6c] bg-pink-50/50 shadow-md ring-1 ring-[#ff3f6c]/20" 
                : "border-gray-200 bg-white shadow-3xs opacity-80"
            }`}
          >
            <div className={`p-2.5 rounded-xl ${fulfillmentMode === "pickup" ? "bg-[#ff3f6c] text-white" : "bg-gray-100 text-gray-500"}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex justify-between items-center w-full">
                <span className={`font-black text-sm ${fulfillmentMode === "pickup" ? "text-[#ff3f6c]" : "text-gray-700"}`}>Boutique Pickup</span>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">Free</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium leading-snug">Ready for pickup at {selectedProduct.boutique} by {selectedProduct.pickupTime}</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-bold">
                <Clock className="w-3 h-3" /> {selectedProduct.distance} km away
              </div>
            </div>
          </button>
        </div>

      </main>

      <div className="sticky bottom-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <button
          onClick={() => setStep(6)}
          className="w-full bg-[#2d1a3c] hover:bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl shadow-slate-900/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {fulfillmentMode === "delivery" ? `Pay ₹${negotiatedPrice + 40}` : `Confirm Pickup`}
        </button>
      </div>
    </div>
  );
}
