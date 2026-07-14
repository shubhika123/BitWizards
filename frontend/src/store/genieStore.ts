import { create } from "zustand";

export interface GenieItem {
  id: string;
  category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY";
  name: string;
  price: number;
  image: string;
}

interface GenieState {
  canvasItems: Record<string, GenieItem>;
  lockedItems: Record<string, boolean>;
  maxBudget: number;
  dummySettings: {
    height: number;
    weight: number;
    size: string;
    skinTone: string;
  };
  activeSwapCategory: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null;
  
  // Actions
  toggleLock: (category: string) => void;
  setSwapCategory: (category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null) => void;
  swapItem: (category: string, newItem: GenieItem) => void;
  updateDummy: (settings: Partial<GenieState["dummySettings"]>) => void;
  getUsedBudget: () => number;
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
    ACCESSORY: true, // Accessory is locked/pinned in the screenshot
  },
  maxBudget: 5000,
  dummySettings: {
    height: 162,
    weight: 58,
    size: "S",
    skinTone: "#E8C39E",
  },
  activeSwapCategory: "FOOTWEAR", // Footwear is active for swap in the screenshot
  
  toggleLock: (category) => set((state) => ({
    lockedItems: {
      ...state.lockedItems,
      [category]: !state.lockedItems[category],
    }
  })),
  
  setSwapCategory: (category) => set({ activeSwapCategory: category }),
  
  swapItem: (category, newItem) => set((state) => ({
    canvasItems: {
      ...state.canvasItems,
      [category]: newItem,
    }
  })),
  
  updateDummy: (settings) => set((state) => ({
    dummySettings: {
      ...state.dummySettings,
      ...settings,
    }
  })),
  
  getUsedBudget: () => {
    const items = get().canvasItems;
    return Object.values(items).reduce((sum, item) => sum + item.price, 0);
  },
}));
