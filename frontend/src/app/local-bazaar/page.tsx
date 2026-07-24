"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useBazaarStore } from "@/store/useBazaarStore";
import { Loader2 } from "lucide-react";
import BazaarHeader from "./components/BazaarHeader";
import DiscoverCatalogStep from "./components/DiscoverCatalogStep";
import ProductDetailStep from "./components/ProductDetailStep";
import BargainSliderStep from "./components/BargainSliderStep";
import NegotiationChatStep from "./components/NegotiationChatStep";
import FulfillmentStep from "./components/FulfillmentStep";
import SuccessStep from "./components/SuccessStep";

// Use environment variable for API URL in production, fallback to local for dev
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  } = store;

  // Sync city selection with logged-in user or LocalStorage
  const [simulatedDate, setSimulatedDate] = useState<string>("");

  useEffect(() => {
    const checkDate = () => {
      setSimulatedDate(localStorage.getItem("simulated_date") || "");
    };
    checkDate();
    window.addEventListener("storage", checkDate);
    return () => window.removeEventListener("storage", checkDate);
  }, []);

  useEffect(() => {
    if (!activeCity) return;
    const fetchActiveFestival = async () => {
      try {
        const url = `${API_BASE_URL}/api/festivals/active?city=${encodeURIComponent(activeCity)}` +
          (simulatedDate ? `&simulated_date=${encodeURIComponent(simulatedDate)}` : "");
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        const activeFest = data.regional_festival || data.national_festival || "";
        setActiveFestivalName(activeFest);
      } catch (err) {
        console.warn("Failed to fetch active festival from backend:", err);
      }
    };
    fetchActiveFestival();
  }, [activeCity, simulatedDate, setActiveFestivalName]);

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

  // Fetch boutiques + products + state from backend whenever city changes
  useEffect(() => {
    if (!activeCity) return;
    const fetchBazaarData = async () => {
      setBazaarLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/bazaar/data?city=${encodeURIComponent(activeCity)}`);
        if (res.ok) {
          const data = await res.json();
          setBoutiques(data.boutiques || []);
          setAllProducts(data.products || []);
          setActiveState(data.state || "");
        }
      } catch (err) {
        console.error("Failed to fetch local bazaar data", err);
      } finally {
        setBazaarLoading(false);
      }
    };
    fetchBazaarData();
  }, [activeCity, setBazaarLoading, setBoutiques, setAllProducts, setActiveState]);

  // Fetch festival theme from backend whenever festival name changes
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const url = `${API_BASE_URL}/api/bazaar/theme${activeFestivalName ? `?festival=${encodeURIComponent(activeFestivalName)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setThemeColors(data);
        }
      } catch (err) {
        console.warn("Failed to fetch bazaar theme", err);
      }
    };
    fetchTheme();
  }, [activeFestivalName, setThemeColors]);

  // Show minimal loader while theme data is loading from backend
  if (!themeColors) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff3f6c]" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans relative pb-8 bg-gradient-to-b ${themeColors.bgGradient || 'from-white to-gray-50'}`}>
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
