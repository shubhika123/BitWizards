"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Header from "../../../components/Header";
import PinButton from "../../../components/OutfitCircle/PinButton";
import { categories } from "../../../lib/Categories";
import { useAuthStore } from "../../../store/authStore";

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.CategoryName as string);
  const category = categories.find((c) => c.name === categoryName);

  const { user } = useAuthStore();
  const [isPersonalized, setIsPersonalized] = useState(true);
  const [guessedPrice, setGuessedPrice] = useState<number | null>(null);

  useEffect(() => {
    const getGuessedPrice = () => {
      if (!user) return null;
      try {
        const userKey = user.uid;
        const categoryGuesses = JSON.parse(localStorage.getItem(`myntra_contest_category_guesses_${userKey}`) || "{}");
        // Exact match
        if (categoryGuesses[categoryName]) return Number(categoryGuesses[categoryName]);
        // Substring matching
        for (const key of Object.keys(categoryGuesses)) {
          if (categoryName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(categoryName.toLowerCase())) {
            return Number(categoryGuesses[key]);
          }
        }
      } catch (e) {
        console.error("Failed to parse category guesses:", e);
      }
      return null;
    };

    setGuessedPrice(getGuessedPrice());
    setIsPersonalized(true);
  }, [categoryName, user]);

  if (!category) return <div className="p-4 text-sm">Category not found</div>;

  // Reranking products based on price guesses
  const products = [...category.products];
  if (isPersonalized && guessedPrice !== null) {
    products.sort((a, b) => {
      const aUnder = a.product_price <= guessedPrice;
      const bUnder = b.product_price <= guessedPrice;

      if (aUnder && !bUnder) return -1; // a comes first
      if (!aUnder && bUnder) return 1;  // b comes first

      if (aUnder && bUnder) {
        // Both under: prioritize closest to guessed price (highest price first, since it's closer to target)
        return b.product_price - a.product_price;
      } else {
        // Both over: prioritize closest to guessed price (lowest price first)
        return a.product_price - b.product_price;
      }
    });
  }

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <h2 className="text-sm font-black text-[#282c3f] mb-3">{category.name}</h2>

        {/* Personalized Banner Notice */}
        {guessedPrice !== null && isPersonalized && (
          <div className="mb-4 bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-left shadow-2xs select-none">
            <div className="flex-1 pr-2">
              <span className="text-[8px] font-black bg-amber-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Personalized Feed</span>
              <p className="text-[10px] text-amber-900 font-extrabold mt-1">
                Prioritizing products under or near your contest guess of <b>₹{guessedPrice}</b>.
              </p>
            </div>
            <button
              onClick={() => setIsPersonalized(false)}
              className="text-[9px] bg-white border border-amber-300 text-amber-800 font-black px-2 py-1 rounded-lg uppercase shadow-3xs hover:bg-amber-50 cursor-pointer active:scale-95 transition-all shrink-0"
            >
              Reset
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="h-40 relative bg-slate-100">
                <PinButton product={product} />
                <img
                  src={product.product_image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-black text-[#282c3f] block truncate">
                  {product.product_name}
                </span>
                <span className="text-[10px] font-bold text-[#ff3f6c]">₹{product.product_price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}