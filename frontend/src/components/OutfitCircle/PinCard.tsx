"use client";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import PollWidget from "./PollWidget";
import { purchaseProduct } from "../../lib/OutfitCircleApi";

export default function PinCard({ pin, userId }: { pin: any; userId: number }) {
  const [purchases, setPurchases] = useState<any[]>(Array.isArray(pin.purchases) ? pin.purchases : []);
  const [buying, setBuying] = useState(false);

  const youBought = purchases.some((p) => p.user_id === userId);

  const getInitials = (name?: string, username?: string) => {
    const source = name || username || "U";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";
  };

  const handleBuy = async () => {
    if (youBought || buying) return;
    setBuying(true);
    try {
      const updated = await purchaseProduct(pin.pin_id, userId);
      setPurchases(Array.isArray(updated?.purchases) ? updated.purchases : [...purchases, { user_id: userId }]);
    } catch (error) {
      console.error(error);
    } finally {
      setBuying(false);
    }
    if (pin.product_url) window.open(pin.product_url, "_blank");
  };

  return (
    <div className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden shadow-sm">
      <div className="h-40 bg-gray-100 relative">
        <img src={pin.product_image_url} alt={pin.product_name} className="w-full h-full object-cover" />

        {purchases.length > 0 && (
          <div className="absolute top-2 left-2 flex items-center -space-x-1.5">
            {purchases.slice(0, 3).map((p: any) => (
              <div
                key={p.user_id}
                title={p.user_name || `User ${p.user_id}`}
                className="h-5 w-5 rounded-full bg-gradient-to-br from-[#ff3f6c] to-[#f59e0b] text-white text-[7px] font-black flex items-center justify-center ring-2 ring-white"
              >
                {getInitials(p.user_name)}
              </div>
            ))}
            {purchases.length > 3 && (
              <div className="h-5 w-5 rounded-full bg-[#282c3f] text-white text-[7px] font-black flex items-center justify-center ring-2 ring-white">
                +{purchases.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-2.5">
        <span className="text-[10px] font-black text-[#282c3f] truncate block">{pin.product_name}</span>
        {pin.product_price && (
          <span className="text-[10px] font-bold text-[#ff3f6c]">₹{pin.product_price}</span>
        )}

        <PollWidget pinId={pin.pin_id} userId={userId} />

        <button
          onClick={handleBuy}
          disabled={youBought || buying}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-full py-1.5 text-[10px] font-black uppercase tracking-wide transition-all ${
            youBought
              ? "bg-[#ecfdf5] text-[#047857]"
              : "bg-[#ff3f6c] text-white disabled:opacity-60"
          }`}
        >
          {youBought ? (
            <>
              <Check className="w-3 h-3" /> Bought
            </>
          ) : (
            <>
              <ShoppingBag className="w-3 h-3" /> {buying ? "Processing..." : "Buy Now"}
            </>
          )}
        </button>

        {purchases.length > 0 && !youBought && (
          <div className="mt-1 text-[9px] text-gray-500 font-bold">
            {purchases.length === 1
              ? `Bought by ${purchases[0].user_name || "a member"}`
              : `Bought by ${purchases.length} members`}
          </div>
        )}
      </div>
    </div>
  );
}