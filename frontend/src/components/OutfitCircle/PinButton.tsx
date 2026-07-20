"use client";
import { useState } from "react";
import { Pin } from "lucide-react";
import PinToBoardModal from "./PinToBoardModal";
import { useAuthStore } from "../../store/authStore";

interface ProductToPin {
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_price?: number;
  product_url?: string;
}

export default function PinButton({ product }: { product: ProductToPin }) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!user?.user_id) return; // not logged in — nothing to pin as
          setShowModal(true);
        }}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-[#ff3f6c] hover:text-white transition-colors group"
      >
        <Pin className="w-3.5 h-3.5 text-gray-700 group-hover:text-white" />
      </button>

      {showModal && user?.user_id && (
        <PinToBoardModal
          product={product}
          userId={user.user_id}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}