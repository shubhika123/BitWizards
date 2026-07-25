import { create } from "zustand";
import { API_BASE_URL } from "../lib/apiConfig";

/** Monotonic id so only the latest bazaar fetch can write store state. */
let bazaarFetchSeq = 0;
let bazaarAbortController: AbortController | null = null;

/** Monotonic id so only the latest search fetch can write store state. */
let searchFetchSeq = 0;
let searchAbortController: AbortController | null = null;

function resolveSimulatedDate(explicit?: string): string {
  if (explicit !== undefined) return explicit;
  if (typeof window === "undefined") return "";
  return localStorage.getItem("simulated_date") || "";
}

export interface Boutique {
  id: string;
  name: string;
  rating: number;
  distance: number;
  speciality: string;
  verified: boolean;
  x: number;
  y: number;
  image?: string;
  deliveryTime?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  trustScore: number;
  distance: number;
  deliveryTime: string;
  pickupTime: string;
  boutique: string;
  location: string;
  rating: number;
}

export interface ChatMessage {
  sender: "user" | "shop";
  text: string;
  time: string;
}

export interface ThemeColors {
  name: string;
  bgGradient: string;
  headerBg: string;
  headerText: string;
  hexColor?: string;
  festiveBanner?: string;
  bannerTitle: string;
  bannerHighlight: string;
  bannerDesc: string;
  bannerImg: string;
  bannerBtn: string;
  bannerBadge: string;
  bannerTag: string;
  categories: { name: string; img: string | null; value?: string }[];
}

export interface SellerDetail {
  id: string;
  name: string;
  rating: number;
  is_verified: boolean;
  speciality?: string;
}

export interface SearchResultOffer {
  seller_id: string;
  seller_name: string;
  is_verified: boolean;
  price: number;
  original_price: number;
  distance_km: number;
  delivery_estimate: string;
}

export interface SearchResult {
  product: {
    id: string;
    name: string;
    category: string;
    image_url: string;
    description: string;
    rating: number;
    trustScore: number;
  };
  offers: SearchResultOffer[];
}

export interface BazaarState {
  // Navigation / UI State
  step: number;
  bazaarLoading: boolean;
  showCityDropdown: boolean;
  
  // Dual-mode feed state
  feedMode: "festival" | "discover";
  userLat: number | null;
  userLng: number | null;

  // Data State
  activeCity: string;
  activeState: string;
  activeFestivalName: string;
  themeColors: ThemeColors | null;
  boutiques: Boutique[];
  allProducts: Product[];
  
  // Discover State
  selectedRadius: number;
  activeCategory: string;
  hoveredBoutique: string | null;
  selectedBoutique: string | null;
  expandedProductId: string | null;
  
  // Search State
  searchQuery: string;
  searchProductResults: SearchResult[];
  searchSellerResults: Boutique[];
  searchLoading: boolean;

  // Shop State
  shopSeller: SellerDetail | null;
  shopProducts: Product[];
  shopLoading: boolean;

  // Bargaining / Session State
  selectedProduct: Product | null;
  proposedBid: number;
  negotiatedPrice: number;
  chatMessages: ChatMessage[];
  chatRound: number;
  userChatInput: string;
  isTyping: boolean;
  fulfillmentMode: "delivery" | "pickup";
  completedRituals: string[];
  
  // Actions
  setStep: (step: number) => void;
  setBazaarLoading: (loading: boolean) => void;
  setShowCityDropdown: (show: boolean) => void;
  
  setUserLocation: (lat: number, lng: number) => void;
  setFeedMode: (mode: "festival" | "discover") => void;

  setActiveCity: (city: string) => void;
  setActiveState: (state: string) => void;
  setActiveFestivalName: (name: string) => void;
  setThemeColors: (theme: ThemeColors | null) => void;
  setBoutiques: (boutiques: Boutique[]) => void;
  setAllProducts: (products: Product[]) => void;
  
  setSelectedRadius: (radius: number) => void;
  setActiveCategory: (category: string) => void;
  setHoveredBoutique: (id: string | null) => void;
  setSelectedBoutique: (id: string | null) => void;
  setExpandedProductId: (id: string | null) => void;
  
  setSearchQuery: (query: string) => void;
  fetchSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  fetchSellerShop: (sellerId: string) => Promise<void>;

  setSelectedProduct: (product: Product | null) => void;
  setProposedBid: (bid: number) => void;
  setNegotiatedPrice: (price: number) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatRound: (round: number) => void;
  setUserChatInput: (input: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  setFulfillmentMode: (mode: "delivery" | "pickup") => void;
  setCompletedRituals: (rituals: string[]) => void;
  
  resetSession: () => void;
  
  fetchBazaarForCity: (city: string, simulatedDate?: string) => Promise<void>;
  submitNegotiationOffer: (bid: number, customMessage?: string) => Promise<void>;
}

export const useBazaarStore = create<BazaarState>((set, get) => ({
  step: 1,
  bazaarLoading: true,
  showCityDropdown: false,
  
  feedMode: "discover",
  userLat: null,
  userLng: null,

  activeCity: "",
  activeState: "",
  activeFestivalName: "",
  themeColors: null,
  boutiques: [],
  allProducts: [],
  
  selectedRadius: 5,
  activeCategory: "All",
  hoveredBoutique: null,
  selectedBoutique: null,
  expandedProductId: null,
  
  searchQuery: "",
  searchProductResults: [],
  searchSellerResults: [],
  searchLoading: false,

  shopSeller: null,
  shopProducts: [],
  shopLoading: false,

  selectedProduct: null,
  proposedBid: 1000,
  negotiatedPrice: 1299,
  chatMessages: [],
  chatRound: 1,
  userChatInput: "",
  isTyping: false,
  fulfillmentMode: "delivery",
  completedRituals: [],

  setStep: (step) => set({ step }),
  setBazaarLoading: (loading) => set({ bazaarLoading: loading }),
  setShowCityDropdown: (show) => set({ showCityDropdown: show }),
  
  setUserLocation: (lat, lng) => {
    set({ userLat: lat, userLng: lng });
    const { activeCity, fetchBazaarForCity } = get();
    if (activeCity) {
      // Re-fetch with new GPS
      fetchBazaarForCity(activeCity);
    }
  },
  setFeedMode: (mode) => set({ feedMode: mode }),

  setActiveCity: (city) => set({ activeCity: city }),
  setActiveState: (state) => set({ activeState: state }),
  setActiveFestivalName: (name) => set({ activeFestivalName: name }),
  setThemeColors: (theme) => set({ themeColors: theme }),
  setBoutiques: (boutiques) => set({ boutiques }),
  setAllProducts: (products) => set({ allProducts: products }),
  
  setSelectedRadius: (radius) => set({ selectedRadius: radius }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setHoveredBoutique: (id) => set({ hoveredBoutique: id }),
  setSelectedBoutique: (id) => set({ selectedBoutique: id }),
  setExpandedProductId: (id) => set({ expandedProductId: id }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () =>
    set({
      searchQuery: "",
      searchProductResults: [],
      searchSellerResults: [],
      searchLoading: false,
    }),
  fetchSearch: async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set({
        searchQuery: "",
        searchProductResults: [],
        searchSellerResults: [],
        searchLoading: false,
      });
      return;
    }

    const requestId = ++searchFetchSeq;
    searchAbortController?.abort();
    const controller = new AbortController();
    searchAbortController = controller;

    set({ searchLoading: true, searchQuery: trimmed });
    try {
      const { activeCity, userLat, userLng } = get();
      const url = new URL(`${API_BASE_URL}/api/bazaar/search`);
      url.searchParams.append("q", trimmed);
      url.searchParams.append("city", activeCity);
      if (userLat) url.searchParams.append("lat", userLat.toString());
      if (userLng) url.searchParams.append("lng", userLng.toString());

      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      if (requestId !== searchFetchSeq) return;

      set({
        searchProductResults: data.products || [],
        searchSellerResults: data.sellers || [],
        searchLoading: false,
      });
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError");
      if (isAbort) return;
      if (requestId !== searchFetchSeq) return;
      console.warn("Search fetch failed:", err);
      set({
        searchProductResults: [],
        searchSellerResults: [],
        searchLoading: false,
      });
    }
  },

  fetchSellerShop: async (sellerId) => {
    set({ shopLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/bazaar/sellers/${encodeURIComponent(sellerId)}/catalog`);
      if (!res.ok) throw new Error("Seller shop fetch failed");
      const data = await res.json();
      set({ shopSeller: data.seller, shopProducts: data.products, shopLoading: false });
    } catch (err) {
      console.warn("Failed to fetch seller shop:", err);
      set({ shopSeller: null, shopProducts: [], shopLoading: false });
    }
  },

  setSelectedProduct: (product) => set({
    selectedProduct: product,
    proposedBid: product ? product.price : 1000,
    negotiatedPrice: product ? product.price : 1299,
  }),
  setProposedBid: (bid) => set({ proposedBid: bid }),

  setNegotiatedPrice: (price) => set({ negotiatedPrice: price }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setChatRound: (round) => set({ chatRound: round }),
  setUserChatInput: (input) => set({ userChatInput: input }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setFulfillmentMode: (mode) => set({ fulfillmentMode: mode }),
  setCompletedRituals: (rituals) => set({ completedRituals: rituals }),
  
  resetSession: () => set({
    step: 1,
    selectedProduct: null,
    proposedBid: 1000,
    chatMessages: [],
    chatRound: 1,
    userChatInput: "",
    isTyping: false
  }),
  
  fetchBazaarForCity: async (city, simulatedDate) => {
    const dateStr = resolveSimulatedDate(simulatedDate);
    const requestId = ++bazaarFetchSeq;

    // Cancel any in-flight request so a slower stale response cannot win
    bazaarAbortController?.abort();
    const controller = new AbortController();
    bazaarAbortController = controller;

    // Discard any data tied to the previous city/date so nothing stale survives
    set({
      bazaarLoading: true,

      activeCategory: "All",
      hoveredBoutique: null,
      selectedBoutique: null,
      expandedProductId: null,

      step: 1,
      selectedProduct: null,
      proposedBid: 1000,
      negotiatedPrice: 1299,
      chatMessages: [],
      chatRound: 1,
      userChatInput: "",
      isTyping: false,
      fulfillmentMode: "delivery",
      completedRituals: [],
      
      searchQuery: "",
      searchProductResults: [],
      searchSellerResults: [],
      shopSeller: null,
      shopProducts: [],
    });
    try {
      const { userLat, userLng } = get();
      const url = new URL(`${API_BASE_URL}/api/bazaar/data`);
      url.searchParams.append("city", city);
      if (dateStr) url.searchParams.append("simulated_date", dateStr);
      if (userLat) url.searchParams.append("lat", userLat.toString());
      if (userLng) url.searchParams.append("lng", userLng.toString());

      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) throw new Error("HTTP error");
      const data = await res.json();

      // Another fetch started after us — ignore this response
      if (requestId !== bazaarFetchSeq) return;

      set({
        feedMode: data.mode || "discover",
        activeState: data.state || "",
        activeFestivalName: data.active_festival || "",
        themeColors: data.theme || null,
        boutiques: data.boutiques || [],
        allProducts: data.products || [],
        bazaarLoading: false
      });
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.name === "AbortError");
      if (isAbort) return;
      // Ignore if superseded while failing
      if (requestId !== bazaarFetchSeq) return;
      console.warn("Failed to fetch bazaar data:", err);
      set({ bazaarLoading: false });
    }
  },

  submitNegotiationOffer: async (bid, customMessage) => {
    const state = get();
    if (!state.selectedProduct) return;
    
    const msgText = customMessage || `I'll offer ₹${bid}`;
    const userMsg: ChatMessage = { sender: "user", text: msgText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    set({ chatMessages: [...state.chatMessages, userMsg], isTyping: true });
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/bazaar/negotiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: state.selectedProduct.id,
          original_price: state.selectedProduct.price,
          proposed_price: bid,
        }),
      });
      if (!res.ok) throw new Error("HTTP error");
      const data = await res.json();
      
      const shopMsg: ChatMessage = { sender: "shop", text: data.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      
      set({ 
        chatMessages: [...state.chatMessages, userMsg, shopMsg],
        negotiatedPrice: data.final_price,
        chatRound: data.status === "accepted" ? state.chatRound : state.chatRound + 1,
        isTyping: false 
      });
      
      if (data.status === "accepted") {
        setTimeout(() => set({ step: 5 }), 1500);
      }
    } catch (err) {
      console.warn("Negotiation failed:", err);
      set({ isTyping: false });
    }
  }
}));
