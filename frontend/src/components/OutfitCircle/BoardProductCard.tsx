"use client";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { purchaseProduct, PinnedProduct } from "../../lib/OutfitCircleApi";

const CURRENT_USER_ID = 1; // replace with real auth context

export default function BoardProductCard({ pin }: { pin: PinnedProduct }) {
  const [purchases, setPurchases] = useState(pin.purchases ?? []);
  const [buying, setBuying] = useState(false);

  const youBought = purchases.some((p) => p.user_id === CURRENT_USER_ID);

  const handleBuy = async () => {
    if (youBought || buying) return;
    setBuying(true);
    const updated = await purchaseProduct(pin.pin_id, CURRENT_USER_ID);
    setPurchases(updated.purchases ?? []);
    setBuying(false);
    if (pin.product_url) window.open(pin.product_url, "_blank");
  };

  return (
    <div className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-[3/4] bg-gray-50">
        <img
          src={pin.product_image_url}
          alt={pin.product_name}
          className="w-full h-full object-cover"
        />
        {purchases.length > 0 && (
          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            {purchases.length === 1
              ? `Bought by ${purchases[0].user_name}`
              : `Bought by ${purchases.length} members`}
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs font-bold text-[#282c3f] line-clamp-2">
          {pin.product_name}
        </p>
        {pin.product_price !== undefined && (
          <p className="text-sm font-black text-[#282c3f] mt-1">
            ₹{pin.product_price}
          </p>
        )}

        <button
          onClick={handleBuy}
          disabled={youBought || buying}
          className={`w-full mt-2 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase transition-colors ${
            youBought
              ? "bg-emerald-50 text-emerald-600 cursor-default"
              : "bg-[#ff3f6c] text-white hover:bg-[#e63862]"
          }`}
        >
          {youBought ? (
            <>
              <Check className="w-3.5 h-3.5" /> You Bought This
            </>
          ) : buying ? (
            "Processing..."
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
            </>
          )}
        </button>

        {purchases.length > 0 && !youBought && (
          <p className="text-[9px] text-gray-400 font-bold mt-1.5">
            {purchases.length} member{purchases.length > 1 ? "s" : ""} already bought this
          </p>
        )}
      </div>
    </div>
  );
}