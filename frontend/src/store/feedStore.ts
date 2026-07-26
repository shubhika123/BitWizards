import { create } from "zustand";
import { API_BASE_URL as API_BASE_URL_CONFIG } from "../lib/apiConfig";

interface FeedState {
  activeFestival: string;
  simulatedDate: string;
  loadActiveFestivalName: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  activeFestival: typeof window !== "undefined" ? localStorage.getItem("active_festival_cache") || "" : "",
  simulatedDate: typeof window !== "undefined" ? localStorage.getItem("simulated_date") || "" : "",
  
  loadActiveFestivalName: async () => {
    const dateStr = typeof window !== "undefined" ? localStorage.getItem("simulated_date") || "" : "";
    set({ simulatedDate: dateStr });
    
    const API_BASE_URL = API_BASE_URL_CONFIG;
    const url = dateStr ? `${API_BASE_URL}/fetch-feed?simulated_date=${encodeURIComponent(dateStr)}` : `${API_BASE_URL}/fetch-feed`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      let currentFest = "";
      if (data?.national_festival) {
        currentFest = data.national_festival;
      } else if (data?.active_festivals && data.active_festivals.length > 0) {
        const matches = data.active_festivals.filter((name: string) => name === "Diwali" || name === "Raksha Bandhan");
        if (matches.length > 0) currentFest = matches[0];
      } else {
        // Date fallback
        if (dateStr >= "2026-11-08" && dateStr <= "2026-11-12") {
          currentFest = "Diwali";
        } else if (dateStr === "2026-08-28") {
          currentFest = "Raksha Bandhan";
        }
      }
      
      if (currentFest === "Diwali" || currentFest === "Raksha Bandhan") {
        if (typeof window !== "undefined") localStorage.setItem("active_festival_cache", currentFest);
        set({ activeFestival: currentFest });
      } else {
        if (typeof window !== "undefined") localStorage.setItem("active_festival_cache", "");
        set({ activeFestival: "" });
      }
    } catch (e) {
      if (typeof window !== "undefined") localStorage.setItem("active_festival_cache", "");
      set({ activeFestival: "" });
    }
  },
}));
