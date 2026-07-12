"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  CloudSun, 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  Tag, 
  CheckCircle, 
  ShoppingBag, 
  ArrowRight, 
  ChevronRight, 
  X, 
  User, 
  Users, 
  Share2, 
  Plus, 
  Sliders,
  DollarSign
} from "lucide-react";

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  sub_category: string;
  price: number;
  region: string;
  festivals: string[];
  weather: string[];
  budget_bracket: string;
  style: string;
  description: string;
  image_url: string;
  local_boutique: string;
  rating: number;
  ai_reason?: string;
  ai_review_summary?: string;
  reviews?: string[];
}

interface Boutique {
  id: string;
  name: string;
  city: string;
  rating: number;
  verified: boolean;
  distance_km: number;
  speciality: string;
  avatar: string;
}

interface OutfitCircleItem {
  id: string;
  product_id: string;
  votes: number;
  voted_by: string[];
  comments: { user: string; text: string }[];
  product?: Product;
}

interface OutfitCircleGroup {
  id: string;
  name: string;
  members_count: number;
  creator: string;
  items: OutfitCircleItem[];
}

// Local Database Fallback (matching backend/app/services/database.py)
const LOCAL_PRODUCTS_MOCK: Product[] = [
  {
    id: "prod_1",
    name: "Handcrafted Chikankari Cotton Kurta",
    category: "Ethnic Wear",
    sub_category: "Kurta",
    price: 1299,
    region: "Lucknow",
    festivals: ["Raksha Bandhan", "Teej", "Eid"],
    weather: ["Summer", "Humid", "Monsoon"],
    budget_bracket: "budget",
    style: "Traditional Elegant",
    description: "Premium hand-woven cotton Chikankari kurta in pastel shades. Breathable fabric perfect for warm weather and festive family gatherings.",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Avadh Weaves",
    rating: 4.5,
    reviews: [
      "Super comfortable for summer. The chikankari embroidery is genuine.",
      "Loved the material, size fits perfectly. Recommended for Teej!"
    ]
  },
  {
    id: "prod_2",
    name: "Jaipur Bandhani Printed Anarkali Suit Set",
    category: "Ethnic Wear",
    sub_category: "Suit Set",
    price: 2499,
    region: "Jaipur",
    festivals: ["Teej", "Diwali", "Karwa Chauth"],
    weather: ["Summer", "Dry"],
    budget_bracket: "mid-range",
    style: "Traditional Bright",
    description: "Vibrant Jaipur Bandhani tie-dye Anarkali suit with beautiful gotta-patti borders. Comes with a matching chiffon dupatta.",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Rajputana Heritage Boutique",
    rating: 4.7,
    reviews: [
      "Wore it for Teej, got so many compliments! True Rajasthani vibe.",
      "Bright colors, didn't bleed after first wash. Great quality."
    ]
  },
  {
    id: "prod_3",
    name: "Classic Kerala Kasavu Saree with Golden Zari",
    category: "Ethnic Wear",
    sub_category: "Saree",
    price: 1850,
    region: "Kerala",
    festivals: ["Onam", "Vishu", "Weddings"],
    weather: ["Humid", "Rainy", "Summer"],
    budget_bracket: "budget",
    style: "Traditional Minimalist",
    description: "Authentic Kerala Kasavu handloom cotton saree with fine golden zari border. Lightweight, traditional off-white drape.",
    image_url: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Nair Handlooms",
    rating: 4.8,
    reviews: [
      "Exactly what I needed for Onam. Pure cotton, comfortable in humid weather.",
      "Beautiful gold border. Drapes perfectly."
    ]
  },
  {
    id: "prod_4",
    name: "Royal Kanjeevaram Silk Saree",
    category: "Ethnic Wear",
    sub_category: "Saree",
    price: 4500,
    region: "Coimbatore",
    festivals: ["Diwali", "Pongal", "Weddings"],
    weather: ["Cool", "Dry"],
    budget_bracket: "premium",
    style: "Grand Traditional",
    description: "Luxurious Coimbatore-woven silk saree with intricate temple motifs and rich zari border. Perfect for brides and wedding guests.",
    image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Coimbatore Silk House",
    rating: 4.9,
    reviews: [
      "Pure silk mark certified. The shine and drape are outstanding.",
      "Absolutely beautiful for my sister's wedding in Chennai. Highly recommended."
    ]
  },
  {
    id: "prod_5",
    name: "Oversized Streetwear Tee - Monsoon Drop",
    category: "Western Wear",
    sub_category: "T-Shirt",
    price: 799,
    region: "Delhi",
    festivals: ["College Fest", "Daily Wear"],
    weather: ["Monsoon", "Rainy", "Summer"],
    budget_bracket: "budget",
    style: "GenZ Streetwear",
    description: "Heavyweight 240 GSM cotton oversized t-shirt with graffiti print back. Drop shoulder fit, ideal for college campuses.",
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Dilli Rebels Co.",
    rating: 4.3,
    reviews: [
      "Super thick cotton, feels like an expensive streetwear brand.",
      "Great fit, prints don't fade. Awesome styling with cargos."
    ]
  },
  {
    id: "prod_6",
    name: "Utility Cargo Pants with Adjustable Straps",
    category: "Western Wear",
    sub_category: "Cargos",
    price: 1499,
    region: "Delhi",
    festivals: ["College Fest", "Daily Wear"],
    weather: ["Cool", "Dry", "Monsoon"],
    budget_bracket: "budget",
    style: "GenZ Streetwear",
    description: "Multi-pocket cargo pants in durable cotton-twill fabric. Features drawstrings at cuffs and relaxed tactical fit.",
    image_url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Dilli Rebels Co.",
    rating: 4.4,
    reviews: [
      "Lots of pockets! Durable fabric and looks very stylish.",
      "A bit long but the drawstring at the bottom solved it. Perfect streetwear."
    ]
  },
  {
    id: "prod_7",
    name: "Traditional Lal Paar Cotton Saree",
    category: "Ethnic Wear",
    sub_category: "Saree",
    price: 1150,
    region: "Patna",
    festivals: ["Durga Puja", "Chhath Puja", "Saraswati Puja"],
    weather: ["Summer", "Humid"],
    budget_bracket: "budget",
    style: "Traditional Iconic",
    description: "Authentic white cotton saree with a broad red border (Lal Paar). Classic Bengali / Bihari traditional drape for auspicious occasions.",
    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Pataliputra Weaves",
    rating: 4.6,
    reviews: [
      "Lightweight, perfect for Chhath Puja morning arghya.",
      "True to description, soft cotton fabric."
    ]
  },
  {
    id: "prod_8",
    name: "Banarasi Silk Sharara Suit Set",
    category: "Ethnic Wear",
    sub_category: "Sharara",
    price: 3200,
    region: "Vizag",
    festivals: ["Eid", "Diwali", "Weddings"],
    weather: ["Cool", "Dry"],
    budget_bracket: "premium",
    style: "Glamour Ethnic",
    description: "Royal Banarasi brocade short kurti paired with a flared sharara pants and net dupatta. Rich weaving details.",
    image_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    local_boutique: "Vizag Ethnic Hub",
    rating: 4.7,
    reviews: [
      "Flared sharara is huge, looks like a lehenga. Brocade shines beautifully.",
      "Wore it to my friend's sangeet, everyone loved it."
    ]
  }
];

const LOCAL_BOUTIQUES_MOCK: Boutique[] = [
  { id: "boutique_1", name: "Avadh Weaves", city: "Lucknow", rating: 4.8, verified: true, distance_km: 2.4, speciality: "Handmade Chikankari", avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80" },
  { id: "boutique_2", name: "Rajputana Heritage Boutique", city: "Jaipur", rating: 4.9, verified: true, distance_km: 1.8, speciality: "Bandhani & Gotta Patti", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" },
  { id: "boutique_3", name: "Nair Handlooms", city: "Kerala", rating: 4.7, verified: true, distance_km: 3.1, speciality: "Traditional Kerala Handlooms", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80" },
  { id: "boutique_4", name: "Coimbatore Silk House", city: "Coimbatore", rating: 4.9, verified: true, distance_km: 1.2, speciality: "Kanjeevaram & Cotton Silks", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { id: "boutique_5", name: "Dilli Rebels Co.", city: "Delhi", rating: 4.5, verified: true, distance_km: 4.0, speciality: "Monsoon Streetwear & Over-sized Apparel", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { id: "boutique_6", name: "Pataliputra Weaves", city: "Patna", rating: 4.6, verified: true, distance_km: 2.9, speciality: "Traditional Cotton & Tussar Sarees", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" }
];

export default function Home() {
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<"feed" | "bazaar" | "social">("feed");
  
  // App States (User context selector)
  const [region, setRegion] = useState<string>("Lucknow");
  const [weather, setWeather] = useState<string>("Summer");
  const [festival, setFestival] = useState<string>("Raksha Bandhan");
  const [budget, setBudget] = useState<number>(3000);
  const [stylePreference, setStylePreference] = useState<string>("Traditional");
  
  // Catalog & Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [regionalTrends, setRegionalTrends] = useState<string[]>([]);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Detail Modal & Negotiation Panel
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showReviewSummary, setShowReviewSummary] = useState<boolean>(false);
  const [negotiationProduct, setNegotiationProduct] = useState<Product | null>(null);
  const [proposedBid, setProposedBid] = useState<number>(1000);
  const [negotiationResult, setNegotiationResult] = useState<{
    status: string;
    final_price: number;
    message: string;
  } | null>(null);

  // Outfit Circle States
  const [outfitGroups, setOutfitGroups] = useState<OutfitCircleGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<string>("Kuhu");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Fetch Feed on Context Change
  useEffect(() => {
    fetchFeed();
    fetchBoutiques();
  }, [region, weather, festival, budget, stylePreference]);

  // Initial Social Circles fetch
  useEffect(() => {
    fetchSocialCircles();
  }, []);

  // Theme Dynamic styles mapping
  const getThemeStyles = () => {
    switch (region) {
      case "Jaipur":
        return {
          bannerBg: "bg-gradient-to-r from-orange-500 via-amber-500 to-pink-500",
          accentColor: "text-orange-600",
          borderColor: "border-orange-200",
          btnColor: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
          highlightBg: "bg-orange-50 text-orange-800",
          textColor: "text-orange-950",
          gradientText: "from-orange-600 to-pink-600"
        };
      case "Kerala":
        return {
          bannerBg: "bg-gradient-to-r from-yellow-600 via-amber-400 to-emerald-600",
          accentColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          btnColor: "bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-500",
          highlightBg: "bg-emerald-50 text-emerald-800",
          textColor: "text-emerald-950",
          gradientText: "from-emerald-700 to-yellow-600"
        };
      case "Delhi":
        return {
          bannerBg: "bg-gradient-to-r from-gray-900 via-slate-800 to-cyan-900",
          accentColor: "text-cyan-500",
          borderColor: "border-slate-700",
          btnColor: "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500",
          highlightBg: "bg-slate-800 text-cyan-400",
          textColor: "text-white",
          gradientText: "from-cyan-400 to-indigo-500"
        };
      case "Patna":
        return {
          bannerBg: "bg-gradient-to-r from-red-600 via-orange-500 to-amber-600",
          accentColor: "text-red-600",
          borderColor: "border-red-200",
          btnColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          highlightBg: "bg-red-50 text-red-800",
          textColor: "text-red-950",
          gradientText: "from-red-600 to-orange-600"
        };
      case "Lucknow":
      default:
        return {
          bannerBg: "bg-gradient-to-r from-teal-500 via-emerald-400 to-yellow-200",
          accentColor: "text-emerald-600",
          borderColor: "border-emerald-200",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
          highlightBg: "bg-emerald-50 text-emerald-800",
          textColor: "text-emerald-950",
          gradientText: "from-emerald-600 to-teal-600"
        };
    }
  };

  const theme = getThemeStyles();

  // API Call: Fetch Personalized Feed
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          weather,
          festival: festival === "None" ? null : festival,
          budget,
          style: stylePreference
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setRegionalTrends(data.regional_trends);
        setIsBackendConnected(true);
      } else {
        throw new Error("Backend response error");
      }
    } catch (e) {
      console.warn("Backend not active, fallback to local scoring algorithms.");
      setIsBackendConnected(false);
      runLocalScoringFeed();
    } finally {
      setLoading(false);
    }
  };

  // Local fallback: Calculate personalized feed ranking
  const runLocalScoringFeed = () => {
    const scored = LOCAL_PRODUCTS_MOCK.map(p => {
      let score = 0;
      
      if (region && p.region.toLowerCase() === region.toLowerCase()) score += 3;
      if (festival && festival !== "None" && p.festivals.some(f => f.toLowerCase() === festival.toLowerCase())) score += 4;
      if (weather && p.weather.some(w => w.toLowerCase() === weather.toLowerCase())) score += 2;
      if (budget && p.price <= budget) score += 2;
      else if (budget) score -= 3;
      if (stylePreference && p.style.toLowerCase().includes(stylePreference.toLowerCase())) score += 2;
      
      score += p.rating;

      // Local generative AI reasons fallback
      const ai_reason = `✓ Recommended for your active location ${region}\n✓ Matches upcoming celebration: ${festival !== "None" ? festival : "Daily Fashion"}\n✓ Comfortable in ${weather} weather`;
      const ai_review_summary = `✓ Durable fabrics approved by buyers in ${region}\n✓ Order normal size\n✓ Great pricing for Indian families`;

      return { ...p, score, ai_reason, ai_review_summary };
    });

    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    setProducts(scored);
    
    // Regional trends mapping
    const trendsMap: Record<string, string[]> = {
      Lucknow: ["Chikankari Kurtas", "Pastel Shades", "Cotton Dupattas"],
      Jaipur: ["Bandhani Print Dupattas", "Gotta Patti Suits", "Rajasthani Mojris"],
      Kerala: ["Kasavu Sarees", "Golden Border Veshthis", "Humid-friendly Linens"],
      Delhi: ["Oversized Tees", "Utility Cargos", "Platform Sneakers"],
      Patna: ["Lal Paar Sarees", "Tussar Silk Shawls", "Handloom Cottons"]
    };
    setRegionalTrends(trendsMap[region] || ["Oversized Tees", "Festive Kurtas", "Cotton Sarees"]);
  };

  // API Call: Fetch Boutiques
  const fetchBoutiques = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/bazaar/boutiques?city=${region}`);
      if (res.ok) {
        const data = await res.json();
        setBoutiques(data);
      } else {
        throw new Error("Backend boutique error");
      }
    } catch (e) {
      // Fallback
      const filtered = LOCAL_BOUTIQUES_MOCK.filter(b => b.city.toLowerCase() === region.toLowerCase() || b.city === "Delhi");
      setBoutiques(filtered);
    }
  };

  // API Call: Search Products
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchActive(true);
    setActiveTab("feed");

    try {
      const res = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          region,
          weather
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setParsedIntent(data.parsed_intent);
      } else {
        throw new Error("Search backend failed");
      }
    } catch (err) {
      console.warn("Search fallback used.");
      runLocalSearch();
    } finally {
      setLoading(false);
    }
  };

  // Local fallback: Parse and search
  const runLocalSearch = () => {
    const q = searchQuery.toLowerCase();
    
    // Simple mock intent parser
    const parsed = {
      festival: q.includes("teej") ? "Teej" : q.includes("onam") ? "Onam" : q.includes("wedding") ? "Wedding" : null,
      region: q.includes("jaipur") ? "Jaipur" : q.includes("lucknow") ? "Lucknow" : q.includes("kerala") ? "Kerala" : null,
      weather: q.includes("monsoon") || q.includes("rain") ? "Monsoon" : q.includes("cotton") || q.includes("summer") ? "Summer" : null,
      budget: q.includes("under 2000") ? 2000 : q.includes("under 1500") ? 1500 : q.includes("under 1000") ? 1000 : null,
      categories: q.includes("saree") ? ["saree"] : q.includes("kurta") || q.includes("kurti") ? ["kurta"] : q.includes("tee") || q.includes("streetwear") ? ["t-shirt"] : []
    };

    setParsedIntent(parsed);

    // Search and rank
    const filtered = LOCAL_PRODUCTS_MOCK.filter(p => {
      // Category filter
      if (parsed.categories.length > 0) {
        return parsed.categories.some(cat => 
          p.name.toLowerCase().includes(cat) || 
          p.category.toLowerCase().includes(cat) ||
          p.sub_category.toLowerCase().includes(cat)
        );
      }
      return true;
    }).map(p => {
      let score = 0;
      if (parsed.festival && p.festivals.some(f => f.toLowerCase() === parsed.festival?.toLowerCase())) score += 8;
      if (parsed.region && p.region.toLowerCase() === parsed.region.toLowerCase()) score += 5;
      if (parsed.budget && p.price <= parsed.budget) score += 5;
      if (q.split(" ").some(word => p.name.toLowerCase().includes(word))) score += 4;
      
      const ai_reason = `✓ Matched parsed category from query \n✓ Fits price filter: ₹${p.price} \n✓ Highly requested regional handcraft`;
      return { ...p, score, ai_reason };
    });

    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    setProducts(filtered);
  };

  // API Call: Negotiate Price
  const handleNegotiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiationProduct) return;

    try {
      const res = await fetch("http://localhost:8000/api/bazaar/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boutique_id: "boutique_1",
          product_id: negotiationProduct.id,
          proposed_price: proposedBid,
          original_price: negotiationProduct.price
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiationResult(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Local bargaining fallback
      const original = negotiationProduct.price;
      const ratio = proposedBid / original;
      
      if (proposedBid >= original) {
        setNegotiationResult({
          status: "accepted",
          final_price: original,
          message: "Thank you! The boutique accepted the retail price."
        });
      } else if (ratio >= 0.90) {
        setNegotiationResult({
          status: "accepted",
          final_price: proposedBid,
          message: `Deal! The local boutique boutique accepted your offer of ₹${proposedBid} for Onam/Teej festivities.`
        });
      } else if (ratio >= 0.80) {
        const counter = Math.round(((original + proposedBid) / 2) / 10) * 10;
        setNegotiationResult({
          status: "counter-offered",
          final_price: counter,
          message: `The boutique responded: 'Since you are our valued local client, we can split the difference at ₹${counter}. Deal?'`
        });
      } else {
        const counter = Math.round((original * 0.85) / 10) * 10;
        setNegotiationResult({
          status: "counter-offered",
          final_price: counter,
          message: `Bid too low for handcrafted weaving. The artisan offered a best price of ₹${counter}.`
        });
      }
    }
  };

  // API Call: Outfit Circles (Social)
  const fetchSocialCircles = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/social/groups");
      if (res.ok) {
        const data = await res.json();
        setOutfitGroups(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Mock data circles
      const initialGroups: OutfitCircleGroup[] = [
        {
          id: "group_1",
          name: "Jaipur Wedding Prep",
          members_count: 4,
          creator: "Kuhu",
          items: [
            {
              id: "item_1",
              product_id: "prod_2",
              votes: 12,
              voted_by: ["Kuhu", "Aditi", "Rohan"],
              comments: [
                { user: "Aditi", text: "This pink bandhani suits the theme perfectly!" },
                { user: "Rohan", text: "Nice, matches the Jaipur vibe." }
              ],
              product: LOCAL_PRODUCTS_MOCK[1]
            },
            {
              id: "item_2",
              product_id: "prod_8",
              votes: 5,
              voted_by: ["Kuhu", "Sneha"],
              comments: [
                { user: "Sneha", text: "Sharara is good but might be too heavy for noon events." }
              ],
              product: LOCAL_PRODUCTS_MOCK[7]
            }
          ]
        },
        {
          id: "group_2",
          name: "College Fest Streetwear",
          members_count: 5,
          creator: "Rohan",
          items: [
            {
              id: "item_3",
              product_id: "prod_5",
              votes: 18,
              voted_by: ["Rohan", "Aditya", "Vikram", "Neha"],
              comments: [
                { user: "Aditya", text: "Insta-cop. Oversized fit is fire." },
                { user: "Neha", text: "Are you planning to wear cargos with this?" }
              ],
              product: LOCAL_PRODUCTS_MOCK[4]
            }
          ]
        }
      ];
      setOutfitGroups(initialGroups);
    }
  };

  // Vote outfit item handler
  const handleVote = async (groupId: string, itemId: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/social/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, item_id: itemId, user: currentUser })
      });
      if (res.ok) {
        fetchSocialCircles();
      } else {
        throw new Error();
      }
    } catch (e) {
      // Local toggle vote state
      const updated = outfitGroups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map(item => {
            if (item.id !== itemId) return item;
            const hasVoted = item.voted_by.includes(currentUser);
            const votes = hasVoted ? item.votes - 1 : item.votes + 1;
            const voted_by = hasVoted 
              ? item.voted_by.filter(u => u !== currentUser) 
              : [...item.voted_by, currentUser];
            return { ...item, votes, voted_by };
          })
        };
      });
      setOutfitGroups(updated);
    }
  };

  // Add comment handler
  const handleAddComment = async (groupId: string, itemId: string) => {
    const text = commentInputs[`${groupId}-${itemId}`];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, item_id: itemId, user: currentUser, text })
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [`${groupId}-${itemId}`]: "" }));
        fetchSocialCircles();
      } else {
        throw new Error();
      }
    } catch (e) {
      // Local state add comment fallback
      const updated = outfitGroups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map(item => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              comments: [...item.comments, { user: currentUser, text }]
            };
          })
        };
      });
      setOutfitGroups(updated);
      setCommentInputs(prev => ({ ...prev, [`${groupId}-${itemId}`]: "" }));
    }
  };

  // Create new Outfit Circle Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/social/groups/create?name=${encodeURIComponent(newGroupName)}&creator=${currentUser}`, {
        method: "POST"
      });
      if (res.ok) {
        setNewGroupName("");
        fetchSocialCircles();
      } else {
        throw new Error();
      }
    } catch (e) {
      const newGroup: OutfitCircleGroup = {
        id: `group_${outfitGroups.length + 1}`,
        name: newGroupName,
        members_count: 1,
        creator: currentUser,
        items: []
      };
      setOutfitGroups([...outfitGroups, newGroup]);
      setNewGroupName("");
    }
  };

  // Add Item to Outfit Circle
  const handleAddItemToCircle = async (groupId: string, productId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/social/groups/${groupId}/add-item?product_id=${productId}`, {
        method: "POST"
      });
      if (res.ok) {
        fetchSocialCircles();
        alert("Product added successfully to your Outfit Circle!");
      } else {
        throw new Error();
      }
    } catch (e) {
      // Local fallback
      const updated = outfitGroups.map(g => {
        if (g.id !== groupId) return g;
        const alreadyExists = g.items.some(i => i.product_id === productId);
        if (alreadyExists) return g;

        const product = LOCAL_PRODUCTS_MOCK.find(p => p.id === productId);
        const newItem: OutfitCircleItem = {
          id: `item_${g.items.length + 101}`,
          product_id: productId,
          votes: 0,
          voted_by: [],
          comments: [],
          product
        };
        return {
          ...g,
          items: [...g.items, newItem]
        };
      });
      setOutfitGroups(updated);
      alert("Product added successfully to your Outfit Circle (local simulation)!");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
    setParsedIntent(null);
    fetchFeed();
  };

  return (
    <div className="bg-[#0b0c10] text-[#c5c6c7] min-h-screen flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-[#1f2833] bg-[#0b0c10]/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-pink-500 font-extrabold text-2xl tracking-wider">myntra</span>
            <span className="bg-pink-500/10 text-pink-500 border border-pink-500/20 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
              Bharat Layer
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold tracking-wide text-gray-300">
            <button 
              onClick={() => { setActiveTab("feed"); setSearchActive(false); }} 
              className={`hover:text-pink-500 transition-colors ${activeTab === "feed" && !searchActive ? "text-pink-500" : ""}`}
            >
              Bharat Feed
            </button>
            <button 
              onClick={() => setActiveTab("bazaar")} 
              className={`hover:text-pink-500 transition-colors ${activeTab === "bazaar" ? "text-pink-500" : ""}`}
            >
              Local Bazaar
            </button>
            <button 
              onClick={() => setActiveTab("social")} 
              className={`hover:text-pink-500 transition-colors ${activeTab === "social" ? "text-pink-500" : ""}`}
            >
              Outfit Circle
            </button>
          </nav>
        </div>

        {/* Backend Connection Health Check */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#1f2833] px-2.5 py-1 rounded-full text-gray-400">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}></span>
            {isBackendConnected ? "FastAPI: Connected" : "Local Mock Simulation Active"}
          </div>
          
          <div className="flex items-center gap-1 border border-pink-500/20 bg-pink-500/5 px-2.5 py-1 rounded-full text-pink-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col xl:flex-row gap-6 max-w-[1700px] w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Left Control Panel / Interactive Parameters Configurator */}
        <aside className="w-full xl:w-80 bg-[#1f2833] p-5 rounded-2xl border border-[#2f3b4c] shrink-0 self-start">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
            <Sliders className="w-4 h-4 text-pink-500" />
            <h2 className="text-lg font-bold text-white tracking-wide">AI Bharat Controls</h2>
          </div>

          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            Adjust these regional parameters to simulate how Myntra's Bharat Layer responds dynamically to location, weather, and cultural context.
          </p>

          <div className="space-y-4">
            
            {/* Region Select */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                📍 Location (T2/T3 Regionality)
              </label>
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#2f3b4c] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
              >
                <option value="Lucknow">Lucknow (Uttar Pradesh)</option>
                <option value="Jaipur">Jaipur (Rajasthan)</option>
                <option value="Kerala">Kochi (Kerala)</option>
                <option value="Delhi">Delhi / NCR</option>
                <option value="Patna">Patna (Bihar)</option>
                <option value="Coimbatore">Coimbatore (Tamil Nadu)</option>
                <option value="Vizag">Vizag (Andhra Pradesh)</option>
              </select>
            </div>

            {/* Weather Select */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                🌦 Weather context
              </label>
              <select 
                value={weather} 
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#2f3b4c] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
              >
                <option value="Summer">Hot / Dry Summer</option>
                <option value="Humid">Humid / Sticky</option>
                <option value="Monsoon">Heavy Monsoon / Rainy</option>
                <option value="Cool">Cool / Autumn Breeze</option>
              </select>
            </div>

            {/* Festival Select */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                🎉 Local Festival Calendar
              </label>
              <select 
                value={festival} 
                onChange={(e) => setFestival(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#2f3b4c] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
              >
                <option value="Raksha Bandhan">Raksha Bandhan</option>
                <option value="Teej">Hariyali Teej</option>
                <option value="Onam">Onam Festivities</option>
                <option value="Durga Puja">Durga Puja / Dussehra</option>
                <option value="Diwali">Diwali / Karwa Chauth</option>
                <option value="None">No Festival (Regular Days)</option>
              </select>
            </div>

            {/* Budget Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                <span>💰 Max Budget</span>
                <span className="text-pink-500">₹{budget}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="5000" 
                step="250"
                value={budget} 
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-[#0b0c10] rounded-lg appearance-none cursor-pointer accent-pink-500" 
              />
            </div>

            {/* Style Preference */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                👗 Personal Style Vibe
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Traditional", "Streetwear", "Casual", "Office Wear"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setStylePreference(style)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      stylePreference === style
                        ? "bg-pink-500/10 text-pink-500 border-pink-500"
                        : "bg-[#0b0c10] border-[#2f3b4c] text-gray-400 hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-gray-700 bg-gray-900/30 p-3 rounded-lg text-[11px] text-gray-400 leading-relaxed">
            <span className="text-white font-bold block mb-1">How it works:</span>
            Changing the context re-scores, re-ranks, and updates the explanations of the items. For example, selecting <strong>Kerala + Humid + Onam</strong> yields sarees with Onam validation badges.
          </div>
        </aside>

        {/* Right Content Stream */}
        <main className="flex-1 flex flex-col gap-6">

          {/* Dynamic Banner based on region & festival */}
          <div className={`${theme.bannerBg} rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl transition-all duration-500`}>
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 select-none pointer-events-none">
              <ShoppingBag className="w-96 h-96" />
            </div>
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Regional Curation Mode
              </div>
              
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
                {festival !== "None" 
                  ? `${festival} Edition: Traditional Weaves of ${region}` 
                  : `Celebrating Local Artisanship in ${region}`
                }
              </h1>
              
              <p className="text-sm text-white/80 mb-5 leading-relaxed">
                {festival !== "None"
                  ? `Discover products handpicked for local festivities in ${region}, structured for the ${weather.toLowerCase()} climate and trending patterns near you.`
                  : `Personalized styling matching the local ${weather.toLowerCase()} weather in ${region}, prioritizing regional sellers to deliver trust and fast arrival.`
                }
              </p>

              <div className="flex items-center gap-6 text-xs font-semibold text-white/90">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {region}</span>
                <span className="flex items-center gap-1"><CloudSun className="w-3.5 h-3.5" /> {weather} Weather</span>
                {festival !== "None" && <span className="bg-white/10 px-2 py-0.5 rounded">🎉 {festival} Special</span>}
              </div>
            </div>
          </div>

          {/* AI Search Panel */}
          <div className="bg-[#1f2833] rounded-2xl p-5 border border-[#2f3b4c]">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Need something for Teej under 2000 in Jaipur... (Type in natural dialect/budget)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-[#2f3b4c] text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <button 
                type="submit" 
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-6 font-semibold text-sm transition-colors cursor-pointer"
              >
                AI Search
              </button>
            </form>

            {/* Display search suggestions */}
            <div className="flex flex-wrap gap-2 mt-3 items-center">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Try searching:</span>
              {[
                `office wear for Chennai weather under ${budget}`,
                `Jaipur traditional dress`,
                `monsoon casual wear for college in Delhi`,
                `Onam special kasavu under 2000`
              ].map((queryText, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => { setSearchQuery(queryText); }}
                  className="bg-[#0b0c10] hover:bg-[#151c24] text-xs text-pink-400 border border-[#2f3b4c] rounded-full px-3 py-1 transition-colors"
                >
                  "{queryText}"
                </button>
              ))}
            </div>

            {/* AI intent parser debug block */}
            {parsedIntent && (
              <div className="mt-4 p-4 bg-[#0b0c10] rounded-xl border border-pink-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> AI Intent Parser Output (Gemini 2.5)
                  </div>
                  <button onClick={clearSearch} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block mb-0.5">Festival:</span>
                    <span className="text-white font-semibold">{parsedIntent.festival || "N/A"}</span>
                  </div>
                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block mb-0.5">Region:</span>
                    <span className="text-white font-semibold">{parsedIntent.region || "N/A"}</span>
                  </div>
                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block mb-0.5">Weather:</span>
                    <span className="text-white font-semibold">{parsedIntent.weather || "N/A"}</span>
                  </div>
                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block mb-0.5">Max Budget:</span>
                    <span className="text-white font-semibold">{parsedIntent.budget ? `₹${parsedIntent.budget}` : "N/A"}</span>
                  </div>
                  <div className="bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
                    <span className="text-gray-500 block mb-0.5">Categories:</span>
                    <span className="text-white font-semibold">{parsedIntent.categories?.join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-[#1f2833] text-sm font-bold uppercase tracking-wider gap-6">
            <button 
              onClick={() => setActiveTab("feed")} 
              className={`pb-3 px-1 transition-all ${
                activeTab === "feed"
                  ? "border-b-2 border-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🛍️ AI Bharat Feed
            </button>
            <button 
              onClick={() => setActiveTab("bazaar")} 
              className={`pb-3 px-1 transition-all ${
                activeTab === "bazaar"
                  ? "border-b-2 border-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🏪 Local Bazaar
            </button>
            <button 
              onClick={() => setActiveTab("social")} 
              className={`pb-3 px-1 transition-all ${
                activeTab === "social"
                  ? "border-b-2 border-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              👥 Outfit Circle
            </button>
          </div>

          {/* Feed Content Loader */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-gray-400">Re-ranking catalog dynamically using Gemini...</span>
            </div>
          ) : (
            <>
              {activeTab === "feed" && (
                <div className="space-y-6">
                  {/* Trends highlight list */}
                  <div className="flex flex-wrap gap-2 items-center bg-[#1f2833]/40 p-4 rounded-xl border border-[#1f2833]">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      🔥 Regional Trends in {region}:
                    </span>
                    {regionalTrends.map((trend, i) => (
                      <span key={i} className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs px-2.5 py-1 rounded-full font-semibold">
                        #{trend}
                      </span>
                    ))}
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                      <div className="col-span-full py-16 text-center text-gray-400">
                        No products match the selected criteria. Try adjusting the budget or location controllers.
                      </div>
                    ) : (
                      products.map((product) => (
                        <div 
                          key={product.id} 
                          className="bg-[#1f2833] rounded-2xl overflow-hidden border border-[#2f3b4c] hover:border-pink-500/30 transition-all flex flex-col group"
                        >
                          <div className="h-64 overflow-hidden relative bg-gray-800">
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Region tag badge */}
                            <span className="absolute top-3 left-3 bg-[#0b0c10]/80 backdrop-blur text-white text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wide border border-gray-700">
                              📍 Origin: {product.region}
                            </span>
                            
                            {/* Star rating tag */}
                            <span className="absolute top-3 right-3 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-0.5 shadow-md">
                              ★ {product.rating}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-white font-bold text-base mb-1 group-hover:text-pink-400 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                                {product.description}
                              </p>
                              
                              {/* Price */}
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-white font-extrabold text-xl">₹{product.price}</span>
                                <span className="text-xs text-gray-500 line-through">₹{Math.round(product.price * 1.4)}</span>
                                <span className="text-xs text-green-500 font-bold">40% OFF</span>
                              </div>

                              {/* Explainable AI recommendation badge (Hero Feature) */}
                              {product.ai_reason && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-2.5 mb-3 text-xs">
                                  <div className="font-bold flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5" /> Recommended Because:
                                  </div>
                                  <p className="whitespace-pre-line text-gray-300 text-[11px] leading-relaxed">
                                    {product.ai_reason}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions footer */}
                            <div className="border-t border-[#2f3b4c] pt-4 mt-2 flex flex-col gap-2">
                              {/* View Reviews Summary Button */}
                              <button 
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowReviewSummary(true);
                                }}
                                className="w-full bg-[#0b0c10] hover:bg-[#151c24] text-xs text-gray-300 border border-[#2f3b4c] rounded-lg py-2 font-medium transition-colors"
                              >
                                View AI Review Summary
                              </button>

                              <div className="grid grid-cols-2 gap-2">
                                {/* Local Bazaar action */}
                                <button 
                                  onClick={() => {
                                    setNegotiationProduct(product);
                                    setProposedBid(Math.round(product.price * 0.85));
                                    setNegotiationResult(null);
                                    setActiveTab("bazaar");
                                  }}
                                  className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 text-xs rounded-lg py-2 font-medium transition-colors"
                                >
                                  Bargain at Boutique
                                </button>
                                
                                {/* Outfit Circle Action */}
                                <button 
                                  onClick={() => {
                                    if (outfitGroups.length === 0) {
                                      alert("Please create an Outfit Circle first in the Outfit Circle tab.");
                                      return;
                                    }
                                    handleAddItemToCircle(outfitGroups[0].id, product.id);
                                  }}
                                  className="bg-[#2f3b4c] hover:bg-[#3d4d62] text-xs text-white rounded-lg py-2 font-medium transition-colors"
                                >
                                  Add to Circle
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Local Bazaar Feature */}
              {activeTab === "bazaar" && (
                <div className="space-y-6">
                  {/* Info Header */}
                  <div className="bg-[#1f2833] rounded-2xl p-5 border border-[#2f3b4c]">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <ShoppingBag className="text-pink-500 w-5 h-5" /> Local Bazaar Pipeline
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Connect directly with verified local boutiques in <strong>{region}</strong>. Request best pricing on handcrafts with dynamic bargaining simulation. Reduces replacement delays and supports regional weavers!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Boutiques list */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Verified Boutiques in {region}</h4>
                      
                      {boutiques.length === 0 ? (
                        <div className="bg-[#1f2833] p-6 rounded-xl border border-gray-800 text-center text-gray-400 text-sm">
                          No boutiques registered in {region} yet.
                        </div>
                      ) : (
                        boutiques.map((b) => (
                          <div 
                            key={b.id} 
                            className="bg-[#1f2833] p-4 rounded-xl border border-[#2f3b4c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <img 
                                src={b.avatar} 
                                alt={b.name} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/20"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-bold text-white text-base">{b.name}</h5>
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">
                                    Verified
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400">{b.speciality}</p>
                                <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                  <span>★ {b.rating} Rating</span>
                                  <span>• {b.distance_km} km away</span>
                                </div>
                              </div>
                            </div>
                            
                            <span className="text-xs bg-gray-900 border border-gray-700 text-gray-300 px-3 py-1.5 rounded-lg">
                              Deliver in <strong>2-4 hours</strong>
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bargain Negotiation Drawer */}
                    <div className="bg-[#1f2833] p-5 rounded-2xl border border-[#2f3b4c] self-start">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Request Best Price</h4>
                      
                      {negotiationProduct ? (
                        <div className="space-y-4">
                          <div className="bg-[#0b0c10] p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                            <img 
                              src={negotiationProduct.image_url} 
                              alt={negotiationProduct.name} 
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                            <div>
                              <h5 className="font-bold text-white text-sm line-clamp-1">{negotiationProduct.name}</h5>
                              <p className="text-xs text-gray-400">Boutique: {negotiationProduct.local_boutique}</p>
                              <span className="text-pink-400 font-extrabold text-sm">Retail: ₹{negotiationProduct.price}</span>
                            </div>
                          </div>

                          <form onSubmit={handleNegotiateSubmit} className="space-y-4">
                            <div>
                              <label className="text-xs text-gray-400 block mb-1">Your Proposed Price (₹)</label>
                              <div className="flex gap-2">
                                <input 
                                  type="number"
                                  min="1"
                                  value={proposedBid}
                                  onChange={(e) => setProposedBid(Number(e.target.value))}
                                  className="w-full bg-[#0b0c10] border border-[#2f3b4c] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                                />
                                <button 
                                  type="submit" 
                                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg px-4 text-xs font-semibold"
                                >
                                  Submit Bid
                                </button>
                              </div>
                              <span className="text-[10px] text-gray-500 mt-1 block">
                                Suggestions: 10% off (₹{Math.round(negotiationProduct.price * 0.9)}), 15% off (₹{Math.round(negotiationProduct.price * 0.85)})
                              </span>
                            </div>
                          </form>

                          {/* Negotiation Feedback */}
                          {negotiationResult && (
                            <div className={`p-4 rounded-xl border ${
                              negotiationResult.status === "accepted"
                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                : negotiationResult.status === "rejected"
                                ? "bg-red-500/10 border-red-500/20 text-red-400"
                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                            }`}>
                              <h6 className="font-bold text-xs uppercase tracking-wide mb-1">
                                Status: {negotiationResult.status}
                              </h6>
                              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                                {negotiationResult.message}
                              </p>
                              
                              <div className="flex justify-between items-center bg-[#0b0c10] p-2.5 rounded-lg border border-gray-800 text-xs">
                                <span className="text-gray-400">Final Agreed Price:</span>
                                <span className="font-extrabold text-white text-sm">₹{negotiationResult.final_price}</span>
                              </div>

                              {negotiationResult.status !== "rejected" && (
                                <button 
                                  onClick={() => alert(`Added to cart at agreed price of ₹${negotiationResult.final_price}!`)}
                                  className="w-full mt-3 bg-pink-600 hover:bg-pink-700 text-white text-xs py-2 rounded-lg font-semibold transition-colors"
                                >
                                  Purchase Handcraft
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          Click "Bargain at Boutique" on any feed item to start price negotiation.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Outfit Circle (Social Co-planning) */}
              {activeTab === "social" && (
                <div className="space-y-6">
                  {/* Explainer banner */}
                  <div className="bg-[#1f2833] rounded-2xl p-5 border border-[#2f3b4c] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <Users className="text-pink-500 w-5 h-5" /> Outfit Circle (Spotify Blend for Fashion)
                      </h3>
                      <p className="text-sm text-gray-400">
                        Create social voting groups to co-plan outfits for weddings, college fests, or upcoming festivals with friends.
                      </p>
                    </div>

                    {/* New Group form */}
                    <form onSubmit={handleCreateGroup} className="flex gap-2 w-full md:w-auto">
                      <input 
                        type="text" 
                        placeholder="Group Name (e.g. Onam Prep)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="bg-[#0b0c10] border border-[#2f3b4c] text-white text-xs rounded-lg px-3 py-2 w-full md:w-48 focus:outline-none"
                      />
                      <button 
                        type="submit" 
                        className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap"
                      >
                        Create Group
                      </button>
                    </form>
                  </div>

                  {/* Active Circles list */}
                  <div className="space-y-6">
                    {outfitGroups.map((g) => (
                      <div key={g.id} className="bg-[#1f2833] p-5 rounded-2xl border border-[#2f3b4c]">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
                          <div>
                            <h4 className="text-white font-extrabold text-lg">{g.name}</h4>
                            <p className="text-xs text-gray-400">Created by {g.creator} • {g.members_count} active friends</p>
                          </div>
                          <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
                            Active Outfit Circle
                          </span>
                        </div>

                        {/* Items in the outfit circle */}
                        {g.items.length === 0 ? (
                          <div className="text-center py-8 text-xs text-gray-400">
                            No styles added to this circle yet. Go to the "AI Bharat Feed" and click "Add to Circle" on any item!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {g.items.map((item) => (
                              <div key={item.id} className="bg-[#0b0c10] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4">
                                <img 
                                  src={item.product?.image_url} 
                                  alt={item.product?.name} 
                                  className="w-full md:w-32 h-36 object-cover rounded-lg"
                                />
                                
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-1">
                                      <h5 className="font-bold text-white text-sm line-clamp-1">{item.product?.name}</h5>
                                      <span className="text-pink-400 font-extrabold text-xs">₹{item.product?.price}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">{item.product?.description}</p>
                                    
                                    {/* Likes Voting */}
                                    <div className="flex items-center gap-2 mb-4">
                                      <button 
                                        onClick={() => handleVote(g.id, item.id)}
                                        className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                                          item.voted_by.includes(currentUser)
                                            ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
                                            : "bg-[#1f2833] border-gray-700 text-gray-400 hover:text-white"
                                        }`}
                                      >
                                        <ThumbsUp className="w-3 h-3" /> 
                                        {item.voted_by.includes(currentUser) ? "Voted" : "Vote"} ({item.votes})
                                      </button>
                                      <span className="text-[10px] text-gray-500 line-clamp-1">
                                        Voted by: {item.voted_by.join(", ") || "Nobody yet"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Comments list and input */}
                                  <div className="space-y-2 border-t border-gray-800 pt-3">
                                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                                      {item.comments.map((c, i) => (
                                        <div key={i} className="text-[11px] leading-relaxed">
                                          <strong className="text-gray-300 font-bold">{c.user}:</strong>{" "}
                                          <span className="text-gray-400">{c.text}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Add Comment Input */}
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        placeholder="Add comment..."
                                        value={commentInputs[`${g.id}-${item.id}`] || ""}
                                        onChange={(e) => {
                                          const text = e.target.value;
                                          setCommentInputs(prev => ({ ...prev, [`${g.id}-${item.id}`]: text }));
                                        }}
                                        className="bg-[#1f2833] border border-gray-800 text-[11px] rounded-lg px-2.5 py-1 w-full focus:outline-none focus:border-pink-500 text-white"
                                      />
                                      <button 
                                        onClick={() => handleAddComment(g.id, item.id)}
                                        className="bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-semibold px-2 py-1 rounded-lg"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </main>

      </div>

      {/* Footer explanation */}
      <footer className="border-t border-[#1f2833] bg-[#0b0c10]/80 py-6 text-center text-xs text-gray-500 mt-auto">
        <p>© 2026 Myntra HackerRamp - Team BitWizards. Built for Bharat.</p>
      </footer>

      {/* AI Review Summary Popover Modal */}
      {showReviewSummary && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1f2833] border border-[#2f3b4c] rounded-2xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => {
                setShowReviewSummary(false);
                setSelectedProduct(null);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-pink-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Review Summarization (Gemini 2.5)
            </div>

            <h4 className="text-white font-extrabold text-lg mb-2">
              {selectedProduct.name}
            </h4>

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-3 mb-4 text-xs font-mono">
              <span className="font-bold block mb-1">Regional Buyers Consensus:</span>
              <p className="whitespace-pre-line text-gray-300 font-sans leading-relaxed">
                {selectedProduct.ai_review_summary || "✓ Soft breathable fabric \n✓ Fits true to size \n✓ Highly recommended for festive wear"}
              </p>
            </div>

            <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">Recent Customer Raw Reviews:</h5>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedProduct.reviews?.map((r, i) => (
                <div key={i} className="bg-[#0b0c10] p-2.5 rounded-lg border border-gray-800 text-xs italic text-gray-400">
                  "{r}"
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                setShowReviewSummary(false);
                setSelectedProduct(null);
              }}
              className="w-full mt-5 bg-pink-600 hover:bg-pink-700 text-white text-xs py-2 rounded-lg font-semibold transition-colors"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
