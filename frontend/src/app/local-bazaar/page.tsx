"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";
import { Loader2 } from "lucide-react";
import BazaarHeader from "./components/BazaarHeader";
import DiscoverCatalogStep from "./components/DiscoverCatalogStep";
import SellerDiscoveryStep from "./components/SellerDiscoveryStep";
import SearchResultsStep from "./components/SearchResultsStep";
import SellerShopStep from "./components/SellerShopStep";
import ProductDetailStep from "./components/ProductDetailStep";
import BargainSliderStep from "./components/BargainSliderStep";
import NegotiationChatStep from "./components/NegotiationChatStep";
import FulfillmentStep from "./components/FulfillmentStep";
import SuccessStep from "./components/SuccessStep";

const FALLBACK_THEME = {
  name: "General Festive",
  hexColor: "#ff3f6c",
  bgGradient: "from-white to-gray-50",
  headerBg: "bg-white",
  headerText: "text-[#282c3f]",
  bannerTitle: "Explore Local Sellers with ",
  bannerHighlight: "Trust",
  bannerDesc: "Handcrafted accessories, direct handlooms, and traditional clothing.",
  bannerImg: "/apnabazar.png",
  bannerBtn: "Explore Collections",
  bannerBadge: "Bazaar Special",
  bannerTag: "SUPPORT LOCAL ARTISANS",
  categories: [],
};

export default function LocalBazaarPage() {
  const store = useBazaarStore();
  const { user } = useAuthStore();
  const {
    step,
    activeCity,
    setActiveCity,
    activeFestivalName,
    setActiveFestivalName,
    themeColors,
    setThemeColors,
    setBazaarLoading,
    setBoutiques,
    setAllProducts,
    setActiveState,
    fetchBazaarForCity,
  } = store;

  // Sync-init from localStorage so SPA remounts already include the date
  // (avoids a discover-mode race on navigate-back).
  const [simulatedDate, setSimulatedDate] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("simulated_date") || "" : ""
  );

  useEffect(() => {
    const checkDate = () => {
      setSimulatedDate(localStorage.getItem("simulated_date") || "");
    };
    // Re-sync after SSR hydration (initializer saw no window on the server)
    checkDate();
    window.addEventListener("storage", checkDate);
    return () => window.removeEventListener("storage", checkDate);
  }, []);

  useEffect(() => {
    if (user?.city) {
      setActiveCity(user.city);
    } else {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setActiveCity(savedCity);
      } else {
        setActiveCity("Belgaum");
      }
    }
  }, [user, setActiveCity]);

  // Fetch unified bazaar data from backend whenever city or simulated date changes
  useEffect(() => {
    if (activeCity) {
      fetchBazaarForCity(activeCity, simulatedDate);
    }
  }, [activeCity, simulatedDate, fetchBazaarForCity]);

  if (!themeColors) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff3f6c]" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative pb-8 bg-gradient-to-b ${
        themeColors.bgGradient || "from-white to-gray-50"
      }`}
    >
      <BazaarHeader />

      <main className="flex-1">
        {step === 1 && store.feedMode === "festival" && <DiscoverCatalogStep />}
        {step === 1 && store.feedMode === "discover" && <SellerDiscoveryStep />}
        {step === 1.5 && <SearchResultsStep />}
        {step === 1.7 && <SellerShopStep />}
        {step === 2 && <ProductDetailStep />}
        {step === 3 && <BargainSliderStep />}
        {step === 4 && <NegotiationChatStep />}
        {step === 5 && <FulfillmentStep />}
        {step === 6 && <SuccessStep />}
      </main>
    </div>
  );
}
