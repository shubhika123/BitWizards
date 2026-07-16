"use client";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import PinButton from "../../../components/OutfitCircle/PinButton";
import { categories } from "../../../lib/Categories";

export default function CategoryPage() {
  const params = useParams();
  const categoryName = decodeURIComponent(params.CategoryName as string);
  const category = categories.find((c) => c.name === categoryName);

  if (!category) return <div className="p-4 text-sm">Category not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <h2 className="text-sm font-black text-[#282c3f] mb-4">{category.name}</h2>

        <div className="grid grid-cols-2 gap-3">
          {category.products.map((product) => (
            <div
              key={product.product_id}
              className="bg-white border border-[#eaeaec] rounded-xl overflow-hidden shadow-sm"
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