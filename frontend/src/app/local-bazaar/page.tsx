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

  useEffect(() => {
    if (!activeCity) return;
    const fetchActiveFestival = async () => {
      try {
        const url =
          `${API_BASE_URL}/api/festivals/active?city=${encodeURIComponent(activeCity)}` +
          (simulatedDate ? `&simulated_date=${encodeURIComponent(simulatedDate)}` : "");
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        // Prefer stable slug for theme lookup; fall back to display name
        const activeFest =
          data.regional_festival_slug ||
          data.national_festival_slug ||
          data.regional_festival ||
          data.national_festival ||
          "";
        setActiveFestivalName(activeFest);
      } catch (err) {
        console.warn("Failed to fetch active festival from backend:", err);
        setActiveFestivalName("");
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

  useEffect(() => {
    if (!activeCity) return;
    const fetchBazaarData = async () => {
      setBazaarLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/bazaar/data?city=${encodeURIComponent(activeCity)}`
        );
        if (res.ok) {
          const data = await res.json();
          setBoutiques(data.boutiques || []);
          setAllProducts(data.products || []);
          setActiveState(data.state || "");
        } else if (res.status === 404) {
          setBoutiques([]);
          setAllProducts([]);
          setActiveState("");
        }
      } catch (err) {
        console.error("Failed to fetch local bazaar data", err);
      } finally {
        setBazaarLoading(false);
      }
    };
    fetchBazaarData();
  }, [activeCity, setBazaarLoading, setBoutiques, setAllProducts, setActiveState]);

  useEffect(() => {
    let cancelled = false;
    const fetchTheme = async () => {
      try {
        const url = `${API_BASE_URL}/api/bazaar/theme${
          activeFestivalName ? `?festival=${encodeURIComponent(activeFestivalName)}` : ""
        }`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setThemeColors({ ...FALLBACK_THEME, ...data });
          return;
        }
      } catch (err) {
        console.warn("Failed to fetch bazaar theme", err);
      }
      if (!cancelled) setThemeColors(FALLBACK_THEME);
    };
    fetchTheme();
    return () => {
      cancelled = true;
    };
  }, [activeFestivalName, setThemeColors]);

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
