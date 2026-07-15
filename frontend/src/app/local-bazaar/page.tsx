"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  TrendingDown
} from "lucide-react";

interface Product {
  id: string;
  name: string;
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

export default function LocalBazaar() {
  const [step, setStep] = useState<number>(1); // 1 = Discover, 2 = Profile, 3 = Slider, 4 = Chat, 5 = Fulfillment, 6 = Success
  const [selectedRadius, setSelectedRadius] = useState<number>(5);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Bargain states
  const [proposedBid, setProposedBid] = useState<number>(1050);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(1299);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "shop"; text: string; time: string }>>([]);
  const [chatRound, setChatRound] = useState<number>(1); // max 2 rounds
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [fulfillmentMode, setFulfillmentMode] = useState<"delivery" | "pickup">("delivery");

  // Mock Products Database
  const products: Product[] = [
    {
      id: "local_1",
      name: "White Chikankari Kurti",
      price: 1299,
      originalPrice: 1999,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80",
      trustScore: 92,
      distance: 2.4,
      deliveryTime: "3 Hours",
      pickupTime: "30 mins",
      boutique: "Avadh Weaves",
      location: "Lucknow",
      rating: 4.7,
      onTimeDelivery: 98,
      returnRate: 5,
      yearsOnMyntra: 3,
      description: "Pure cotton chikankari kurti with beautiful hand embroidery. Perfect for festive and casual wear.",
    },
    {
      id: "local_2",
      name: "Handloom Cotton Saree",
      price: 1980,
      originalPrice: 2999,
      image: "https://images.unsplash.com/photo-1610030469583-b7880df965aa?auto=format&fit=crop&w=400&q=80",
      trustScore: 90,
      distance: 2.7,
      deliveryTime: "4 Hours",
      pickupTime: "30 mins",
      boutique: "Crafts of Lucknow",
      location: "Varanasi",
      rating: 4.5,
      onTimeDelivery: 95,
      returnRate: 6,
      yearsOnMyntra: 2,
      description: "Handcrafted pure cotton saree woven by local Varanasi artisans. Elegant traditional drapes.",
    },
    {
      id: "local_3",
      name: "Embroidered Kurta Set",
      price: 1699,
      originalPrice: 2499,
      image: "https://images.unsplash.com/photo-1597983073492-bc24058bf375?auto=format&fit=crop&w=400&q=80",
      trustScore: 88,
      distance: 3.1,
      deliveryTime: "4 Hours",
      pickupTime: "45 mins",
      boutique: "Trende Boutique",
      location: "Delhi",
      rating: 4.4,
      onTimeDelivery: 92,
      returnRate: 7,
      yearsOnMyntra: 1,
      description: "Beautifully embroidered kurta set with match pyjama. Lightweight breathable cotton.",
    },
  ];

  // Set default product on mount for easy discovery demonstration
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, []);

  const filteredProducts = products.filter(p => p.distance <= selectedRadius);

  // Bargain Bid Acceptance Probability
  const getBargainProbability = (bid: number, originalPrice: number) => {
    const ratio = bid / originalPrice;
    if (ratio >= 0.90) return { prob: "Less likely", color: "bg-red-500" };
    if (ratio >= 0.80) return { prob: "We can try", color: "bg-yellow-400" };
    return { prob: "Great deal", color: "bg-emerald-500" };
  };

  // Submit Offer (transitions to Chat Room)
  const handleSubmitOffer = () => {
    setChatRound(1);
    setChatMessages([
      { 
        sender: "shop", 
        text: `Namaste! 🙏 This is pure handloom chikankari. I can do ₹1,180 for you.`, 
        time: "11:32 AM" 
      }
    ]);
    setStep(4); // Go to Chat
  };

  // Accept shopkeeper's counter
  const handleAcceptCounter = (price: number) => {
    setNegotiatedPrice(price);
    const userMessage = { sender: "user" as const, text: `Accepting ₹${price}`, time: "11:35 AM" };
    setChatMessages(prev => [...prev, userMessage]);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: "shop" as const, text: `Done! ₹${price} works.`, time: "11:36 AM" }
      ]);
      setTimeout(() => {
        setStep(5);
      }, 1000);
    }, 800);
  };

  // Chat message simulator logic
  const handleSendChatMessage = (text: string) => {
    if (!text.trim() || !selectedProduct) return;
    
    // Add user message
    const userMsg = { sender: "user" as const, text, time: "11:33 AM" };
    setChatMessages(prev => [...prev, userMsg]);
    setUserChatInput("");

    if (chatRound === 1) {
      // Round 1 Counter Reply
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { 
            sender: "shop", 
            text: `Let me check... final best for you ₹1,140.`, 
            time: "11:34 AM" 
          }
        ]);
        setChatRound(2);
      }, 1000);
    } else if (chatRound === 2) {
      // Round 2 Accept Reply
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { 
            sender: "shop", 
            text: `Done! ₹1,140 works.`, 
            time: "11:36 AM" 
          }
        ]);
        setNegotiatedPrice(1140);
        // Automatically proceed to fulfillment selection after brief delay
        setTimeout(() => {
          setStep(5);
        }, 1200);
      }, 1000);
    }
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen flex flex-col font-sans relative">
      
      {/* STEP 1: Discover Nearby Products */}
      {step === 1 && (
        <>
          {/* Header */}
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 select-none shrink-0">
            <div className="flex items-center gap-2">
              <Link href="/bharat-feed" className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Apna Bazaar</span>
            </div>
            <div className="flex items-center gap-4 text-gray-600 scale-95">
              <Search className="w-4.5 h-4.5" />
              <Heart className="w-4.5 h-4.5" />
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
          </header>

          {/* Location selector */}
          <div className="bg-[#fff5f2] px-4 py-2.5 flex items-center justify-between text-xs font-bold select-none border-b border-orange-100/50 shrink-0">
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-4 h-4 text-[#ff3f6c]" />
              <span>Lucknow</span>
            </div>
            <button className="text-sky-500 font-extrabold text-[10px] hover:underline cursor-pointer">Use my location</button>
          </div>

          {/* Radius selector pills */}
          <div className="px-3.5 py-3.5 border-b border-gray-100 select-none shrink-0 bg-white">
            <div className="flex gap-2">
              {[2, 5, 10, 15].map((km) => (
                <button
                  key={km}
                  onClick={() => setSelectedRadius(km)}
                  className={`flex-1 text-center py-2 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                    selectedRadius === km
                      ? "border-[#ff3f6c] bg-pink-50 text-[#ff3f6c] shadow-3xs"
                      : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                  }`}
                >
                  &lt; {km} km
                </button>
              ))}
            </div>
          </div>

          {/* Discover Feed */}
          <main className="flex-1 overflow-y-auto px-4 py-4 select-none flex flex-col gap-3">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Nearby for you</h3>
            
            <div className="flex flex-col gap-3">
              {filteredProducts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setStep(2); }}
                  className="flex gap-3.5 border border-gray-150 p-2.5 rounded-xl bg-white cursor-pointer hover:shadow-sm transition-shadow shadow-3xs"
                >
                  <img src={p.image} alt={p.name} className="w-20 h-24 rounded-lg object-cover bg-gray-50 shrink-0 border border-gray-100" />
                  <div className="flex-1 flex flex-col justify-between py-0.5 text-left">
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-800 leading-snug">{p.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{p.boutique}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9.5px] text-amber-600 font-extrabold">⭐ {p.trustScore}%</span>
                        <span className="text-gray-300 text-[8px]">•</span>
                        <span className="text-[9.5px] text-gray-500 font-bold">📍 {p.distance} km</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline mt-1.5">
                      <span className="text-[10px] text-emerald-600 font-black">{p.deliveryTime} ETA</span>
                      <span className="text-xs font-black text-gray-800">₹{p.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {/* STEP 2: View Product & Seller Profile */}
      {step === 2 && selectedProduct && (
        <>
          {/* Main detailed details */}
          <main className="flex-1 overflow-y-auto pb-24 text-left">
            {/* Product image with overlays */}
            <div className="relative w-full h-[320px] bg-gray-50">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              
              {/* Overlays */}
              <button 
                onClick={() => setStep(1)}
                className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow-md text-gray-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-white/80 p-2 rounded-full shadow-md text-gray-755"><Heart className="w-4 h-4" /></button>
                <button className="bg-white/80 p-2 rounded-full shadow-md text-gray-755"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Price and Title */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 flex flex-col gap-1.5">
              <h2 className="text-base font-extrabold text-[#282c3f] tracking-wide">{selectedProduct.name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-gray-800">₹{selectedProduct.price}</span>
                <span className="text-xs text-gray-400 line-through">₹{selectedProduct.originalPrice}</span>
              </div>
            </div>

            {/* Sold by boutique */}
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-450 font-bold uppercase mr-1">Sold by</span>
                <span className="font-extrabold text-xs text-gray-850">{selectedProduct.boutique}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 scale-95 shadow-3xs">
                <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                <span className="text-[9px] text-emerald-800 font-extrabold uppercase">Verified Boutique</span>
              </div>
            </div>

            {/* Sourcing Distance */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex flex-col gap-2">
              <div className="flex items-center gap-1 text-[#ff3f6c] font-black text-xs">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{selectedProduct.trustScore}% Trust Score</span>
              </div>
              <p className="text-[11px] text-gray-500 font-bold">
                📍 {selectedProduct.distance} km away &nbsp;•&nbsp; 🚚 Delivery in {selectedProduct.deliveryTime}
              </p>
            </div>

            {/* Three Trust Metrics Strip */}
            <div className="px-4 py-4 bg-white border-b border-gray-100 select-none">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-2.5 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-sm font-black text-gray-800">{selectedProduct.rating}</span>
                  <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">Store Rating</span>
                </div>
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-2.5 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-sm font-black text-gray-800">{selectedProduct.onTimeDelivery}%</span>
                  <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">On-Time Delivery</span>
                </div>
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-2.5 text-center flex flex-col gap-0.5 shadow-3xs">
                  <span className="text-sm font-black text-gray-800">{selectedProduct.returnRate}%</span>
                  <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">Return Rate</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-4 bg-white flex flex-col gap-1.5 select-text">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {selectedProduct.description} <span className="text-[#ff3f6c] font-black cursor-pointer">Read more</span>
              </p>
            </div>
          </main>

          {/* Bottom CTA Actions */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white border-t border-gray-100 px-4 py-3 flex gap-3 z-40 select-none shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
            <button 
              onClick={() => { setProposedBid(Math.round(selectedProduct.price * 0.81)); setStep(3); }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-[#ff3f6c] hover:from-orange-600 hover:to-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> Bargain Best Price
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

      {/* STEP 3: Bargain Best Price (Interactive Slider) */}
      {step === 3 && selectedProduct && (
        <>
          {/* Header */}
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 select-none shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(2)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Bargain Best Price</span>
            </div>
            <span className="text-[10px] text-[#ff3f6c] font-black uppercase bg-pink-50 border border-pink-100 px-2 py-0.5 rounded shadow-3xs select-none">Round 1 of 2</span>
          </header>

          <main className="flex-1 px-4 py-8 select-none flex flex-col gap-6 text-center">
            {/* Listed Price display */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Listed Price</span>
              <span className="text-2xl font-black text-gray-800">₹{selectedProduct.price}</span>
            </div>

            <div className="w-full h-[1px] bg-gray-100"></div>

            {/* Slider Title */}
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wide">Choose your best price</h3>

            {/* Graded Slider */}
            <div className="flex flex-col gap-3 px-2">
              {/* Visual graded background bar */}
              <div className="relative w-full h-2 rounded-full overflow-hidden flex">
                <div className="w-1/3 h-full bg-emerald-500"></div>
                <div className="w-1/3 h-full bg-yellow-400"></div>
                <div className="w-1/3 h-full bg-rose-500"></div>
              </div>

              {/* Range input */}
              <input 
                type="range"
                min={Math.round(selectedProduct.price * 0.7)} // Min 70% of list price
                max={selectedProduct.price}
                value={proposedBid}
                onChange={(e) => setProposedBid(Number(e.target.value))}
                className="w-full accent-[#ff3f6c] cursor-pointer"
              />

              {/* Graded Labels */}
              <div className="flex justify-between items-start text-[9.5px] font-bold text-gray-450 mt-1">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-emerald-600 font-extrabold">₹{Math.round(selectedProduct.price * 0.7)}</span>
                  <span>(Great deal)</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-amber-500 font-extrabold">₹{Math.round(selectedProduct.price * 0.85)}</span>
                  <span>(We can try)</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-rose-500 font-extrabold">₹{selectedProduct.price}</span>
                  <span>(Less likely)</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-gray-100"></div>

            {/* Output Offer Card */}
            <div className="bg-gray-50 border border-gray-150 p-5 rounded-2xl flex flex-col gap-1 shadow-3xs max-w-xs mx-auto w-full">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Your Offer</span>
              <span className="text-xl font-black text-[#ff3f6c]">₹{proposedBid}</span>
            </div>

            <span className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider block mt-4 select-none">
              You have 2 rounds to negotiate
            </span>
          </main>

          {/* Sticky Offer submit */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white border-t border-gray-100 px-4 py-3 flex z-40 select-none shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
            <button 
              onClick={handleSubmitOffer}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99] text-center"
            >
              Submit Offer
            </button>
          </div>
        </>
      )}

      {/* STEP 4: Negotiate with Shop (Conversational Chat) */}
      {step === 4 && selectedProduct && (
        <>
          {/* Custom chat header */}
          <header className="w-full bg-white px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100 select-none shrink-0 shadow-3xs">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep(3)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              {/* Avatar circular */}
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center select-none shadow-3xs">
                AW
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-xs text-gray-800 leading-none">{selectedProduct.boutique}</span>
                <span className="text-[9px] text-emerald-500 font-black tracking-wide mt-0.5">Active now</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-600 pr-1">
              <Phone className="w-4 h-4 cursor-pointer" />
              <MoreVertical className="w-4 h-4 cursor-pointer" />
            </div>
          </header>

          {/* Chat Feed */}
          <main className="flex-1 overflow-y-auto px-4 py-4 select-text bg-[#f8f9fa] flex flex-col gap-3.5">
            <div className="text-[8.5px] text-gray-400 font-bold text-center uppercase tracking-wider select-none py-1 border-b border-gray-200/50">
              Today
            </div>

            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 max-w-[85%] items-end ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className={`p-3 rounded-2xl text-[10.5px] leading-relaxed shadow-3xs font-semibold ${
                  msg.sender === "user" 
                    ? "bg-[#ff3f6c] text-white rounded-br-none" 
                    : "bg-white border border-gray-200 text-gray-850 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[7.5px] text-gray-400 font-bold select-none shrink-0 mb-1">{msg.time}</span>
              </div>
            ))}
          </main>

          {/* Chat Bottom Action Inputs */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white border-t border-gray-100 p-3 flex flex-col gap-2 z-40 select-none shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
            
            {/* Chat Round Status overlay */}
            <div className="flex justify-between items-center text-[9px] text-gray-400 font-black uppercase tracking-wider px-1">
              <span>Round {chatRound} of 2</span>
              <span>Shopkeeper is countering...</span>
            </div>

            {/* Quick action buttons based on round */}
            {chatRound === 1 && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === "shop" && (
              <div className="flex gap-2 mb-1">
                <button 
                  onClick={() => handleAcceptCounter(1180)}
                  className="flex-1 bg-pink-50 border border-pink-100 hover:bg-pink-100 text-[#ff3f6c] text-[10.5px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Accept ₹1,180
                </button>
                <button 
                  onClick={() => handleSendChatMessage("Can you do ₹1,100?")}
                  className="flex-1 bg-[#282c3f] hover:bg-[#151722] text-white text-[10.5px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Counter ₹1,100
                </button>
              </div>
            )}

            {chatRound === 2 && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].sender === "shop" && (
              <div className="flex gap-2 mb-1">
                <button 
                  onClick={() => handleAcceptCounter(1140)}
                  className="flex-1 bg-pink-50 border border-pink-100 hover:bg-pink-100 text-[#ff3f6c] text-[10.5px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Accept ₹1,140 works
                </button>
                <button 
                  onClick={() => {
                    setChatMessages(prev => [...prev, { sender: "shop", text: "Bargain rejected. Offer expired.", time: "11:37 AM" }]);
                    setTimeout(() => setStep(1), 1500);
                  }}
                  className="flex-1 bg-gray-100 text-gray-450 border border-gray-200 text-[10.5px] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Reject offer
                </button>
              </div>
            )}

            {/* Input bar */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-gray-300 transition-colors">
              <input 
                type="text"
                placeholder="Type a message..."
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage(userChatInput)}
                className="flex-1 bg-transparent border-none outline-none text-xs text-gray-700 placeholder-gray-400"
              />
              <button 
                onClick={() => handleSendChatMessage(userChatInput)}
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
          {/* Header */}
          <header className="w-full bg-white px-3.5 py-3 flex items-center justify-between border-b border-gray-100 select-none shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep(4)} className="p-1 hover:bg-gray-50 rounded-lg cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-extrabold text-sm text-gray-800 tracking-wide">Choose Fulfillment</span>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 select-none flex flex-col gap-5 text-left">
            {/* Delivery to you Card */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-gray-455 uppercase tracking-wider">Delivery to you</span>
              
              <div 
                onClick={() => setFulfillmentMode("delivery")}
                className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  fulfillmentMode === "delivery"
                    ? "border-[#ff3f6c] bg-pink-50/20 shadow-3xs"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    fulfillmentMode === "delivery" ? "border-[#ff3f6c]" : "border-gray-300"
                  }`}>
                    {fulfillmentMode === "delivery" && <span className="w-2 h-2 rounded-full bg-[#ff3f6c]"></span>}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-gray-850">Delivery in 3 Hours</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{selectedProduct.distance} km away</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-gray-800">₹49</span>
              </div>
            </div>

            {/* Store Pickup Card */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-gray-455 uppercase tracking-wider">Store Pickup</span>
              
              <div 
                onClick={() => setFulfillmentMode("pickup")}
                className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  fulfillmentMode === "pickup"
                    ? "border-[#ff3f6c] bg-pink-50/20 shadow-3xs"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    fulfillmentMode === "pickup" ? "border-[#ff3f6c]" : "border-gray-300"
                  }`}>
                    {fulfillmentMode === "pickup" && <span className="w-2 h-2 rounded-full bg-[#ff3f6c]"></span>}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-gray-850">Pickup in 30 mins</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{selectedProduct.distance} km away</span>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 uppercase">FREE</span>
              </div>
            </div>

            {/* Prompt warning text */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-[9.5px] text-orange-800 font-bold leading-tight">
                Order within next 45 mins to get delivery in 3 Hours
              </span>
            </div>
          </main>

          {/* Continue button */}
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[400px] bg-white border-t border-gray-100 px-4 py-3 flex z-40 select-none shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
            <button 
              onClick={() => setStep(6)}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99] text-center"
            >
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 6: Save or Share Deal */}
      {step === 6 && selectedProduct && (
        <main className="flex-1 px-4 py-16 select-none flex flex-col gap-6 text-center justify-center items-center">
          {/* Success circle Check icon */}
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-md">
            <CheckCircle className="w-9 h-9" strokeWidth={2.5} />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide">Deal Saved!</h2>
            <p className="text-xs text-gray-550 font-bold">
              {selectedProduct.name} at <span className="text-[#ff3f6c] font-black">₹{negotiatedPrice}</span>
            </p>
            <span className="text-[9.5px] text-gray-400 font-bold uppercase tracking-wider mt-1">Saved in 'My Deals'</span>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3 mt-6">
            <button 
              onClick={() => { alert("Shared to Outfit Circle successfully!"); setStep(1); }}
              className="bg-[#ff3f6c] hover:bg-[#e0355f] text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              Share to Outfit Circle
            </button>
            
            <button 
              onClick={() => { alert("Saved for later!"); setStep(1); }}
              className="bg-white border border-gray-250 text-gray-650 hover:bg-gray-50 text-xs font-black py-3.5 rounded-xl uppercase tracking-wider shadow-3xs cursor-pointer transition-colors"
            >
              Save for Later
            </button>

            <button 
              onClick={() => setStep(1)}
              className="text-[#ff3f6c] hover:underline text-[11px] font-black tracking-wider uppercase mt-3 cursor-pointer"
            >
              Go to My Deals
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
