"use client";
import PollWidget from "./PollWidget";

export default function PinCard({ pin, userId }: { pin: any; userId: number }) {
  return (
    <div className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden shadow-sm">
      <div className="h-40 bg-gray-100">
        <img src={pin.product_image_url} alt={pin.product_name} className="w-full h-full object-cover" />
      </div>
      <div className="p-2.5">
        <span className="text-[10px] font-black text-[#282c3f] truncate block">{pin.product_name}</span>
        {pin.product_price && (
          <span className="text-[10px] font-bold text-[#ff3f6c]">₹{pin.product_price}</span>
        )}
        <PollWidget pinId={pin.pin_id} userId={userId} />
      </div>
    </div>
  );
}