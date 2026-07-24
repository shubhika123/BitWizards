import React from "react";
import { CheckCircle } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";

export default function SuccessStep() {
  const {
    selectedProduct,
    negotiatedPrice,
    setStep
  } = useBazaarStore();

  if (!selectedProduct) return null;

  return (
    <main className="flex-1 px-4 py-16 flex flex-col gap-6 text-center justify-center items-center">
      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md animate-bounce">
        <CheckCircle className="w-9 h-9" strokeWidth={2.5} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Bargain Secured!</h2>
        <p className="text-sm text-gray-500 font-bold">
          Purchased {selectedProduct.name} at <span className="text-[#ff3f6c] font-black">₹{negotiatedPrice}</span>
        </p>
        <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest mt-1">Order Ref: MYN-LB-{(Math.random() * 1000000).toFixed(0)}</span>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-3.5 mt-6">
        <button
          onClick={() => { alert("Shared to Outfit Circle group board!"); setStep(1); }}
          className="bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99]"
        >
          Share Deal to Outfit Circle
        </button>

        <button
          onClick={() => setStep(1)}
          className="bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-3xs cursor-pointer transition-colors"
        >
          Return to Apna Bazaar
        </button>
      </div>
    </main>
  );
}
