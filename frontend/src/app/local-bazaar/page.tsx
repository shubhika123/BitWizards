"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { 
  MapPin, 
  Search, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Clock, 
  Percent, 
  ArrowLeft, 
  MessageSquare, 
  User, 
  Send,
  Zap,
  Bookmark,
  Share2,
  Phone,
  MoreVertical,
  CheckCircle,
  Truck,
  TrendingDown,
  Store,
  Star,
  Compass,
  Loader2
} from "lucide-react";

interface Product {
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
  onTimeDelivery: number;
  returnRate: number;
  yearsOnMyntra: number;
  description: string;
}

interface Boutique {
  id: string;
  name: string;
  rating: number;
  distance: number;
  speciality: string;
  verified: boolean;
  x: number; // percentage coordinate on mock map
  y: number; // percentage coordinate on mock map
}

// Dynamic local bazaar data generator mapping target cities to specialized clothing and accessories
const getLocalBazaarData = (city: string) => {
  const normCity = city.trim().toLowerCase();
  
  let theme = {
    speciality: "Premium Fusion & Festive Silk",
    clothing: ["Banarasi Silk Katan Kurta", "Chikankari Georgette Anarkali Saree", "Modern Silk Fusion Sherwani"],
    accessories: ["Designer Zardozi Potli Bag", "Polki Kundan Choker Necklace", "Handcrafted Silk Juttis"],
    boutiques: ["Bengaluru Silk Boutique", "Delhi Connaught Attires", "Metro Fusion Weaves"]
  };

  if (["warangal", "karimnagar", "nizamabad"].includes(normCity)) {
    theme = {
      speciality: "Bonalu Handlooms",
      clothing: ["Traditional Telangana Saree", "Bonalu Festival Cotton Kurta", "Pochampally Ikat Dress"],
      accessories: ["Oxidised Silver Jewellery Set", "Traditional Glass Bangles", "Hand-painted Bonalu Pot"],
      boutiques: ["Kakatiya Textiles", "Telangana Weavers Co-op", "Bonalu Heritage Attire"]
    };
  } else if (["jaipur", "udaipur", "kota"].includes(normCity)) {
    theme = {
      speciality: "Rajasthani Bandhej & Teej",
      clothing: ["Green Bandhani Teej Saree", "Gota Patti Lehenga Choli", "Rajasthani Angrakha Suit"],
      accessories: ["Handcrafted Lac Bangles", "Traditional Rajasthani Mehendi Kit", "Mirror-work Bindis"],
      boutiques: ["Mewar Royal Silks", "Jaipur Gota House", "Teej Festive Attire"]
    };
  } else if (["coimbatore", "madurai", "salem"].includes(normCity)) {
    theme = {
      speciality: "Kanchipuram & Aadi Weaves",
      clothing: ["Pure Kanchipuram Silk Saree", "Coimbatore Cotton Saree", "South Indian Festive Veshti Kurta"],
      accessories: ["Gold-plated Temple Haram", "Fresh Jasmine Flower Garland", "Traditional Brass Vilakku Decor"],
      boutiques: ["Kovai Silk House", "Madurai Handlooms", "Aadi Heritage Silks"]
    };
  } else if (["vizag", "vijayawada", "belgaum", "mysuru"].includes(normCity)) {
    theme = {
      speciality: "Varalakshmi Vratam Silk",
      clothing: ["Varalakshmi Silk Saree", "Kanchipuram Silk Pattu Pavadai", "Pure Silk Brocade Kurta"],
      accessories: ["Antique Gold Lakshmi Necklace", "Pooja Kalasam Decor", "Brass Vratam Thali Set"],
      boutiques: ["Mysore Silk Emporium", "Vizag Royal Pattu", "Belgaum Handloom Center"]
    };
  } else if (["kochi", "thrissur", "kozhikode"].includes(normCity)) {
    theme = {
      speciality: "Onam Kasavu Handloom",
      clothing: ["Kerala Onam Kasavu Saree", "Traditional Kerala Mundu & Kurta", "Gold Zari Border Settu Mundu"],
      accessories: ["Temple Jewellery Kasu Mala", "Nirapara Pooja Handicraft", "Onam Pookalam Decor Kit"],
      boutiques: ["Kochi Kasavu Palace", "Thrissur Handlooms", "Keralam Heritage Attires"]
    };
  } else if (["sambalpur", "jharsuguda", "bargarh"].includes(normCity)) {
    theme = {
      speciality: "Sambalpuri Handlooms",
      clothing: ["Original Sambalpuri Ikat Saree", "Sambalpuri Hand-woven Kurta", "Pasapalli Silk Saree"],
      accessories: ["Handwoven Ikat Dupatta", "Tribal Dokra Silver Necklace", "Sambalpuri Silk Scarves"],
      boutiques: ["Sambalpur Handloom Co-op", "Mahanadi Weaves", "Western Odisha Weaving Society"]
    };
  } else if (normCity === "patna") {
    theme = {
      speciality: "Madhubani & Bhagalpuri Art",
      clothing: ["Madhubani Painted Tussar Saree", "Handwoven Bhagalpuri Silk Kurta", "Mithila Hand-loomed Kurti"],
      accessories: ["Madhubani Hand-painted Stole", "Bhagalpuri Silk Dupatta", "Traditional Bihar Rakhis & Sweets"],
      boutiques: ["Mithila Art Attires", "Patliputra Weaves", "Bhagalpur Silk House"]
    };
  } else if (normCity === "mathura") {
    theme = {
      speciality: "Krishna Janmashtami Traditional",
      clothing: ["Krishna Janmashtami Pitambar Kurta", "Festive Bandhani Lehenga", "Peacock Feather Print Dupatta"],
      accessories: ["Brass Flute & Jhula Decor", "Peacock Feather Mukut", "Janmashtami Festive Gift Hamper"],
      boutiques: ["Braj Vrindavan Heritage", "Mathura Govinda Silks", "Janmashtami Attires"]
    };
  } else if (normCity === "kolhapur") {
    theme = {
      speciality: "Kolhapuri Heritage & Nag Panchami",
      clothing: ["Kolhapuri Nauvari Saree", "Traditional Cotton Paithani Saree", "Dhangari Handloom Kurta"],
      accessories: ["Original Kolhapuri Saaj Necklace", "Green Glass Bangles Set", "Nag Panchami Puja essentials"],
      boutiques: ["Shahu Maharaj Handlooms", "Kolhapuri Saaj Attire", "Mahalaxmi Silks"]
    };
  } else if (["hubballi", "dharwad"].includes(normCity)) {
    theme = {
      speciality: "Shravana Mahotsava Weaves",
      clothing: ["Mysore Silk Georgette Saree", "Dharwad Cotton Festive Kurta", "Ilkal Kasuti Embroidery Saree"],
      accessories: ["Rudraksha Mala Gold Joint", "Temple Silver Bangles", "Kasuti Embroidered Clutch Bag"],
      boutiques: ["Hubli Kasuti Center", "Dharwad Handloom Weavers", "Shravana Festive Attire"]
    };
  }

  // Generate 6 boutiques based on theme
  const generatedBoutiques: Boutique[] = [
    { id: "b_1", name: theme.boutiques[0] || `${city} Weaves`, rating: 4.8, distance: 1.5, speciality: theme.speciality, verified: true, x: 38, y: 35 },
    { id: "b_2", name: theme.boutiques[1] || `${city} Craft House`, rating: 4.6, distance: 2.8, speciality: theme.speciality, verified: true, x: 62, y: 28 },
    { id: "b_3", name: theme.boutiques[2] || `${city} Heritage Emporium`, rating: 4.5, distance: 3.4, speciality: theme.speciality, verified: false, x: 25, y: 65 },
    { id: "b_4", name: "Metro Craft Co.", rating: 4.4, distance: 4.1, speciality: "Festive Generalists", verified: true, x: 45, y: 48 },
    { id: "b_5", name: "Heritage Attire House", rating: 4.7, distance: 4.9, speciality: "Premium Traditional", verified: true, x: 55, y: 60 },
    { id: "b_6", name: "Weaves of India Co.", rating: 4.6, distance: 5.8, speciality: "Handloom Traditional", verified: true, x: 70, y: 55 }
  ];

  // Generate products using clothing & accessories
  const generatedProducts: Product[] = [];
  
  // Add Clothing products
  theme.clothing.forEach((clothingName, index) => {
    generatedProducts.push({
      id: `cloth_${index}`,
      name: clothingName,
      category: "Ethnic Wear",
      price: 1200 + (index * 400),
      originalPrice: 2000 + (index * 600),
      image: index % 2 === 0 
        ? "https://images.pexels.com/photos/25328651/pexels-photo-25328651.jpeg"
        : "https://images.pexels.com/photos/36311379/pexels-photo-36311379.jpeg",
      trustScore: 92 + (index * 2),
      distance: 1.2 + (index * 0.9),
      deliveryTime: index % 2 === 0 ? "2 Hours" : "3 Hours",
      pickupTime: "25 mins",
      boutique: generatedBoutiques[index % 3].name,
      location: city,
      rating: 4.6 + (index * 0.1),
      onTimeDelivery: 96 + index,
      returnRate: 4 - index,
      yearsOnMyntra: 2 + index,
      description: `Beautiful hand-crafted ${clothingName} designed for traditional and festive celebrations.`
    });
  });

  // Add Accessories products
  theme.accessories.forEach((accName, index) => {
    generatedProducts.push({
      id: `acc_${index}`,
      name: accName,
      category: "Accessories",
      price: 499 + (index * 200),
      originalPrice: 799 + (index * 300),
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
      trustScore: 94 + index,
      distance: 1.5 + (index * 1.2),
      deliveryTime: "Same Day",
      pickupTime: "15 mins",
      boutique: generatedBoutiques[(index + 1) % 3].name,
      location: city,
      rating: 4.7,
      onTimeDelivery: 98,
      returnRate: 3,
      yearsOnMyntra: 3,
      description: `Elegant traditional ${accName} to pair beautifully with your festive outfits.`
    });
  });

  // Add a default footwear product
  generatedProducts.push({
    id: "footwear_default",
    name: "Handcrafted Leather Juttis",
    category: "Footwear",
    price: 899,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=250&q=80",
    trustScore: 95,
    distance: 2.2,
    deliveryTime: "Same Day",
    pickupTime: "20 mins",
    boutique: generatedBoutiques[0].name,
    location: city,
    rating: 4.8,
    onTimeDelivery: 99,
    returnRate: 2,
    yearsOnMyntra: 4,
    description: "Extremely comfortable and stylized leather footwear decorated with golden zari work."
  });

  return { boutiques: generatedBoutiques, products: generatedProducts };
};

export default function LocalBazaar() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<number>(1); // 1 = Discover, 2 = Profile, 3 = Slider, 4 = Chat, 5 = Fulfillment, 6 = Success
  const [selectedRadius, setSelectedRadius] = useState<number>(5);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCity, setActiveCity] = useState<string>("Bengaluru");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [hoveredBoutique, setHoveredBoutique] = useState<string | null>(null);
  
  // Bargain states
  const [proposedBid, setProposedBid] = useState<number>(1000);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(1299);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "shop"; text: string; time: string }>>([]);
  const [chatRound, setChatRound] = useState<number>(1); // max 2 rounds
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup">("delivery");

  // Sync city selection with logged-in user or LocalStorage
  useEffect(() => {
    if (user?.city) {
      setActiveCity(user.city);
    } else {
      const savedCity = localStorage.getItem("selectedCity");
      if (savedCity) {
        setActiveCity(savedCity);
      } else {
        setActiveCity("Bengaluru");
      }
    }
  }, [user]);

  // Dynamically load local bazaar boutiques and products matching selected city
  const { boutiques, products: allProducts } = getLocalBazaarData(activeCity);

  const productCategories = ["All", "Ethnic Wear", "Accessories", "Footwear"];

  // Set default product on mount
  useEffect(() => {
    const productsInCity = allProducts.filter((product) => {
      const matchesCity = product.location.toLowerCase() === activeCity.toLowerCase();
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      return matchesCity && matchesCategory;
    });

    if (productsInCity.length > 0) {
      setSelectedProduct(productsInCity[0]);
    } else {
      const fallbackProduct = allProducts.find((product) => activeCategory === "All" || product.category === activeCategory) || allProducts[0];
      setSelectedProduct(fallbackProduct);
    }
  }, [activeCity, activeCategory]);

  // Filters boutiques & products based on radius, city, and selected category
  const filteredBoutiques = boutiques.filter(b => b.distance <= selectedRadius);
  const filteredProducts = allProducts.filter(
    p => p.distance <= selectedRadius &&
       p.location.toLowerCase() === activeCity.toLowerCase() &&
       (activeCategory === "All" || p.category === activeCategory)
  );

  // Bargain Bid Acceptance Probability Meter
  const getBargainProbability = (bid: number, originalPrice: number) => {
    const ratio = bid / originalPrice;
    if (ratio >= 0.92) return { label: "High Probability", percentage: 95, color: "text-emerald-500", progressBg: "bg-emerald-500", note: "Boutique will likely accept instantly!" };
    if (ratio >= 0.82) return { label: "Moderate / We Can Try", percentage: 65, color: "text-amber-500", progressBg: "bg-amber-500", note: "Fair offer. Be prepared for a minor counter bid." };
    if (ratio >= 0.70) return { label: "Low Probability", percentage: 30, color: "text-rose-500", progressBg: "bg-rose-500", note: "Very low offer. Might get flatly rejected by artisan." };
    return { label: "Unacceptable Bid", percentage: 5, color: "text-red-600", progressBg: "bg-red-600", note: "Boutique will reject this outright. Try a higher offer." };
  };

  const probInfo = selectedProduct ? getBargainProbability(proposedBid, selectedProduct.price) : { label: "", percentage: 0, color: "", progressBg: "", note: "" };

  // Submit Offer (makes real call to backend /api/bazaar/negotiate)
  const handleSubmitOffer = async () => {
    if (!selectedProduct) return;
    setChatRound(1);
    setIsTyping(true);
    setStep(4); // transition to Chat Screen

    // Set initial user message in chat
    setChatMessages([
      { sender: "user", text: `Namaste! Can I purchase this for ₹${proposedBid}?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    try {
      const response = await fetch("http://localhost:8000/api/bazaar/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boutique_id: selectedProduct.boutique || "avadh",
          product_id: selectedProduct.id || "local_1",
          original_price: selectedProduct.price,
          proposed_price: proposedBid
        })
      });
      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { 
            sender: "shop", 
            text: data.message, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
        setNegotiatedPrice(data.final_price);
        if (data.status === "accepted") {
          setChatRound(2); // Accepted directly
        }
      }, 1500);

    } catch (err) {
      console.error("Failed to connect to backend negotiation engine:", err);
      // Fallback message
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { sender: "shop", text: `Namaste! We can offer you ₹${Math.round(selectedProduct.price * 0.90)} as a special boutique price.`, time: "11:32 AM" }
        ]);
      }, 1200);
    }
  };

  // User counter bid in chat window
  const handleUserCounterBid = async (price: number) => {
    if (!selectedProduct) return;
    setIsTyping(true);
    
    const userMsg = { 
      sender: "user" as const, 
      text: `How about ₹${price}?`, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch("http://localhost:8000/api/bazaar/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boutique_id: selectedProduct.boutique || "avadh",
          product_id: selectedProduct.id || "local_1",
          original_price: selectedProduct.price,
          proposed_price: price
        })
      });
      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { 
            sender: "shop", 
            text: data.message, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
        setNegotiatedPrice(data.final_price);
        setChatRound(2);
      }, 1500);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { sender: "shop", text: `Okay, let's meet in the middle at ₹${price}. Done deal!`, time: "11:34 AM" }
        ]);
        setNegotiatedPrice(price);
        setChatRound(2);
      }, 1200);
    }
  };

  // Accept counter offer
  const handleAcceptCounter = (price: number) => {
    setNegotiatedPrice(price);
    const userMessage = { sender: "user" as const, text: `Accepting ₹${price}. Perfect!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        { sender: "shop" as const, text: `Thank you! Packing your order now. Proceed to select delivery.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setTimeout(() => {
        setStep(5);
      }, 1000);
    }, 1000);
  };

  // Freeform chat input submit
  const handleSendFreeChatMessage = () => {
    if (!userChatInput.trim() || !selectedProduct) return;
    const bidNum = parseInt(userChatInput.replace(/[^0-9]/g, ""));
    if (!isNaN(bidNum) && bidNum > 100) {
      handleUserCounterBid(bidNum);
      setUserChatInput("");
    } else {
      // Treat as regular chat text
      const userMsg = { sender: "user" as const, text: userChatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setChatMessages(prev => [...prev, userMsg]);
      setUserChatInput("");
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(prev => [
          ...prev,
          { sender: "shop" as const, text: "I can only negotiate on final pricing numbers. Please propose a numerical offer!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }, 1200);
    }
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen flex flex-col font-sans relative pb-8">
      
      {/* STEP 1: Discover Nearby Products */}
      {step === 1 && (
        <>
          {/* Header */}
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-3xs">
            <div className="flex items-center gap-2">
              <Link href="/" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Apna Bazaar</span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 scale-95">
              <Search className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
              <Heart className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
              <ShoppingBag className="w-4.5 h-4.5 cursor-pointer hover:text-[#ff3f6c]" />
            </div>
          </header>

          {/* Location selector strip */}
          <div className="bg-gradient-to-r from-[#fff5f2] to-[#fffcfb] px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b border-orange-100/50 select-none">
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-4 h-4 text-[#ff3f6c] animate-bounce" />
              <span>Showing Sellers Near {activeCity}</span>
            </div>
            <div className="flex gap-2">
              {user?.city ? (
                <span className="bg-orange-50 border border-orange-200 text-orange-800 text-[10px] rounded-lg px-2.5 py-0.5 font-extrabold uppercase tracking-wide">
                  {user.city}
                </span>
              ) : (
                <select 
                  value={activeCity} 
                  onChange={(e) => {
                    setActiveCity(e.target.value);
                    localStorage.setItem("selectedCity", e.target.value);
                  }}
                  className="bg-white border border-orange-200 text-orange-800 text-[10px] rounded-lg px-2 py-0.5 outline-none font-bold"
                >
                  <option value="Belgaum">Belgaum</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Bargarh">Bargarh</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Dharwad">Dharwad</option>
                  <option value="Hubballi">Hubballi</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Jharsuguda">Jharsuguda</option>
                  <option value="Karimnagar">Karimnagar</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Kota">Kota</option>
                  <option value="Kozhikode">Kozhikode</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Mathura">Mathura</option>
                  <option value="Mysuru">Mysuru</option>
                  <option value="Nizamabad">Nizamabad</option>
                  <option value="Patna">Patna</option>
                  <option value="Salem">Salem</option>
                  <option value="Sambalpur">Sambalpur</option>
                  <option value="Thrissur">Thrissur</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Vizag">Vizag</option>
                  <option value="Warangal">Warangal</option>
                </select>
              )}
            </div>
          </div>

          {/* Interactive Geofence Map */}
          <div className="mx-3.5 mt-3.5 bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-3xs relative select-none">
            <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 flex justify-between items-center text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#ff3f6c]" />
                <span>Hyper-Local Geofence Map</span>
              </div>
              <span className="text-[#ff3f6c]">{filteredBoutiques.length} Active in {selectedRadius}km</span>
            </div>

            {/* Map Frame Container */}
            <div className="relative w-full h-[180px] bg-[#f4f3f0] overflow-hidden">
              {/* Map grid decoration */}
              <svg className="absolute inset-0 w-full h-full stroke-gray-200/60" strokeWidth="1" fill="none">
                <defs>
                  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {/* River/Water vector */}
                <path d="M-10,50 Q100,120 200,60 T420,130" fill="none" stroke="#dbeafe" strokeWidth="18" strokeLinecap="round" />
                {/* Parks */}
                <rect x="20" y="80" width="60" height="40" rx="10" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="1" />
                <rect x="290" y="30" width="80" height="45" rx="12" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="1" />
              </svg>

              {/* Shaded geofence circle overlay based on radius slider */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3f6c]/5 border-2 border-dashed border-[#ff3f6c]/20 transition-all duration-500 ease-out"
                style={{
                  width: `${selectedRadius * 26}px`,
                  height: `${selectedRadius * 26}px`,
                  maxWidth: "92%",
                  maxHeight: "92%"
                }}
              />

              {/* User Home Pin marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20">
                <span className="absolute w-8 h-8 bg-sky-500/25 rounded-full animate-ping"></span>
                <div className="w-5 h-5 bg-sky-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-black">
                  YOU
                </div>
              </div>

              {/* Boutique Markers */}
              {boutiques.map((b) => {
                const isActive = b.distance <= selectedRadius;
                return (
                  <div
                    key={b.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                    style={{ left: `${b.x}%`, top: `${b.y}%` }}
                    onMouseEnter={() => setHoveredBoutique(b.name)}
                    onMouseLeave={() => setHoveredBoutique(null)}
                  >
                    <div 
                      className={`relative flex items-center justify-center p-1.5 rounded-full shadow-md border cursor-pointer transition-all ${
                        isActive 
                          ? "bg-white border-[#ff3f6c] text-[#ff3f6c] scale-100 hover:scale-110" 
                          : "bg-gray-100 border-gray-300 text-gray-400 scale-90 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      
                      {/* Interactive Tooltip popup */}
                      {(hoveredBoutique === b.name || (isActive && hoveredBoutique === null && b.id === "b_1")) && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] py-1 px-2 rounded-lg font-black tracking-wide whitespace-nowrap shadow-md z-30 animate-in fade-in duration-200">
                          {b.name} ({b.distance}km) • ⭐{b.rating}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Radius slider strip */}
            <div className="p-3.5 bg-slate-50/70 border-t border-gray-150 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-wide">
                <span>Filter Discovery Radius</span>
                <span className="text-[#ff3f6c] text-xs font-black">&lt; {selectedRadius} km</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range"
                  min="2"
                  max="15"
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="flex-1 accent-[#ff3f6c] h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-1.5">
                  {[2, 5, 10, 15].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRadius(r)}
                      className={`px-2 py-0.5 text-[9px] font-black rounded border transition-all cursor-pointer ${
                        selectedRadius === r
                          ? "bg-[#ff3f6c] text-white border-[#ff3f6c]"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {r}k
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Discover Catalog Items */}
          <main className="flex-1 px-3.5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Verified Local Attires</h3>
              <span className="text-[9px] font-extrabold text-gray-400">Same-Day Delivery</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {productCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${
                    activeCategory === category
                      ? "bg-[#ff3f6c] text-white border-[#ff3f6c]"
                      : "bg-white text-slate-600 border-gray-200 hover:border-[#ff3f6c]/40 hover:text-[#ff3f6c]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-2">
                <Store className="w-8 h-8 text-gray-300" />
                <span className="text-xs text-gray-400 font-bold">No active local sellers found in {selectedRadius} km.</span>
                <button 
                  onClick={() => setSelectedRadius(15)} 
                  className="text-xs font-black text-[#ff3f6c] hover:underline"
                >
                  Expand search radius to 15 km
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredProducts.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); setStep(2); }}
                    className="flex gap-4 border border-gray-150 p-3 rounded-2xl bg-white cursor-pointer hover:shadow-md hover:border-[#ff3f6c]/30 transition-all shadow-3xs"
                  >
                    <div className="relative w-22 h-28 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 left-1.5 bg-[#ff3f6c] text-white text-[7px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider shadow-xs">
                        ⭐ {p.trustScore}%
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-0.5 text-left">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-[#ff3f6c] bg-pink-50/50 border border-pink-100/50 px-1.5 py-0.2 rounded uppercase">Verified</span>
                          <span className="text-[9.5px] text-emerald-700 font-black">📍 {p.distance} km</span>
                        </div>
                        <h4 className="font-black text-sm text-slate-800 leading-snug mt-1.5">{p.boutique}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{p.name} • Artisan Weaves</p>
                      </div>

                      <div className="flex justify-between items-end border-t border-gray-50 pt-2 mt-2">
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold">
                          <Truck className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>{p.deliveryTime} delivery</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] text-gray-400 line-through">₹{p.originalPrice}</span>
                          <span className="text-sm font-black text-slate-800">₹{p.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* STEP 2: View Product & Seller Profile */}
      {step === 2 && selectedProduct && (
        <>
          {/* Detailed View header */}
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-3xs">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(1)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Seller Attire Detail</span>
            </div>
            <div className="flex gap-3">
              <button className="p-1.5 hover:bg-gray-50 rounded-full text-gray-600"><Heart className="w-4.5 h-4.5" /></button>
              <button className="p-1.5 hover:bg-gray-50 rounded-full text-gray-600"><Share2 className="w-4.5 h-4.5" /></button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-24 text-left">
            {/* Product image */}
            <div className="relative w-full h-[320px] bg-slate-50 border-b border-gray-100">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs py-1 px-2.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-700">Same Day Delivery Eligible</span>
              </div>
            </div>

            {/* Title & Price Header */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex flex-col gap-2">
              <h2 className="text-base font-black text-slate-800 tracking-wide leading-snug">{selectedProduct.name}</h2>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-black text-[#ff3f6c]">₹{selectedProduct.price}</span>
                <span className="text-xs text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
                <span className="text-[9.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF
                </span>
              </div>
            </div>

            {/* Boutique Brand & Verified Status */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-slate-50/50 to-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-[#ff3f6c] border border-gray-200">
                  {selectedProduct.boutique.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wide">Handmade Sourced By</span>
                  <span className="font-extrabold text-xs text-slate-800 leading-none mt-0.5">{selectedProduct.boutique}</span>
                </div>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-3xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider">Artisan Verified</span>
              </div>
            </div>

            {/* Geofence Sourcing Specs */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#ff3f6c]" />
                  <span>📍 {selectedProduct.distance} km away</span>
                </div>
                <span>🚚 Delivered within {selectedProduct.deliveryTime}</span>
              </div>

              {/* Progress visual of location geofence */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-[#ff3f6c]" style={{ width: `${Math.max(10, 100 - selectedProduct.distance * 8)}%` }} />
              </div>
            </div>

            {/* Artisan Story Badge */}
            <div className="mx-4 mt-4 bg-orange-50/40 border border-orange-100/70 p-3.5 rounded-2xl flex gap-3 text-left">
              <Sparkles className="w-5 h-5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9.5px] font-black text-orange-800 uppercase tracking-wide">Weaver / Artisan Bio</span>
                <p className="text-[10.5px] text-orange-950 font-bold leading-relaxed">
                  Support traditional craftsmanship. Handcrafted by local artisans of {selectedProduct.location} using heritage techniques passed down for generations.
                </p>
              </div>
            </div>

            {/* Core Trust Score Matrices */}
            <div className="px-4 py-5 bg-white border-b border-gray-100">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Boutique Trust Metrics</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-base font-black text-slate-800 flex items-center justify-center gap-0.5">
                    {selectedProduct.rating} <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  </span>
                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tight">Rating</span>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-base font-black text-slate-800">{selectedProduct.onTimeDelivery}%</span>
                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tight">On-Time Speed</span>
                </div>
                <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-base font-black text-slate-800">{selectedProduct.returnRate}%</span>
                  <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tight">Return Rate</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-4 bg-white flex flex-col gap-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Item Details</h4>
              <p className="text-xs text-gray-600 leading-relaxed leading-normal select-text">
                {selectedProduct.description}
              </p>
            </div>
          </main>

          {/* Checkout Bar */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3.5 flex gap-3.5 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            <button 
              onClick={() => { setProposedBid(Math.round(selectedProduct.price * 0.81)); setStep(3); }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-[#ff3f6c] hover:from-orange-600 hover:to-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> Request Best Price
            </button>
            <button 
              onClick={() => setStep(5)}
              className="flex-1 bg-[#282c3f] hover:bg-[#151722] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              Buy Now
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Bargain Best Price (Interactive Slider & Gauge) */}
      {step === 3 && selectedProduct && (
        <>
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-3xs">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Propose Bargain Price</span>
            </div>
            <span className="text-[10px] text-[#ff3f6c] font-black uppercase bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded shadow-3xs">Bargain Round</span>
          </header>

          <main className="flex-1 px-4 py-6 flex flex-col gap-6 text-center">
            
            {/* Price comparisons */}
            <div className="flex justify-around items-center border border-gray-100 rounded-2xl p-4 bg-white shadow-3xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Standard Price</span>
                <span className="text-base font-black text-slate-400 line-through">₹{selectedProduct.price}</span>
              </div>
              <div className="w-[1px] h-8 bg-gray-100" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Proposed Bargain</span>
                <span className="text-xl font-black text-[#ff3f6c]">₹{proposedBid}</span>
              </div>
            </div>

            {/* Custom SVG likelihood gauge */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 border border-gray-100 rounded-2xl p-4">
              <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-wider">Likelihood Meter</span>
              
              {/* Gauge Arc (Only contains the SVG) */}
              <div className="relative w-44 h-[88px] flex items-end justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
                  {/* Colored segments */}
                  <path d="M 10 50 A 40 40 0 0 1 36 24" fill="none" stroke="#ef4444" strokeWidth="8" />
                  <path d="M 36 24 A 40 40 0 0 1 64 24" fill="none" stroke="#eab308" strokeWidth="8" />
                  <path d="M 64 24 A 40 40 0 0 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" />
                  
                  {/* Needle line */}
                  <line 
                    x1="50" 
                    y1="50" 
                    x2={`${50 + 36 * Math.cos((180 - (probInfo.percentage / 100) * 180) * Math.PI / 180)}`}
                    y2={`${50 - 36 * Math.sin((180 - (probInfo.percentage / 100) * 180) * Math.PI / 180)}`}
                    stroke="#1e293b" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    className="transition-all duration-300 ease-out"
                  />
                  <circle cx="50" cy="50" r="5" fill="#1e293b" />
                </svg>
              </div>

              {/* Labels displayed clearly below the gauge (No overlap!) */}
              <div className="text-center flex flex-col items-center">
                <span className={`text-xs font-black uppercase tracking-wider ${probInfo.color}`}>{probInfo.label}</span>
                <span className="text-[10px] text-gray-500 font-bold mt-0.5">{probInfo.percentage}% Acceptance Probability</span>
              </div>

              {/* Note text below meter */}
              <p className="text-[10px] text-gray-500 font-bold border-t border-gray-150/50 pt-2 w-full text-center leading-normal">
                💡 {probInfo.note}
              </p>
            </div>

            {/* Slider control */}
            <div className="flex flex-col gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-3xs">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block text-left">Slide Your Bid offer</span>
              <input 
                type="range"
                min={Math.round(selectedProduct.price * 0.7)} // Minimum limit 70% of list price
                max={selectedProduct.price}
                value={proposedBid}
                onChange={(e) => setProposedBid(Number(e.target.value))}
                className="w-full accent-[#ff3f6c] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <div className="flex flex-col items-start">
                  <span className="text-red-500 font-extrabold">₹{Math.round(selectedProduct.price * 0.7)}</span>
                  <span>Min limit</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-amber-500 font-extrabold">₹{Math.round(selectedProduct.price * 0.85)}</span>
                  <span>Fair limit</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-500 font-extrabold">₹{selectedProduct.price}</span>
                  <span>Listed price</span>
                </div>
              </div>
            </div>

          </main>

          {/* Offer confirmation CTA */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3.5 flex z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            <button 
              onClick={handleSubmitOffer}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99] text-center"
            >
              Propose & Chat
            </button>
          </div>
        </>
      )}

      {/* STEP 4: Negotiate with Shop (API-driven conversation) */}
      {step === 4 && selectedProduct && (
        <>
          {/* Conversational chat header */}
          <header className="w-full bg-white px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-3xs">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(3)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shadow-3xs">
                {selectedProduct.boutique.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xs text-slate-800 leading-none">{selectedProduct.boutique}</span>
                {isTyping ? (
                  <span className="text-[9px] text-[#ff3f6c] font-black animate-pulse mt-0.5">Typing counter proposal...</span>
                ) : (
                  <span className="text-[9px] text-emerald-500 font-black tracking-wide mt-0.5">Active now</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500 pr-1">
              <Phone className="w-4 h-4 cursor-pointer hover:text-[#ff3f6c]" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-[#ff3f6c]" />
            </div>
          </header>

          {/* Chat message space */}
          <main className="flex-1 overflow-y-auto px-4 py-4 bg-[#f8f9fa] flex flex-col gap-4 select-text">
            <div className="text-[8.5px] text-gray-400 font-bold text-center uppercase tracking-wider select-none py-1 border-b border-gray-200/50">
              Artisan Bargain Session
            </div>

            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[85%] items-end ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`p-3 rounded-2xl text-[11px] leading-normal font-semibold shadow-3xs ${
                  msg.sender === "user" 
                    ? "bg-[#ff3f6c] text-white rounded-br-none" 
                    : "bg-white border border-gray-150 text-slate-800 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[7px] text-gray-400 font-bold select-none shrink-0 mb-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 mr-auto items-center">
                <div className="bg-white border border-gray-150 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-3xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </main>

          {/* Negotiating Controls Panel */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 p-3 flex flex-col gap-2.5 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            
            {/* Quick Action buttons representing bids */}
            {!isTyping && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === "shop" && (
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={() => handleAcceptCounter(negotiatedPrice)}
                  className="flex-1 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Accept Offer (₹{negotiatedPrice})
                </button>
                {chatRound < 2 && (
                  <button 
                    onClick={() => handleUserCounterBid(Math.round((proposedBid + negotiatedPrice) / 2))}
                    className="flex-1 bg-[#282c3f] hover:bg-[#151722] text-white text-[10px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Counter ₹{Math.round((proposedBid + negotiatedPrice) / 2)}
                  </button>
                )}
                <button 
                  onClick={() => {
                    setChatMessages(prev => [...prev, { sender: "shop", text: "Offer canceled. Redirecting you to catalog...", time: "now" }]);
                    setTimeout(() => setStep(1), 1500);
                  }}
                  className="bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 text-[10px] font-black px-3.5 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Reject
                </button>
              </div>
            )}

            {/* Text message bar */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-gray-300 transition-colors">
              <input 
                type="text"
                placeholder="Type counter offer amount (e.g. 1100)..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendFreeChatMessage()}
                className="flex-1 bg-transparent border-none outline-none text-xs text-gray-700 placeholder-gray-400"
              />
              <button 
                onClick={handleSendFreeChatMessage}
                className="text-[#ff3f6c] p-0.5 hover:scale-105 transition-transform cursor-pointer shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* STEP 5: Choose Fulfillment */}
      {step === 5 && selectedProduct && (
        <>
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-3xs">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Fulfillment Option</span>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 flex flex-col gap-5 text-left">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Boutique Delivery</h3>
            
            {/* Same day delivery option */}
            <div 
              onClick={() => setFulfillmentMode("delivery")}
              className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                fulfillmentMode === "delivery"
                  ? "border-[#ff3f6c] bg-pink-50/20 shadow-3xs"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  fulfillmentMode === "delivery" ? "border-[#ff3f6c]" : "border-gray-300"
                }`}>
                  {fulfillmentMode === "delivery" && <span className="w-2.5 h-2.5 rounded-full bg-[#ff3f6c]"></span>}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800">Delivered within {selectedProduct.deliveryTime}</span>
                  <span className="text-[9.5px] text-gray-400 mt-0.5">Sourced from {selectedProduct.boutique} ({selectedProduct.distance} km)</span>
                </div>
              </div>
              <span className="text-xs font-black text-slate-800">₹49</span>
            </div>

            {/* Boutique store pickup option */}
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-2">Local Shop Pick-up</h3>
            <div 
              onClick={() => setFulfillmentMode("pickup")}
              className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                fulfillmentMode === "pickup"
                  ? "border-[#ff3f6c] bg-pink-50/20 shadow-3xs"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  fulfillmentMode === "pickup" ? "border-[#ff3f6c]" : "border-gray-300"
                }`}>
                  {fulfillmentMode === "pickup" && <span className="w-2.5 h-2.5 rounded-full bg-[#ff3f6c]"></span>}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-slate-800">Pickup in {selectedProduct.pickupTime}</span>
                  <span className="text-[9.5px] text-gray-400 mt-0.5">Reserve online, pay & pick up from local boutique counter</span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Free</span>
            </div>

            {/* Tailoring toggle block */}
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center mt-3">
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Custom Tailoring Available
                </span>
                <span className="text-[9.5px] text-emerald-700">Add tailoring instructions to fit your profile mannequin.</span>
              </div>
              <button 
                onClick={() => alert("Mannequin details synced! Tailoring will be adjusted to your profile sizes.")}
                className="bg-emerald-600 text-white text-[9.5px] font-black py-1.5 px-3 rounded-lg shadow-sm"
              >
                Apply Fits
              </button>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-[9.5px] text-orange-800 font-bold leading-tight">
                Order within next 30 mins to guarantee on-time delivery schedule!
              </span>
            </div>
          </main>

          {/* Place order CTA */}
          <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3.5 flex z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.06)]">
            <button 
              onClick={() => setStep(6)}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99] text-center"
            >
              Confirm Order & Pay
            </button>
          </div>
        </>
      )}

      {/* STEP 6: Save or Share Deal */}
      {step === 6 && selectedProduct && (
        <main className="flex-1 px-4 py-16 flex flex-col gap-6 text-center justify-center items-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md animate-bounce">
            <CheckCircle className="w-9 h-9" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Bargain Secured!</h2>
            <p className="text-sm text-gray-500 font-bold">
              Purchased {selectedProduct.name} at <span className="text-[#ff3f6c] font-black">₹{negotiatedPrice}</span>
            </p>
            <span className="text-[9.5px] font-black text-gray-400 uppercase tracking-widest mt-1">Order Ref: MYN-LB-{(Math.random()*1000000).toFixed(0)}</span>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3.5 mt-6">
            <button 
              onClick={() => { alert("Shared to Outfit Circle group board!"); setStep(1); }}
              className="bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              Share Deal to Outfit Circle
            </button>
            
            <button 
              onClick={() => setStep(1)}
              className="bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-3xs cursor-pointer transition-colors"
            >
              Return to Apna Bazaar
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
