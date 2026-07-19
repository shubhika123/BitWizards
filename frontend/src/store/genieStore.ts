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
  targetItems?: string[];
}

interface GenieState {
  canvasItems: Record<string, GenieItem>;
  lockedItems: Record<string, boolean>;
  maxBudget: number;
  activeSwapCategory: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY" | null;
  parsedContext: GenieParsedContext | null;
  initialSwapBoxes: Record<string, GenieItem[]> | null;

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
  setInitialSwapBoxes: (boxes: Record<string, GenieItem[]> | null) => void;
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
  canvasItems: {},
  lockedItems: {
    TOP: false,
    BOTTOM: false,
    FOOTWEAR: false,
    ACCESSORY: false,
  },
  maxBudget: 5000,
  activeSwapCategory: null,
  parsedContext: null,
  initialSwapBoxes: null,
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
    set((state) => {
      const oldItem = state.canvasItems[category];
      const newCanvasItems = {
        ...state.canvasItems,
        [category]: newItem,
      };

      let newInitialSwapBoxes = state.initialSwapBoxes;
      if (state.initialSwapBoxes && state.initialSwapBoxes[category] && oldItem) {
        // Remove the newly selected item from the swap box
        const updatedCategoryBoxes = state.initialSwapBoxes[category].filter(
          (item: any) => item.id !== newItem.id
        );
        // Add the old item into the swap box so it can be picked again
        updatedCategoryBoxes.unshift({
          id: oldItem.id,
          category: oldItem.category,
          name: oldItem.name,
          price: oldItem.price,
          image_url: oldItem.image,
        } as any);

        newInitialSwapBoxes = {
          ...state.initialSwapBoxes,
          [category]: updatedCategoryBoxes,
        };
      }

      return {
        canvasItems: newCanvasItems,
        initialSwapBoxes: newInitialSwapBoxes,
      };
    }),

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
  setInitialSwapBoxes: (boxes) => set({ initialSwapBoxes: boxes }),

  setMaxBudget: (budget) => set({ maxBudget: budget }),

  setUserGender: (gender) => set({ userGender: gender }),
  setStylePreferences: (prefs) => set({ stylePreferences: prefs }),

  setBaseUserImage: (image) => set({ baseUserImage: image, displayImage: image, hasUploadedBaseImage: true }),
  setDisplayImage: (image) => set({ displayImage: image }),
  setHasUploadedBaseImage: (val) => set({ hasUploadedBaseImage: val }),
}));
