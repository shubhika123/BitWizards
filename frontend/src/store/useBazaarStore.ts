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
  bannerTitle: string;
  bannerHighlight: string;
  bannerDesc: string;
  bannerImg: string;
  bannerBtn: string;
  bannerBadge: string;
  bannerTag: string;
  categories: { name: string; img: string; value?: string }[];
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
}

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
  })
}));
