import React, { useState, useEffect, useRef } from "react";
import { useBazaarStore, Product } from "../../../store/useBazaarStore";
import {
  ChevronLeft,
  BadgeCheck,
  ShieldCheck,
  Truck,
  Zap,
  Store,
  Star,
  MapPin,
  Check,
  Search,
  Share2,
  Plus,
  Minus,
  ShoppingBag,
  Heart,
  X,
  ArrowRight,
  Camera,
  Heart as HeartIcon
} from "lucide-react";
import { getImageUrl } from "../../../utils/imageUtils";

interface MockCatalogItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  category: string;
  isBestseller: boolean;
  isMarkCertified: boolean; // true = Silk Mark, false = 100% Handloom
  detailsTag: string;
}

const MOCK_STORE_ITEMS: MockCatalogItem[] = [
  // Kanjeevaram Silk
  {
    id: "coi_mock_1",
    name: "Royal Blue Heavy Zari Kanjeevaram",
    price: 14999,
    originalPrice: 22000,
    description: "Intricate pure gold zari border, grand pallu, hand-loomed perfection.",
    image: "/kachipuram_saree.jpg",
    category: "Kanjeevaram Silk",
    isBestseller: true,
    isMarkCertified: true,
    detailsTag: "Pure Zari • Unstitched Blouse Piece included"
  },
  {
    id: "coi_mock_2",
    name: "Crimson Red Bridal Silk Saree",
    price: 18500,
    originalPrice: 26000,
    description: "Vibrant scarlet red wedding weave, pure silver-gilded zari work.",
    image: "/silk_sarees_stack.png",
    category: "Kanjeevaram Silk",
    isBestseller: true,
    isMarkCertified: true,
    detailsTag: "Silk Mark Certified • 100% Mulberry Silk"
  },
  // Soft Silk
  {
    id: "coi_mock_3",
    name: "Pastel Pink Floral Soft Silk",
    price: 6499,
    originalPrice: 9500,
    description: "Lightweight and flowy drape with subtle floral gold buttas.",
    image: "/ethnic_wear_category.png",
    category: "Soft Silk",
    isBestseller: false,
    isMarkCertified: true,
    detailsTag: "Soft Finish • Semi-heavy Pallu"
  },
  {
    id: "coi_mock_4",
    name: "Mustard Yellow Lightweight Silk",
    price: 5999,
    originalPrice: 8800,
    description: "Easy-to-carry festival silk saree with elegant contrast borders.",
    image: "/chhath_women_ethnic.png",
    category: "Soft Silk",
    isBestseller: false,
    isMarkCertified: true,
    detailsTag: "Contrast Pallu • Breathable Weave"
  },
  // Coimbatore Cotton
  {
    id: "coi_mock_5",
    name: "Traditional Handloom Chettinad Cotton",
    price: 1850,
    originalPrice: 2800,
    description: "Authentic Chettinad checks, coarse texture, highly durable cotton.",
    image: "/cottonsaree.webp",
    category: "Coimbatore Cotton",
    isBestseller: true,
    isMarkCertified: false,
    detailsTag: "100% Organic Cotton • Dye-free Borders"
  },
  {
    id: "coi_mock_6",
    name: "Dual-Tone Temple Border Cotton",
    price: 2200,
    originalPrice: 3200,
    description: "Gorgeous contrast temple borders, lightweight summer wear.",
    image: "/handlooms_category.png",
    category: "Coimbatore Cotton",
    isBestseller: false,
    isMarkCertified: false,
    detailsTag: "Mercerized Cotton • Easy starch care"
  },
  // Party Wear
  {
    id: "coi_mock_7",
    name: "Peacock Green Soft Silk Saree",
    price: 7200,
    originalPrice: 10500,
    description: "Stunning teal dual-tone body, traditional checks, silk-rich finish.",
    image: "/ethnic_wear_category.png",
    category: "Party Wear",
    isBestseller: true,
    isMarkCertified: true,
    detailsTag: "Dual Tone • Zari border detailing"
  },
  {
    id: "coi_mock_8",
    name: "Golden Zari Banarasi Fusion Silk",
    price: 9999,
    originalPrice: 15000,
    description: "Bridging Coimbatore weaving style with Banarasi gold floral motifs.",
    image: "/silk_sarees_stack.png",
    category: "Party Wear",
    isBestseller: false,
    isMarkCertified: true,
    detailsTag: "Zari brocade • Dry clean only"
  }
];

export default function SellerShopStep() {
  const {
    shopSeller,
    shopProducts,
    shopLoading,
    setStep,
    setSelectedProduct,
    boutiques,
  } = useBazaarStore();

  const [inStoreQuery, setInStoreQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Bestsellers");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isBagModalOpen, setIsBagModalOpen] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Local storage cart persist
  useEffect(() => {
    const saved = localStorage.getItem("bazaar_store_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const updateCart = (itemId: string, delta: number) => {
    setCart((prev) => {
      const nextQty = (prev[itemId] || 0) + delta;
      const updated = { ...prev };
      if (nextQty <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = nextQty;
      }
      localStorage.setItem("bazaar_store_cart", JSON.stringify(updated));
      return updated;
    });
  };

  if (shopLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-gray-50/50">
        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold mt-4 text-gray-500">Loading shop details...</p>
      </div>
    );
  }

  if (!shopSeller) {
    return (
      <div className="p-4 text-center mt-10">
        <p className="text-gray-500">Seller not found.</p>
        <button onClick={() => setStep(1)} className="mt-4 text-pink-600 font-bold">Go Back</button>
      </div>
    );
  }

  const boutiqueData = boutiques.find((b) => b.id === shopSeller.id);
  const distanceStr = boutiqueData ? `${boutiqueData.distance} km away` : "0 km away";
  const deliveryStr = boutiqueData?.deliveryTime || "10-15 min";

  // Check if we render the customized "Coimbatore Silk Emporium" Zomato-style UI
  const isCoimbatoreSilkStore = shopSeller.name === "Coimbatore Silk Emporium";

  if (isCoimbatoreSilkStore) {
    const CATEGORIES = ["Bestsellers", "Kanjeevaram Silk", "Soft Silk", "Coimbatore Cotton", "Party Wear"];

    const filteredItems = MOCK_STORE_ITEMS.filter((item) => {
      if (!inStoreQuery.trim()) return true;
      const q = inStoreQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    const getItemsByCategory = (catName: string) => {
      if (catName === "Bestsellers") {
        return filteredItems.filter((i) => i.isBestseller);
      }
      return filteredItems.filter((i) => i.category === catName);
    };

    const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = MOCK_STORE_ITEMS.find((i) => i.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);

    const handleProductSelect = (item: MockCatalogItem) => {
      const productObj: Product = {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        trustScore: 98,
        distance: boutiqueData?.distance || 0.1,
        deliveryTime: deliveryStr,
        pickupTime: deliveryStr,
        boutique: "Coimbatore Silk Emporium",
        location: "Coimbatore",
        rating: 4.8,
      };
      setSelectedProduct(productObj);
      setStep(2);
    };

    const scrollToCategory = (catName: string) => {
      setActiveCategory(catName);
      const target = categoryRefs.current[catName];
      if (target) {
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - 190;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    };

    return (
      <div className="w-full flex flex-col pb-36 bg-white min-h-screen text-left">
        {/* Navigation Header (KEEP IDENTICAL) */}
        <div className="px-4 py-3 sticky top-0 z-35 bg-white border-b border-gray-150 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(1)}
              className="p-1.5 rounded-full hover:bg-gray-105 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg tracking-tighter text-[#ff3f6c]">fwd</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff3f6c]"></div>
            </div>
          </div>

          {/* Search pill input */}
          <div className="flex-1 max-w-[210px]">
            <div className="relative rounded-full border border-gray-200 bg-gray-50 flex items-center px-3 py-1.5 gap-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search saree..."
                value={inStoreQuery}
                onChange={(e) => setInStoreQuery(e.target.value)}
                className="w-full bg-transparent outline-none border-none text-[11px] font-bold text-gray-700 placeholder-gray-400"
              />
              <Camera className="w-3.5 h-3.5 text-gray-400 shrink-0 cursor-pointer" />
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-3">
            <button className="text-gray-700 hover:text-[#ff3f6c] transition-colors relative">
              <HeartIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (totalItems > 0) setIsBagModalOpen(true);
              }}
              className="text-gray-700 hover:text-[#ff3f6c] transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ff3f6c] text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sleek Minimalist Saree Banner Header (Myntra Fwd Style) */}
        <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 flex flex-col text-left">
          <div className="flex items-baseline gap-1">
            <h2 className="text-base font-black text-slate-800 tracking-tight">Coimbatore Silk Emporium</h2>
            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
          </div>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            Kanjeevaram • Silk Sarees • Traditional Handlooms
          </p>
        </div>

        {/* Centered Myntra Style Theme Banner Title */}
        <div className="py-6 text-center flex flex-col justify-center items-center bg-[#F8F9FA]/40 border-b border-gray-100">
          <span className="text-[9px] tracking-[0.25em] font-black text-[#ff3f6c]/90 uppercase">Aadi Perukku Special</span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1 uppercase flex items-center gap-1 bg-gradient-to-r from-[#ff3f6c] to-rose-600 bg-clip-text text-transparent">
            GET <span className="underline decoration-[#ff3f6c] decoration-4">TRADITIONAL</span> READY
          </h2>
          <div className="w-6 h-1 bg-[#ff3f6c] mt-2 rounded-full"></div>
        </div>

        {/* Visual Category Showcase Cards (Sticky Myntra Style) */}
        <div className="sticky top-[58px] z-30 bg-white/95 backdrop-blur-md px-4 py-3.5 overflow-x-auto flex gap-4 no-scrollbar border-b border-gray-100">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = getItemsByCategory(cat).length;
            if (count === 0) return null;

            // Map each category to an image
            let catImg = "/ethnic_wear_category.png";
            if (cat === "Kanjeevaram Silk") catImg = "/kachipuram_saree.jpg";
            else if (cat === "Soft Silk") catImg = "/chhath_women_ethnic.png";
            else if (cat === "Coimbatore Cotton") catImg = "/cottonsaree.webp";
            else if (cat === "Party Wear") catImg = "/silk_sarees_stack.png";

            return (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shadow-3xs ${
                    isActive ? "border-[#ff3f6c] scale-105" : "border-transparent"
                  }`}
                >
                  <img src={catImg} alt={cat} className="w-full h-full object-cover object-top" />
                </div>
                <span
                  className={`text-[9.5px] font-black uppercase tracking-wider ${
                    isActive ? "text-[#ff3f6c]" : "text-gray-500"
                  }`}
                >
                  {cat.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Product Grid (Clean, Borderless, Flat Design) */}
        <div className="px-4 py-6 flex flex-col gap-8 bg-[#F8F9FA]/30">
          {CATEGORIES.map((cat) => {
            const items = getItemsByCategory(cat);
            if (items.length === 0) return null;

            return (
              <div
                key={cat}
                ref={(el) => {
                  categoryRefs.current[cat] = el;
                }}
                className="scroll-mt-44 flex flex-col gap-3.5"
              >
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-1.5">
                  <h3 className="text-xs font-black tracking-widest text-[#282c3f] uppercase">
                    {cat}
                  </h3>
                  <span className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider">{items.length} items</span>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-x-3.5 gap-y-6">
                  {items.map((item) => {
                    const quantity = cart[item.id] || 0;
                    const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col relative group"
                      >
                        {/* Image Frame aspect-[2/3] */}
                        <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-50 relative shadow-2xs">
                          <img
                            src={item.image}
                            alt={item.name}
                            onClick={() => handleProductSelect(item)}
                            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300 cursor-pointer"
                          />

                          {/* Pink Discount Badge Overlay (Top Left) */}
                          <div className="absolute top-0 left-0 bg-[#ff3f6c] text-white px-2.5 py-0.5 rounded-br-lg text-[9px] font-black uppercase tracking-wider shadow-sm z-10">
                            {discount}% OFF
                          </div>

                          {/* Green Veg / Silk tag Overlay (Top Right) */}
                          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-1 py-1 rounded-md shadow-3xs border border-white/50 z-10 flex items-center justify-center">
                            <span className="w-3 h-3 border border-emerald-600 flex items-center justify-center rounded-sm p-0.5">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            </span>
                          </div>

                          {/* Add / Qty pill Controller Overlay (Bottom Right Corner of Image) */}
                          <div className="absolute bottom-2.5 right-2.5 z-15 w-[56px] shadow-sm">
                            {quantity === 0 ? (
                              <button
                                onClick={() => updateCart(item.id, 1)}
                                className="w-full py-1.5 rounded-md bg-white border border-gray-250 font-black text-[10px] text-[#ff3f6c] uppercase tracking-wider flex items-center justify-center gap-0.5 active:scale-95 transition-transform"
                              >
                                <span>Add</span>
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            ) : (
                              <div className="w-full py-1.5 rounded-md bg-[#ff3f6c] font-black text-[10px] text-white flex items-center justify-between px-1.5">
                                <button
                                  onClick={() => updateCart(item.id, -1)}
                                  className="text-white active:scale-90"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[10px]">{quantity}</span>
                                <button
                                  onClick={() => updateCart(item.id, 1)}
                                  className="text-white active:scale-90"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Info Body (borderless and flat) */}
                        <div className="pt-2 flex flex-col text-left">
                          <h4
                            onClick={() => handleProductSelect(item)}
                            className="font-bold text-[12px] text-[#282c3f] leading-snug line-clamp-1 hover:text-[#ff3f6c] cursor-pointer"
                          >
                            {item.name}
                          </h4>
                          <p className="text-[9.5px] text-gray-400 font-bold mt-0.5 line-clamp-1">{item.detailsTag}</p>

                          {/* Price Tag */}
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xs font-black text-[#282c3f]">₹{item.price.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400 line-through font-bold">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Search className="w-10 h-10 text-gray-300 mb-2" />
              <h4 className="font-bold text-gray-700 text-xs">No matching items found</h4>
              <p className="text-[10px] text-gray-400 mt-1">Try modifying your search term.</p>
            </div>
          )}
        </div>

        {/* Bottom Sticky Myntra Pink Cart Strip */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-205 px-4 py-3.5 z-35 shadow-2xl flex items-center justify-between max-w-md mx-auto rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="bg-[#ff3f6c]/10 p-2.5 rounded-xl text-[#ff3f6c]">
                <ShoppingBag className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-slate-800 leading-none">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"} added
                </span>
                <span className="text-[13px] font-black text-[#ff3f6c] mt-0.5">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBagModalOpen(true)}
              className="bg-[#ff3f6c] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1 hover:bg-[#e63560] active:scale-95 transition-all shadow-md shadow-rose-100"
            >
              <span>View Bag</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bag Modal */}
        {isBagModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-slide-up text-left">
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-gray-150 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#ff3f6c]" />
                  <h3 className="font-black text-xs text-[#282c3f] uppercase tracking-wider">Your Handloom Bag</h3>
                </div>
                <button
                  onClick={() => setIsBagModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-155 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-[300px] overflow-y-auto px-4 py-3 flex flex-col gap-3">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = MOCK_STORE_ITEMS.find((i) => i.id === id);
                  if (!item) return null;

                  return (
                    <div key={item.id} className="flex gap-3 justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex gap-2.5 items-center flex-1">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-black text-[#282c3f] leading-snug line-clamp-1">{item.name}</span>
                          <span className="text-[11px] font-bold text-gray-400 mt-0.5">{item.category}</span>
                          <span className="text-xs font-black text-[#ff3f6c] mt-0.5">₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Add/remove controller */}
                      <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                        <button onClick={() => updateCart(item.id, -1)} className="text-[#ff3f6c] active:scale-90">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-800 px-1">{qty}</span>
                        <button onClick={() => updateCart(item.id, 1)} className="text-[#ff3f6c] active:scale-90">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total & Checkout */}
              <div className="bg-gray-50 border-t border-gray-150 px-4 py-4 flex flex-col gap-3">
                <div className="flex justify-between items-center font-black">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Subtotal</span>
                  <span className="text-base text-[#ff3f6c]">₹{totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const firstItemId = Object.keys(cart)[0];
                      const item = MOCK_STORE_ITEMS.find((i) => i.id === firstItemId);
                      if (item) {
                        handleProductSelect(item);
                      }
                      setIsBagModalOpen(false);
                    }}
                    className="flex-1 bg-[#ff3f6c] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md text-center flex items-center justify-center gap-1.5 hover:bg-[#e63560] active:scale-95 transition-all"
                  >
                    <span>Checkout & Bargain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback / Standard Layout for other sellers
  return (
    <div className="w-full flex flex-col pb-24 overflow-y-auto animate-fade-in bg-gray-50/50 min-h-screen text-left">
      {/* Header */}
      <div className="px-3.5 py-4 sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => setStep(1)}
          className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-black text-[#282c3f] leading-tight line-clamp-1">
              {shopSeller.name}
            </h1>
            {shopSeller.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-0.5">
            <MapPin className="w-3 h-3" /> {distanceStr}
          </div>
        </div>
      </div>

      <div className="px-3.5 py-4">
        {/* Trust strip */}
        <div className="flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-lg px-4 py-2.5 mb-5 shadow-3xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#14958f]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#282c3f]">Verified Seller</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#14958f]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#282c3f]">Easy Returns</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#14958f]" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#282c3f]">Fast Delivery</span>
          </div>
        </div>

        <h2 className="text-[13px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
          All Products
        </h2>

        {shopProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
            <Store className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              This seller hasn't listed any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {shopProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-3xs overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                onClick={() => {
                  setSelectedProduct({
                    ...p,
                    distance: boutiqueData?.distance || 0,
                    deliveryTime: deliveryStr,
                    pickupTime: deliveryStr, // fallback
                    boutique: shopSeller.name,
                    boutiqueId: shopSeller.id,
                    location: distanceStr,
                  });
                  setStep(2);
                }}
              >
                <div className="w-full h-40 bg-gray-100 relative">
                  <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border border-white/50 px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-1 shadow-sm text-slate-700">
                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> {p.rating}
                  </div>
                  {p.trustScore >= 95 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                      <Check className="w-2.5 h-2.5" /> Verified
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="font-black text-xs text-slate-800 leading-snug line-clamp-2">{p.name}</span>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-500 font-bold">
                    <MapPin className="w-2.5 h-2.5 text-[#ff3f6c]" /> {deliveryStr}
                  </div>
                  <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                    <span className="font-black text-sm text-[#ff3f6c]">
                      ₹{p.price}
                    </span>
                    {p.originalPrice > p.price && (
                      <span className="text-[10px] text-gray-400 font-bold line-through">₹{p.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
