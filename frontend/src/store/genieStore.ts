import { create } from "zustand";

export interface GenieItem {
  id: string;
  category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY";
  name: string;
  price: number;
  image: string;
}

export interface GenieParsedContext {
  query: string;
  detectedLanguage: string;
  occasionRaw: string;
  occasionCategory: string | null;
  primaryColor: string | null;
  excludedColors: string[];
  aestheticTags: string[];
  excludedTags: string[];
  maxBudget: number | null;
  isLocalPreferred: boolean;
  confidence: "high" | "medium" | "low";
  ambiguousFields: string[];
}

interface GenieState {
  canvasItems: Record<string, GenieItem>;
  lockedItems: Record<string, boolean>;
  maxBudget: number;
  activeSwapCategory: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null;
  parsedContext: GenieParsedContext | null;

  /**
   * Virtual Try-On state
   *
   * `baseUserImage`  — The original photo the user uploaded (local data-URL or
   *                    hosted URL).  This is used as the "person" input for
   *                    IDM-VTON and is never overwritten by AI results.
   *
   * `displayImage`   — The image currently shown in the try-on viewer.  Starts
   *                    as a copy of `baseUserImage`; updated with each AI
   *                    try-on result.
   */
  baseUserImage: string | null;
  displayImage: string | null;
  hasUploadedBaseImage: boolean;

  // Actions
  toggleLock: (category: string) => void;
  setSwapCategory: (category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null) => void;
  swapItem: (category: string, newItem: GenieItem) => void;
  removeItem: (category: string) => void;
  getUsedBudget: () => number;
  setParsedContext: (context: GenieParsedContext | null) => void;
  setMaxBudget: (budget: number) => void;

  setBaseUserImage: (image: string | null) => void;
  /** Update the active displayed image (e.g. after a try-on API call). */
  setDisplayImage: (image: string | null) => void;
  setHasUploadedBaseImage: (val: boolean) => void;

  userGender: "Men" | "Women" | null;
  setUserGender: (gender: "Men" | "Women") => void;
  stylePreferences: string[];
  setStylePreferences: (prefs: string[]) => void;
}

export const useGenieStore = create<GenieState>((set, get) => ({
  canvasItems: {
    TOP: {
      id: "top_1",
      category: "TOP",
      name: "Anita Dongre Kurta",
      price: 1890,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
    },
    BOTTOM: {
      id: "bottom_1",
      category: "BOTTOM",
      name: "W Palazzo Ivory",
      price: 890,
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80",
    },
    FOOTWEAR: {
      id: "footwear_1",
      category: "FOOTWEAR",
      name: "Kolhapuri Juttis",
      price: 890,
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
    },
    ACCESSORY: {
      id: "accessory_1",
      category: "ACCESSORY",
      name: "Fossil Rose Gold",
      price: 680,
      image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=400&q=80",
    },
  },
  lockedItems: {
    TOP: false,
    BOTTOM: false,
    FOOTWEAR: false,
    ACCESSORY: true,
  },
  maxBudget: 5000,
  activeSwapCategory: null,
  parsedContext: null,
  userGender: null,
  stylePreferences: [],
  baseUserImage: null,
  displayImage: null,
  hasUploadedBaseImage: false,

  // Actions
  toggleLock: (category) =>
    set((state) => ({
      lockedItems: {
        ...state.lockedItems,
        [category]: !state.lockedItems[category],
      },
    })),

  setSwapCategory: (category) => set({ activeSwapCategory: category }),

  swapItem: (category, newItem) =>
    set((state) => ({
      canvasItems: {
        ...state.canvasItems,
        [category]: newItem,
      },
    })),

  removeItem: (category) =>
    set((state) => {
      const newItems = { ...state.canvasItems };
      delete newItems[category];
      return { canvasItems: newItems };
    }),

  getUsedBudget: () => {
    const items = get().canvasItems;
    return Object.values(items).reduce((sum, item) => sum + (item?.price || 0), 0);
  },

  setParsedContext: (context) => set({ parsedContext: context }),
  setMaxBudget: (budget) => set({ maxBudget: budget }),

  setUserGender: (gender) => set({ userGender: gender }),
  setStylePreferences: (prefs) => set({ stylePreferences: prefs }),

  setBaseUserImage: (image) => set({ baseUserImage: image, displayImage: image, hasUploadedBaseImage: true }),
  setDisplayImage: (image) => set({ displayImage: image }),
  setHasUploadedBaseImage: (val) => set({ hasUploadedBaseImage: val }),
}));
