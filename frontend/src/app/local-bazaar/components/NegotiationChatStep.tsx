import React, { useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NegotiationChatStep() {
  const {
    selectedProduct,
    proposedBid,
    setProposedBid,
    setStep,
    negotiatedPrice,
    setNegotiatedPrice,
    chatMessages,
    setChatMessages,
    addChatMessage,
    chatRound,
    setChatRound,
    userChatInput,
    setUserChatInput,
    isTyping,
    setIsTyping,
  } = useBazaarStore();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on mount
  useEffect(() => {
    if (!selectedProduct || chatMessages.length > 0) return;
    
    // Initial message from user
    setChatMessages([
      {
        sender: "user",
        text: `Namaste. I am interested in the ${selectedProduct.name}. Would you accept ₹${proposedBid}?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Fetch response from backend
    const negotiate = async () => {
      setIsTyping(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/bazaar/negotiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: selectedProduct.id,
            original_price: selectedProduct.price,
            proposed_price: proposedBid
          })
        });

        if (res.ok) {
          const data = await res.json();
          setTimeout(() => {
            setIsTyping(false);
            addChatMessage({
              sender: "shop",
              text: data.message,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

            if (data.status === "accepted") {
              setNegotiatedPrice(data.final_price);
              setTimeout(() => setStep(5), 1500); // Proceed to fulfillment
            } else if (data.status === "counter-offered") {
              setNegotiatedPrice(data.final_price); // Current counter
            } else {
              setNegotiatedPrice(data.final_price); // Final rejected counter
            }
          }, 1500);
        }
      } catch (err) {
        console.error("Negotiation failed", err);
        setIsTyping(false);
      }
    };
    
    negotiate();
  }, [selectedProduct, proposedBid, setChatMessages, addChatMessage, setIsTyping, setNegotiatedPrice, setStep, chatMessages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  const handleUserReply = () => {
    if (!userChatInput.trim() || !selectedProduct) return;
    
    addChatMessage({
      sender: "user",
      text: userChatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    const bidAmount = parseInt(userChatInput.replace(/[^0-9]/g, ''), 10) || negotiatedPrice;
    setUserChatInput("");
    setIsTyping(true);
    
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bazaar/negotiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: selectedProduct.id,
            original_price: selectedProduct.price,
            proposed_price: bidAmount
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsTyping(false);
          addChatMessage({
            sender: "shop",
            text: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          
          if (data.status === "accepted") {
            setNegotiatedPrice(data.final_price);
            setTimeout(() => setStep(5), 1500);
          } else {
            setNegotiatedPrice(data.final_price);
            setChatRound(chatRound + 1);
          }
        }
      } catch (err) {
        setIsTyping(false);
      }
    }, 1000);
  };

  if (!selectedProduct) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b sticky top-0 z-10 shadow-3xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(3)} className="active:scale-95 transition-transform p-1">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-gray-800 tracking-wide">{selectedProduct.boutique}</span>
            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4 pb-24">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}>
            <div className={`p-3 rounded-2xl shadow-3xs text-sm font-medium leading-snug ${
              msg.sender === "user" 
                ? "bg-[#ff3f6c] text-white rounded-tr-sm" 
                : "bg-white text-slate-800 border border-gray-100 rounded-tl-sm"
            }`}>
              {msg.text}
            </div>
            <span className="text-[9px] text-gray-400 font-bold mt-1.5 px-1">{msg.time}</span>
          </div>
        ))}
        {isTyping && (
          <div className="self-start bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-3xs flex items-center gap-1 w-14 h-10">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75" />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150" />
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 w-full p-3 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-20 pb-8">
        {chatRound > 1 ? (
          <button
            onClick={() => setStep(5)}
            className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white font-black py-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            Accept Final Offer of ₹{negotiatedPrice}
          </button>
        ) : (
          <div className="flex gap-2 relative">
            <input
              type="text"
              placeholder={`Suggest ₹${negotiatedPrice - 50}...`}
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUserReply()}
              className="flex-1 bg-slate-50 border border-gray-200 text-sm font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c] transition-all"
            />
            <button
              onClick={handleUserReply}
              disabled={!userChatInput.trim()}
              className="bg-[#2d1a3c] text-white p-3.5 rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
