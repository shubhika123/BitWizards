"use client";

import React, { useEffect } from "react";
import {
  useBazaarStore,
  SearchResult,
  SearchResultOffer,
  Product,
  Boutique,
} from "../../../store/useBazaarStore";
import {
  ChevronLeft,
  Search,
  MapPin,
  BadgeCheck,
  Clock,
  Navigation,
  Star,
  Check,
  Store,
} from "lucide-react";
import { getImageUrl } from "../../../utils/imageUtils";
import BazaarSearchBar from "./BazaarSearchBar";

function bestOffer(result: SearchResult): SearchResultOffer | null {
  if (!result.offers || result.offers.length === 0) return null;
  return result.offers[0];
}

function toProduct(result: SearchResult, offer: SearchResultOffer): Product {
  const { product } = result;
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: offer.price,
    originalPrice: offer.original_price,
    image: product.image_url,
    trustScore: product.trustScore,
    rating: product.rating,
    distance: offer.distance_km,
    deliveryTime: offer.delivery_estimate,
    pickupTime: offer.delivery_estimate,
    boutique: offer.seller_name,
    boutiqueId: offer.seller_id,
    location: `${offer.distance_km} km away`,
  };
}

export default function SearchResultsStep() {
  const {
    searchQuery,
    searchProductResults,
    searchSellerResults,
    searchLoading,
    fetchSearch,
    setStep,
    setSelectedProduct,
    fetchSellerShop,
  } = useBazaarStore();

  // Ensure results are loaded if user landed here with a query but empty results
  useEffect(() => {
    if (searchQuery && searchProductResults.length === 0 && searchSellerResults.length === 0 && !searchLoading) {
      fetchSearch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProductSelect = (result: SearchResult) => {
    const offer = bestOffer(result);
    if (!offer) return;
    setSelectedProduct(toProduct(result, offer));
    setStep(2);
  };

  const handleSellerSelect = (seller: Boutique) => {
    fetchSellerShop(seller.id);
    setStep(1.7);
  };

  const firstProducts = searchProductResults.slice(0, 4);
  const restProducts = searchProductResults.slice(4);
  const isEmpty =
    !searchLoading &&
    searchProductResults.length === 0 &&
    searchSellerResults.length === 0;

  return (
    <div className="w-full flex flex-col pb-24 overflow-y-auto animate-fade-in bg-gray-50/50 min-h-screen">
      {/* Search Header */}
      <div className="px-3.5 py-4 sticky top-0 z-50 bg-gray-50/90 backdrop-blur-md border-b border-gray-100 flex items-center gap-3">
        <button
          onClick={() => setStep(1)}
          className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <BazaarSearchBar variant="results" className="flex-1" />
      </div>

      <div className="px-3.5 py-4">
        <h2 className="text-base font-bold text-[#282c3f] mb-4">
          Results for &quot;{searchQuery}&quot;
        </h2>

        {searchLoading && searchProductResults.length === 0 && searchSellerResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
            <p className="text-sm font-bold mt-4 text-gray-500">
              Searching nearby sellers...
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No results found</h3>
            <p className="text-xs text-gray-500 max-w-[220px] leading-relaxed">
              We couldn&apos;t find any products or sellers matching &quot;{searchQuery}&quot;.
              Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* First 2 rows of products (up to 4 cards) */}
            {firstProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {firstProducts.map((result) => (
                  <ProductCard
                    key={result.product.id}
                    result={result}
                    onSelect={() => handleProductSelect(result)}
                  />
                ))}
              </div>
            )}

            {/* All matched sellers — horizontal scroll after first 2 product rows */}
            {searchSellerResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] font-black text-[#282c3f] uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-pink-500" />
                    Sellers
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400">
                    {searchSellerResults.length} matched
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {searchSellerResults.map((seller) => (
                    <SellerCard
                      key={seller.id}
                      seller={seller}
                      onSelect={() => handleSellerSelect(seller)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Remaining products */}
            {restProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {restProducts.map((result) => (
                  <ProductCard
                    key={result.product.id}
                    result={result}
                    onSelect={() => handleProductSelect(result)}
                  />
                ))}
              </div>
            )}

            {/* Sellers-only edge case: no products but sellers exist — already shown above */}
            {firstProducts.length === 0 && searchSellerResults.length === 0 && null}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: () => void;
}) {
  const offer = bestOffer(result);
  if (!offer) return null;
  const { product } = result;

  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl shadow-3xs overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
      onClick={onSelect}
    >
      <div className="w-full h-40 bg-gray-100 relative">
        <img
          src={getImageUrl(product.image_url)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border border-white/50 px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-1 shadow-sm text-slate-700">
          <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> {product.rating}
        </div>
        {product.trustScore >= 95 && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
            <Check className="w-2.5 h-2.5" /> Verified
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <span className="font-black text-xs text-slate-800 leading-snug line-clamp-2">
          {product.name}
        </span>
        <div className="flex items-center gap-1 mt-1.5 text-[9px] text-gray-500 font-bold">
          <MapPin className="w-2.5 h-2.5 text-[#ff3f6c]" />
          {offer.seller_name}
        </div>
        <div className="flex items-center gap-1 mt-0.5 text-[9px] text-green-700 font-bold">
          <Clock className="w-2.5 h-2.5" />
          {offer.delivery_estimate}
        </div>
        <div className="mt-auto pt-2 flex items-baseline gap-1.5">
          <span className="font-black text-sm text-[#ff3f6c]">₹{offer.price}</span>
          {offer.original_price > offer.price && (
            <span className="text-[10px] text-gray-400 font-bold line-through">
              ₹{offer.original_price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SellerCard({
  seller,
  onSelect,
}: {
  seller: Boutique;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md hover:border-gray-200 relative overflow-hidden shrink-0 w-[148px]"
    >
      <div className="aspect-[4/5] w-full bg-gradient-to-br from-pink-50/50 to-orange-50/50 relative flex items-center justify-center overflow-hidden">
        {seller.image ? (
          <img
            src={seller.image}
            alt={seller.name}
            className="w-full h-full object-cover absolute inset-0 z-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="text-pink-200 z-0">
            <BadgeCheck className="w-10 h-10 opacity-40" />
          </div>
        )}

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded text-[10px] font-black border border-white shadow-sm flex items-center gap-0.5 z-10">
          {seller.rating} <span className="text-green-600 text-[9px]">★</span>
        </div>

        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-pink-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-white shadow-sm flex items-center gap-1 z-10">
          <Clock className="w-2.5 h-2.5 text-pink-500" />
          {seller.deliveryTime || "Same-day"}
        </div>
      </div>

      <div className="p-2.5 flex flex-col gap-0.5 bg-white">
        <div className="flex items-center gap-1">
          <h3 className="font-bold text-[#282c3f] text-[12px] leading-tight line-clamp-1">
            {seller.name}
          </h3>
          {seller.verified && (
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-gray-500 font-medium line-clamp-1">
          {seller.speciality}
        </p>
        <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold mt-1">
          <Navigation className="w-3 h-3 text-slate-400" />
          {seller.distance} km away
        </div>
      </div>
    </div>
  );
}
