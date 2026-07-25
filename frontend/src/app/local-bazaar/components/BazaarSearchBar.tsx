"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  BadgeCheck,
  Store,
  Package,
  Loader2,
} from "lucide-react";
import {
  useBazaarStore,
  SearchResult,
  SearchResultOffer,
  Product,
  Boutique,
} from "@/store/useBazaarStore";
import { getImageUrl } from "@/utils/imageUtils";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

type BazaarSearchBarProps = {
  /** Visual variant to match parent sticky strip */
  variant?: "discover" | "festival" | "results";
  /** Show typeahead dropdown while typing (default true) */
  showDropdown?: boolean;
  /** Auto-focus the input on mount */
  autoFocus?: boolean;
  className?: string;
};

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
    location: `${offer.distance_km} km away`,
  };
}

export default function BazaarSearchBar({
  variant = "discover",
  showDropdown = true,
  autoFocus = false,
  className = "",
}: BazaarSearchBarProps) {
  const {
    searchQuery,
    searchProductResults,
    searchSellerResults,
    searchLoading,
    fetchSearch,
    setSearchQuery,
    setStep,
    setSelectedProduct,
    fetchSellerShop,
    clearSearch,
  } = useBazaarStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const runDebouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const trimmed = value.trim();
        if (trimmed.length < MIN_QUERY_LEN) {
          if (!trimmed) clearSearch();
          else
            useBazaarStore.setState({
              searchProductResults: [],
              searchSellerResults: [],
              searchLoading: false,
            });
          return;
        }
        fetchSearch(trimmed);
      }, DEBOUNCE_MS);
    },
    [fetchSearch, clearSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (value: string) => {
    setLocalQuery(value);
    if (showDropdown && focused) setOpen(true);
    runDebouncedSearch(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localQuery.trim();
    if (!trimmed) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchQuery(trimmed);
    setOpen(false);
    fetchSearch(trimmed);
    setStep(1.5);
  };

  const handleProductClick = (result: SearchResult) => {
    const offer = bestOffer(result);
    if (!offer) return;
    setSelectedProduct(toProduct(result, offer));
    setOpen(false);
    setStep(2);
  };

  const handleSellerClick = (seller: Boutique) => {
    fetchSellerShop(seller.id);
    setOpen(false);
    setStep(1.7);
  };

  const topProducts = searchProductResults.slice(0, 4);
  const topSellers = searchSellerResults.slice(0, 2);
  const hasSuggestions =
    topProducts.length > 0 || topSellers.length > 0;
  const showPanel =
    showDropdown &&
    open &&
    focused &&
    localQuery.trim().length >= MIN_QUERY_LEN;

  const inputClass =
    variant === "festival"
      ? "block w-full pl-10 pr-4 py-3 bg-gray-50 focus:bg-white border-none focus:ring-2 focus:ring-pink-500/20 transition-all text-sm font-medium text-gray-800 placeholder-gray-400 outline-none"
      : "block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-pink-300 focus:ring-4 focus:ring-pink-500/10 transition-all rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none";

  const formClass =
    variant === "festival"
      ? "relative rounded-xl overflow-visible group border border-gray-200"
      : "relative shadow-sm rounded-xl overflow-visible group";

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className={formClass}>
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-pink-600 text-gray-400 z-10">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={inputClass}
          placeholder="Search local sellers and products..."
          value={localQuery}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (localQuery.trim().length >= MIN_QUERY_LEN) setOpen(true);
          }}
          onBlur={() => {
            // Delay so row clicks register before panel closes
            setTimeout(() => setFocused(false), 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          autoComplete="off"
        />
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto">
          {searchLoading && !hasSuggestions ? (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold">Searching...</span>
            </div>
          ) : !hasSuggestions ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-bold text-gray-500">
                No matches for &quot;{localQuery.trim()}&quot;
              </p>
            </div>
          ) : (
            <>
              {topProducts.length > 0 && (
                <div>
                  <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400">
                    <Package className="w-3 h-3" /> Products
                  </div>
                  {topProducts.map((result) => {
                    const offer = bestOffer(result);
                    if (!offer) return null;
                    return (
                      <button
                        key={result.product.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleProductClick(result)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-pink-50/60 active:bg-pink-50 transition-colors text-left cursor-pointer"
                      >
                        <div className="w-11 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrl(result.product.image_url)}
                            alt={result.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#282c3f] line-clamp-1">
                            {result.product.name}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 line-clamp-1 mt-0.5">
                            {result.product.category}
                            {offer.seller_name ? ` · ${offer.seller_name}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[13px] font-black text-[#ff3f6c]">
                            ₹{offer.price}
                          </span>
                          {offer.original_price > offer.price && (
                            <p className="text-[9px] font-medium text-gray-400 line-through">
                              ₹{offer.original_price}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {topSellers.length > 0 && (
                <div className={topProducts.length > 0 ? "border-t border-gray-100" : ""}>
                  <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400">
                    <Store className="w-3 h-3" /> Sellers
                  </div>
                  {topSellers.map((seller) => (
                    <button
                      key={seller.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSellerClick(seller)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-pink-50/60 active:bg-pink-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-pink-50 to-orange-50 border border-gray-100">
                        {seller.image ? (
                          <img
                            src={seller.image}
                            alt={seller.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-pink-200">
                            <BadgeCheck className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[12px] font-bold text-[#282c3f] line-clamp-1">
                            {seller.name}
                          </p>
                          {seller.verified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 line-clamp-1 mt-0.5">
                          {seller.speciality || `${seller.distance} km away`}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 shrink-0">
                        ★ {seller.rating}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const trimmed = localQuery.trim();
                  if (!trimmed) return;
                  setSearchQuery(trimmed);
                  setOpen(false);
                  fetchSearch(trimmed);
                  setStep(1.5);
                }}
                className="w-full border-t border-gray-100 px-3 py-2.5 text-[11px] font-bold text-pink-600 hover:bg-pink-50/50 transition-colors cursor-pointer text-center"
              >
                See all results for &quot;{localQuery.trim()}&quot;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
