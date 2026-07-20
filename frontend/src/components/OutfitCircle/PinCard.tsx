"use client";
import { useState } from "react";
import { Check, ShoppingBag, Play, HelpCircle, Truck, Tag, MessageSquare, Volume2 } from "lucide-react";
import PollWidget from "./PollWidget";
import { purchaseProduct } from "../../lib/OutfitCircleApi";
import { useAuthStore } from "../../store/authStore";

export default function PinCard({ pin, userId: propUserId }: { pin: any; userId?: number }) {
  const { user } = useAuthStore();
  const userId = propUserId || user?.user_id || 1;

  const [purchases, setPurchases] = useState<any[]>(Array.isArray(pin.purchases) ? pin.purchases : []);
  const [buying, setBuying] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

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

  const sizeFeedbackList = pin.fit_feedback_badges
    ? pin.fit_feedback_badges.split(",")
    : [];

  return (
    <div className="bg-white border border-[#eaeaec] rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition duration-200">
      {/* Product Image / Inline Fit Video Player */}
      <div className="h-44 bg-gray-50 relative shrink-0">
        {isPlayingVideo && pin.fit_video_url ? (
          <video
            src={pin.fit_video_url}
            autoPlay
            controls
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={pin.product_image_url} alt={pin.product_name} className="w-full h-full object-cover" />
        )}

        {/* Video Player Toggle Badge */}
        {pin.fit_video_url && !isPlayingVideo && (
          <button
            onClick={() => setIsPlayingVideo(true)}
            className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#282c3f]/80 backdrop-blur-sm text-white text-[8px] font-black px-2 py-1 rounded-full shadow-sm"
          >
            <Play className="w-2.5 h-2.5 fill-current text-white" /> Fit Video
          </button>
        )}
        {isPlayingVideo && (
          <button
            onClick={() => setIsPlayingVideo(false)}
            className="absolute bottom-2 right-2 bg-[#ff3f6c] text-white text-[8px] font-black px-2 py-1 rounded-full shadow-sm"
          >
            Show Image
          </button>
        )}

        {/* Purchase Avatars */}
        {purchases.length > 0 && (
          <div className="absolute top-2 left-2 flex items-center -space-x-1.5">
            {purchases.slice(0, 3).map((p: any) => (
              <div
                key={p.user_id}
                title={p.user_name || `User ${p.user_id}`}
                className="h-5.5 w-5.5 rounded-full bg-gradient-to-br from-[#ff3f6c] to-[#f59e0b] text-white text-[7px] font-black flex items-center justify-center ring-2 ring-white"
              >
                {getInitials(p.user_name)}
              </div>
            ))}
            {purchases.length > 3 && (
              <div className="h-5.5 w-5.5 rounded-full bg-[#282c3f] text-white text-[7px] font-black flex items-center justify-center ring-2 ring-white">
                +{purchases.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product & Sizing Details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10.5px] font-black text-[#282c3f] leading-snug line-clamp-1">{pin.product_name}</span>
            {pin.product_price && (
              <span className="text-[10px] font-black text-[#ff3f6c] shrink-0">₹{pin.product_price}</span>
            )}
          </div>

          {pin.pinned_by_name && (
            <div className="text-[8.5px] text-gray-400 font-bold mt-0.5">Curated by {pin.pinned_by_name}</div>
          )}

          {/* Size Twin Badge */}
          {pin.fit_height && pin.fit_weight && (
            <div className="mt-1.5 bg-[#f5f3ff] text-[#6d28d9] rounded-lg p-1.5 text-[8.5px] font-bold border border-[#ddd6fe] flex flex-col gap-0.5">
              <span className="text-[7.5px] uppercase font-black tracking-wider text-[#7c3aed]">👯 Size Twin Proof</span>
              <span>{pin.fit_height}cm • {pin.fit_weight}kg ordered size {pin.fit_size_purchased || "M"}</span>
            </div>
          )}

          {/* Fit Badges (e.g., "True to size", "Breathable") */}
          {sizeFeedbackList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {sizeFeedbackList.map((tag: string) => (
                <span key={tag} className="text-[8px] font-black uppercase tracking-wide bg-rose-50 text-[#ff3f6c] px-1.5 py-0.5 rounded border border-rose-100">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Local Delivery Speed Badge */}
          <div className="mt-2 flex items-center gap-1 text-[8.5px] font-bold text-[#047857] bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-1.5 py-1">
            <Truck className="w-3 h-3 text-[#10b981]" />
            <span>Arrived in Vizag (2.1km away) in <b>21 Hours</b>!</span>
          </div>

          {/* Fit Review text or audio */}
          {pin.fit_review_text && (
            <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-2 text-[9px] text-gray-600 italic leading-relaxed font-medium">
              "{pin.fit_review_text}"
            </div>
          )}

          {/* Local Bazaar / Group Buy Area */}
          {pin.group_buy_eligible && (
            <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-2 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-black text-amber-800 uppercase tracking-wide">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-amber-700" /> Co-Buy Deal</span>
                <span>{pin.group_buy_discount_rate}% OFF</span>
              </div>
              <span className="text-[8px] font-bold text-amber-600 block">
                Requires {pin.min_orders_required} orders (currently {purchases.length} joined)
              </span>
              {pin.bazaar_shop_name && (
                <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-wider block">
                  Boutique: {pin.bazaar_shop_name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Widgets */}
        <div>
          <PollWidget pinId={pin.pin_id} userId={userId} />

          <button
            onClick={handleBuy}
            disabled={youBought || buying}
            className={`mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-full py-2 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${
              youBought
                ? "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]"
                : "bg-[#ff3f6c] text-white hover:bg-[#e63560] active:scale-[0.98] disabled:opacity-60"
            }`}
          >
            {youBought ? (
              <>
                <Check className="w-3.5 h-3.5" /> Purchased
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> {buying ? "Processing..." : "Buy Now / Join Group"}
              </>
            )}
          </button>

          {purchases.length > 0 && !youBought && (
            <div className="mt-1 text-center text-[8.5px] text-gray-500 font-bold">
              {purchases.length === 1
                ? `Bought by ${purchases[0].user_name || "a member"}`
                : `Bought by ${purchases.length} members`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}