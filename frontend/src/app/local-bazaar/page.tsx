"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";
import { API_BASE_URL } from "@/lib/apiConfig";
import { Loader2 } from "lucide-react";
import BazaarHeader from "./components/BazaarHeader";
import DiscoverCatalogStep from "./components/DiscoverCatalogStep";
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
  bannerImg: "/aadi_bazaar_banner.png",
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

  const [simulatedDate, setSimulatedDate] = useState<string>("");

  useEffect(() => {
    const checkDate = () => {
      setSimulatedDate(localStorage.getItem("simulated_date") || "");
    };
    checkDate();
    window.addEventListener("storage", checkDate);
    return () => window.removeEventListener("storage", checkDate);
  }, []);

  // Drops every cached date-dependent value when the simulated date changes,
  // including a change made on another page while this store stayed alive.
  useEffect(() => {
    syncSimulatedDate(simulatedDate);
  }, [simulatedDate, syncSimulatedDate]);

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
        {step === 1 && <DiscoverCatalogStep />}
        {step === 2 && <ProductDetailStep />}
        {step === 3 && <BargainSliderStep />}
        {step === 4 && <NegotiationChatStep />}
        {step === 5 && <FulfillmentStep />}
        {step === 6 && <SuccessStep />}
      </main>
    </div>
  );
}
