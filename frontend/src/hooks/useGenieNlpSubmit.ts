"use client";

import { useCallback, useState } from "react";
import { useGenieStore, GenieParsedContext } from "../store/genieStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    setParsedContext,
    setMaxBudget,
    userGender,
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
            // Swap item only if it's not locked/pinned
            if (!lockedItems[category]) {
              swapItem(category, {
                id: item.id,
                category: category,
                name: item.name,
                price: item.price,
                image: item.image_url,
              });
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
    [setParsedContext, setMaxBudget, canvasItems, lockedItems, maxBudget, swapItem]
  );

  return { submitQuery, isParsing, lastParsedContext, error, setError };
}
