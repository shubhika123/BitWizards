import { create } from "zustand";

export interface Boutique {
  id: string;
  name: string;
  rating: number;
  distance: number;
  speciality: string;
  verified: boolean;
  x: number;
  y: number;
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

export interface BazaarState {
  // Navigation / UI State
  step: number;
  bazaarLoading: boolean;
  showCityDropdown: boolean;
  
  // Data State
  activeCity: string;
  activeState: string;
  activeFestivalName: string;
  themeColors: ThemeColors | null;
  boutiques: Boutique[];
  allProducts: Product[];
  // Bumped whenever cached bazaar data must be discarded (e.g. simulated date change)
  dataVersion: number;
  // Simulated date the currently held data belongs to; null until first load
  dataSimulatedDate: string | null;
  
  // Discover State
  selectedRadius: number;
  activeCategory: string;
  hoveredBoutique: string | null;
  selectedBoutique: string | null;
  expandedProductId: string | null;
  
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
  invalidateBazaarData: () => void;
  syncSimulatedDate: (date: string) => void;
}

// Everything derived from the simulated date: catalog, theme, discover filters and
// any in-flight bargain. Cleared together so no screen keeps showing the old date's data.
const INVALIDATED_STATE = {
  bazaarLoading: true,

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
} satisfies Partial<BazaarState>;

export const useBazaarStore = create<BazaarState>((set) => ({
  step: 1,
  bazaarLoading: true,
  showCityDropdown: false,
  
  activeCity: "",
  activeState: "",
  activeFestivalName: "",
  themeColors: null,
  boutiques: [],
  allProducts: [],
  dataVersion: 0,
  dataSimulatedDate: null,
  
  selectedRadius: 5,
  activeCategory: "All",
  hoveredBoutique: null,
  selectedBoutique: null,
  expandedProductId: null,
  
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
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
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

  invalidateBazaarData: () => set((state) => ({
    ...INVALIDATED_STATE,
    dataVersion: state.dataVersion + 1,
  })),

  syncSimulatedDate: (date) => set((state) => {
    if (state.dataSimulatedDate === date) return {};
    return {
      ...INVALIDATED_STATE,
      dataVersion: state.dataVersion + 1,
      dataSimulatedDate: date,
    };
  })
}));
