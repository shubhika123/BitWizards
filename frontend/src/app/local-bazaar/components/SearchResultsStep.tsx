import React, { useState } from "react";
import { useBazaarStore, SearchResultOffer, Product } from "../../../store/useBazaarStore";
import { Search, ChevronLeft, MapPin, BadgeCheck, Clock, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { getImageUrl } from "../../../utils/imageUtils";

export default function SearchResultsStep() {
  const {
    searchQuery,
    setSearchQuery,
    fetchSearchResults,
    searchResults,
    searchLoading,
    setStep,
    setSelectedProduct,
  } = useBazaarStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      fetchSearchResults(localQuery);
      setSearchQuery(localQuery);
    }
  };

  const handleProductSelect = (productInfo: any, offer: SearchResultOffer) => {
    const p: Product = {
      id: productInfo.id,
      name: productInfo.name,
      category: productInfo.category,
      price: offer.price,
      originalPrice: offer.original_price,
      image: productInfo.image_url,
      trustScore: productInfo.trustScore,
      rating: productInfo.rating,
      distance: offer.distance_km,
      deliveryTime: offer.delivery_estimate,
      pickupTime: offer.delivery_estimate, // fallback
      boutique: offer.seller_name,
      location: offer.distance_km + " km away",
    };
    setSelectedProduct(p);
    setStep(2); // Go to bargain flow
  };

  return (
    <div className="w-full flex flex-col pb-24 overflow-y-auto animate-fade-in bg-gray-50/50 min-h-screen">
      {/* Search Header */}
      <div className="px-3.5 py-4 sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md border-b border-gray-100 flex items-center gap-3">
        <button 
          onClick={() => setStep(1)} 
          className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <form onSubmit={handleSearchSubmit} className="relative shadow-sm rounded-xl overflow-hidden group flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-pink-600 text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
            placeholder="Search local sellers and products..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="px-3.5 py-4">
        <h2 className="text-base font-bold text-[#282c3f] mb-4">
          Results for "{searchQuery}"
        </h2>

        {searchLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold mt-4 text-gray-500">Searching nearby sellers...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm mx-1">
            <Search className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              We couldn't find any products matching "{searchQuery}" nearby. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {searchResults.map((result) => (
              <ProductSearchResult 
                key={result.product.id} 
                result={result} 
                onSelectOffer={handleProductSelect} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductSearchResult({ result, onSelectOffer }: { result: any; onSelectOffer: (productInfo: any, offer: SearchResultOffer) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { product, offers } = result;
  
  if (!offers || offers.length === 0) return null;
  
  // Best offer is typically the first one if backend sorted by price
  const bestOffer = offers[0];
  const otherOffers = offers.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-3">
        {/* Product Image */}
        <div className="w-[84px] h-[108px] shrink-0 bg-[#F4F4F5] rounded-xl overflow-hidden relative">
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 flex justify-center">
            <div className="flex items-center gap-0.5 text-white bg-black/40 backdrop-blur-md px-1 py-0.5 rounded text-[9px] font-bold">
              <span>★ {product.rating}</span>
            </div>
          </div>
        </div>

        {/* Product Details & Best Offer */}
        <div className="flex flex-col flex-1 py-0.5">
          <h3 className="text-[13px] font-bold text-[#282c3f] leading-tight line-clamp-2 mb-1">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-[15px] font-black text-[#282c3f]">
              ₹{bestOffer.price}
            </span>
            {bestOffer.original_price > bestOffer.price && (
              <span className="text-[11px] font-medium text-gray-400 line-through">
                ₹{bestOffer.original_price}
              </span>
            )}
          </div>

          {/* Best Offer Seller Info */}
          <div 
            onClick={() => onSelectOffer(product, bestOffer)}
            className="mt-2 bg-pink-50/50 border border-pink-100 rounded-lg p-2 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase text-pink-600 tracking-wider">Best Price</span>
              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
                <MapPin className="w-2.5 h-2.5" />
                {bestOffer.distance_km} km
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800 line-clamp-1">{bestOffer.seller_name}</span>
              {bestOffer.is_verified && <BadgeCheck className="w-3 h-3 text-blue-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-bold text-green-700">{bestOffer.delivery_estimate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Offers Toggle */}
      {otherOffers.length > 0 && (
        <div className="border-t border-gray-100">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2.5 px-3 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span>{otherOffers.length} more {otherOffers.length === 1 ? 'offer' : 'offers'} available</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {expanded && (
            <div className="bg-gray-50 px-3 pb-3 flex flex-col gap-2 border-t border-gray-100 pt-2">
              {otherOffers.map((offer: SearchResultOffer, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => onSelectOffer(product, offer)}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 cursor-pointer active:scale-[0.98] transition-transform hover:border-pink-200"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-800 line-clamp-1">{offer.seller_name}</span>
                      {offer.is_verified && <BadgeCheck className="w-3 h-3 text-blue-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-gray-500 mt-0.5">
                      <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{offer.distance_km} km</span>
                      <span className="flex items-center gap-0.5 text-green-700"><Clock className="w-2.5 h-2.5" />{offer.delivery_estimate}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-[#282c3f]">₹{offer.price}</span>
                    {offer.original_price > offer.price && (
                      <span className="text-[9px] font-medium text-gray-400 line-through">₹{offer.original_price}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
