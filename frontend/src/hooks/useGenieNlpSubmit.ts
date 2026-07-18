"use client";

import { useCallback, useState } from "react";
import { useGenieStore, GenieParsedContext } from "../store/genieStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// =============================================================================
// HACKATHON DEMO MODE — Pre-baked outfits for pitch-safe demos
// =============================================================================

interface DemoOutfit {
  keywords: string[];
  gender: "Men" | "Women";
  context: GenieParsedContext;
  items: { id: string; category: "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY"; name: string; price: number; image: string }[];
}

const DEMO_OUTFITS: DemoOutfit[] = [
  {
    keywords: ["winter", "casual"],
    gender: "Men",
    context: {
      query: "Winter casual look",
      detectedLanguage: "English",
      occasionRaw: "Winter casual look",
      occasionCategory: "Casual",
      primaryColor: null,
      excludedColors: [],
      aestheticTags: ["cozy", "minimalist", "smart-casual"],
      excludedTags: [],
      maxBudget: 5000,
      isLocalPreferred: false,
      confidence: "high",
      ambiguousFields: [],
    },
    items: [
      { id: "top_007", category: "TOP", name: "Woolen Cardigan", price: 1100, image: "/catalog/top_007.jpg" },
      { id: "bottom_005", category: "BOTTOM", name: "Slim Fit Chinos", price: 990, image: "/catalog/bot_005.jpg" },
      { id: "footwear_007", category: "FOOTWEAR", name: "Casual Leather Loafers", price: 990, image: "/catalog/foot_007.jpg" },
      { id: "accessory_003", category: "ACCESSORY", name: "Chronograph Leather Watch", price: 680, image: "/catalog/acc_003.jpg" },
    ],
  },
  {
    keywords: ["office", "party"],
    gender: "Women",
    context: {
      query: "Office party look",
      detectedLanguage: "English",
      occasionRaw: "Office party look",
      occasionCategory: "Party",
      primaryColor: null,
      excludedColors: [],
      aestheticTags: ["sleek", "glam", "statement"],
      excludedTags: [],
      maxBudget: 5000,
      isLocalPreferred: false,
      confidence: "high",
      ambiguousFields: [],
    },
    items: [
      { id: "top_015", category: "TOP", name: "Girls' striped bow-detail peplum top", price: 880, image: "/catalog/top_015.jpg" },
      { id: "bottom_013", category: "BOTTOM", name: "Pencil Cut Skirt", price: 850, image: "/catalog/bot_013.jpg" },
      { id: "footwear_008", category: "FOOTWEAR", name: "Stiletto Heel Pumps", price: 1450, image: "/catalog/foot_008.jpg" },
      { id: "accessory_009", category: "ACCESSORY", name: "Evening Clutch Bag", price: 1200, image: "/catalog/acc_009.jpg" },
    ],
  },
  {
    keywords: ["haldi"],
    gender: "Women",
    context: {
      query: "Bhai ki haldi outfit",
      detectedLanguage: "Hinglish",
      occasionRaw: "Bhai ki haldi tomorrow",
      occasionCategory: "Festive",
      primaryColor: "yellow",
      excludedColors: [],
      aestheticTags: ["ethnic", "heavy", "traditional"],
      excludedTags: [],
      maxBudget: 6000,
      isLocalPreferred: false,
      confidence: "high",
      ambiguousFields: [],
    },
    items: [
      { id: "top_prompt1", category: "TOP", name: "Haldi Yellow Kurta", price: 1800, image: "/catalog/prompt1_top_wear.png" },
      { id: "bottom_prompt1", category: "BOTTOM", name: "Red Ethnic Skirt", price: 1200, image: "/catalog/prompt1_bottom_wear.png" },
      { id: "footwear_003", category: "FOOTWEAR", name: "Embellished Wedding Sandals", price: 750, image: "/catalog/foot_003.jpg" },
      { id: "accessory_prompt1", category: "ACCESSORY", name: "Yellow Ethnic Bangles", price: 450, image: "/catalog/promtp1_accesories.png" },
    ],
  },
  {
    keywords: ["हरदी", "बिहान", "हरदी बा", "हरदी स्पेशल", "hardi"],
    gender: "Women",
    context: {
      query: "बिहान भैया के हरदी बा",
      detectedLanguage: "Bhojpuri",
      occasionRaw: "बिहान भैया के हरदी बा",
      occasionCategory: "Festive",
      primaryColor: "yellow",
      excludedColors: [],
      aestheticTags: ["ethnic", "traditional"],
      excludedTags: [],
      maxBudget: 6000,
      isLocalPreferred: false,
      confidence: "high",
      ambiguousFields: [],
    },
    items: [
      { id: "top_prompt1", category: "TOP", name: "Haldi Yellow Kurta", price: 1800, image: "/catalog/prompt1_top_wear.png" },
      { id: "bottom_prompt1", category: "BOTTOM", name: "Red Ethnic Skirt", price: 1200, image: "/catalog/prompt1_bottom_wear.png" },
      { id: "footwear_003", category: "FOOTWEAR", name: "Embellished Wedding Sandals", price: 750, image: "/catalog/foot_003.jpg" },
      { id: "accessory_prompt1", category: "ACCESSORY", name: "Yellow Ethnic Bangles", price: 450, image: "/catalog/promtp1_accesories.png" },
    ],
  }
];

function matchDemoOutfit(query: string): DemoOutfit | null {
  const q = query.toLowerCase();
  for (const demo of DEMO_OUTFITS) {
    if (demo.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return demo;
    }
  }
  return null;
}

function buildFallbackContext(prompt: string): GenieParsedContext {
  const queryLower = prompt.toLowerCase();
  const fallbackContext: GenieParsedContext = {
    query: prompt,
    detectedLanguage: "English",
    occasionRaw: prompt,
    occasionCategory: "Casual Wear",
    primaryColor: null,
    excludedColors: [],
    aestheticTags: [],
    excludedTags: [],
    maxBudget: null,
    isLocalPreferred: false,
    confidence: "low",
    ambiguousFields: ["occasionCategory", "primaryColor"],
  };

  if (
    ["khatir", "badhiya", "dikha", "da", "bhaauji", "hamar", "खातिर", "बढ़िया", "खरीदे", "खाती", "दा", "हमार", "रउआ"].some(
      (w) => queryLower.includes(w)
    )
  ) {
    fallbackContext.detectedLanguage = "Bhojpuri";
  } else if (["naa", "kosam", "manchi", "battalu", "kavali"].some((w) => queryLower.includes(w))) {
    fallbackContext.detectedLanguage = "Telugu";
  } else if (
    [
      "bhai",
      "ki",
      "shaadi",
      "liye",
      "ek",
      "dum",
      "dikhao",
      "शादी",
      "भाई",
      "के",
      "लिए",
      "एक",
      "दम",
      "सस्ता",
      "दिखाओ",
      "सूट",
      "कुर्ता",
      "शेरवानी",
    ].some((w) => queryLower.includes(w))
  ) {
    fallbackContext.detectedLanguage = "Hinglish";
  }

  const occasionsMap: Record<string, string> = {
    shaadi: "Wedding",
    wedding: "Wedding",
    marriage: "Wedding",
    "शादी": "Wedding",
    "विवाह": "Wedding",
    "ब्याह": "Wedding",
    "दूल्हा": "Wedding",
    sangeet: "Sangeet",
    "संगीत": "Sangeet",
    haldi: "Haldi",
    "हल्दी": "Haldi",
    mehendi: "Mehendi",
    "मेहंदी": "Mehendi",
    fest: "College Fest",
    college: "College Fest",
    conference: "Tech Conference",
    office: "Office Wear",
    "ऑफिस": "Office Wear",
    party: "Party Wear",
    "पार्टी": "Party Wear",
    function: "Family Function",
    "फंक्शन": "Family Function",
    "सूट": "Wedding",
  };
  for (const [key, val] of Object.entries(occasionsMap)) {
    if (queryLower.includes(key)) {
      fallbackContext.occasionCategory = val;
      break;
    }
  }

  const colorsMap: Record<string, string> = {
    black: "black",
    "काला": "black",
    "काले": "black",
    white: "white",
    "सफेद": "white",
    "उजला": "white",
    yellow: "yellow",
    "पीला": "yellow",
    "पीले": "yellow",
    red: "red",
    "लाल": "red",
    blue: "blue",
    "नीला": "blue",
    "नीले": "blue",
    pink: "pink",
    "गुलाबी": "pink",
    green: "green",
    "हरा": "green",
    "हरे": "green",
    gold: "gold",
    "सुनहरा": "gold",
    "गोल्डन": "gold",
    ivory: "ivory",
    "rose gold": "rose gold",
  };
  for (const [key, val] of Object.entries(colorsMap)) {
    if (queryLower.includes(key)) {
      fallbackContext.primaryColor = val;
      break;
    }
  }

  const budgetMatch = queryLower.match(
    /(?:under|below|budget\s*(?:of|:)?|rs\.?|in|₹|max|upto|कम|अंदर|तक|बजट|रुपये|रु\.?)\s*(\d+)\s*(k)?/
  );
  const budgetMatchHindi = queryLower.match(/(\d+)\s*(k)?\s*(?:से कम|के अंदर|तक|बजट|रुपये|रु|k)/);
  const finalMatch = budgetMatch || budgetMatchHindi;

  if (finalMatch) {
    let val = parseInt(finalMatch[1], 10);
    if (finalMatch[2]) val *= 1000;
    fallbackContext.maxBudget = val;
  } else if (queryLower.includes("5k")) {
    fallbackContext.maxBudget = 5000;
  } else if (queryLower.includes("2k")) {
    fallbackContext.maxBudget = 2000;
  }

  return fallbackContext;
}

export function buildGenieReplyText(context: GenieParsedContext): string {
  const occasion = context.occasionCategory || context.occasionRaw || "your occasion";
  const budgetPart = context.maxBudget
    ? ` under ₹${context.maxBudget.toLocaleString()}`
    : "";
  const colorPart = context.primaryColor ? ` in ${context.primaryColor}` : "";
  return `Got it — I'll style you for ${occasion}${colorPart}${budgetPart}. Your personalized look preview on your digital twin is coming next — keep chatting to refine the vibe.`;
}

export function useGenieNlpSubmit() {
  const {
    canvasItems,
    lockedItems,
    maxBudget,
    swapItem,
    removeItem,
    setParsedContext,
    setMaxBudget,
    userGender,
    stylePreferences,
  } = useGenieStore();
  const [isParsing, setIsParsing] = useState(false);
  const [lastParsedContext, setLastParsedContext] = useState<GenieParsedContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitQuery = useCallback(
    async (query: string): Promise<GenieParsedContext | null> => {
      const trimmed = query.trim();
      if (!trimmed) return null;

      setIsParsing(true);
      setError(null);

      // --- DEMO MODE INTERCEPTOR ---
      const demoMatch = matchDemoOutfit(trimmed);
      if (demoMatch) {
        console.log("[DEMO MODE] Matched demo outfit:", demoMatch.context.occasionRaw);
        
        // Bouncing dots delay (2.5s) to make backend parsing look realistic during hackathon pitch
        await new Promise((resolve) => setTimeout(resolve, 2500));

        const demoContext = demoMatch.context;
        setParsedContext(demoContext);
        if (demoContext.maxBudget) setMaxBudget(demoContext.maxBudget);

        // Directly swap items into the canvas only if they are in the selected stylePreferences!
        for (const item of demoMatch.items) {
          if (stylePreferences.includes(item.category)) {
            swapItem(item.category, {
              id: item.id,
              category: item.category,
              name: item.name,
              price: item.price,
              image: item.image,
            });
          } else {
            removeItem(item.category);
          }
        }

        setIsParsing(false);
        setLastParsedContext(demoContext);
        return demoContext;
      }
      // --- END DEMO MODE ---

      let currentContext: GenieParsedContext | null = null;

      try {
        const response = await fetch(`${API_BASE}/api/genie/parse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });

        if (response.ok) {
          const data = await response.json();
          currentContext = {
            query: data.query ?? trimmed,
            detectedLanguage: data.detected_language,
            occasionRaw: data.occasion_raw,
            occasionCategory: data.occasion_category,
            primaryColor: data.primary_color,
            excludedColors: data.excluded_colors || [],
            aestheticTags: data.aesthetic_tags || [],
            excludedTags: data.excluded_tags || [],
            maxBudget: data.max_budget,
            isLocalPreferred: data.is_local_preferred,
            confidence: data.confidence,
            ambiguousFields: data.ambiguous_fields || [],
          };
          setParsedContext(currentContext);
          if (data.max_budget) setMaxBudget(data.max_budget);
        } else {
          throw new Error("Failed to call backend parser");
        }
      } catch (err) {
        console.warn("Backend parsing failed, using client-side fallback.", err);
        currentContext = buildFallbackContext(trimmed);
        setParsedContext(currentContext);
        if (currentContext.maxBudget) setMaxBudget(currentContext.maxBudget);
      }

      // Automatically trigger curation call with current state + parsed context
      try {
        const lockedItemIds = Object.entries(lockedItems)
          .filter(([_, isLocked]) => isLocked)
          .map(([category]) => canvasItems[category]?.id)
          .filter(Boolean);

        const curateResponse = await fetch(`${API_BASE}/api/genie/curate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            occasion_category: currentContext?.occasionCategory || "Casual Wear",
            user_gender: userGender,
            primary_color: currentContext?.primaryColor || null,
            excluded_colors: currentContext?.excludedColors || [],
            aesthetic_tags: currentContext?.aestheticTags || [],
            max_budget: currentContext?.maxBudget || maxBudget,
            is_local_preferred: currentContext?.isLocalPreferred || false,
            locked_item_ids: lockedItemIds,
          }),
        });

        if (curateResponse.ok) {
          const curatedResult = await curateResponse.json();
          const curatedItems = curatedResult.outfit || [];

          curatedItems.forEach((item: any) => {
            const category = item.category as "TOP" | "BOTTOM" | "FOOTWEAR" | "ACCESSORY";
            // Swap item only if it's not locked/pinned and is in style preferences
            if (stylePreferences.includes(category)) {
              if (!lockedItems[category]) {
                swapItem(category, {
                  id: item.id,
                  category: category,
                  name: item.name,
                  price: item.price,
                  image: item.image_url,
                });
              }
            } else {
              removeItem(category);
            }
          });
        }
      } catch (curateErr) {
        console.warn("Curation API call failed, no client-side mock swap available in hook.", curateErr);
      } finally {
        setIsParsing(false);
        setLastParsedContext(currentContext);
      }

      return currentContext;
    },
    [setParsedContext, setMaxBudget, canvasItems, lockedItems, maxBudget, swapItem, removeItem, stylePreferences]
  );

  return { submitQuery, isParsing, lastParsedContext, error, setError };
}
