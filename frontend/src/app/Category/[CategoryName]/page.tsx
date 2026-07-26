"use client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";
import Header from "../../../components/Header";
import PinButton from "../../../components/OutfitCircle/PinButton";
import { categories } from "../../../lib/Categories";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryName = decodeURIComponent(params.CategoryName as string);
  const category = categories.find((c) => c.name === categoryName);

  if (!category) return <div className="p-4 text-sm">Category not found</div>;

  const products = [...category.products];

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-sm font-black text-[#282c3f] m-0">{category.name}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
            >
              <div className="aspect-[3/4] relative bg-slate-100">
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