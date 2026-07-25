import React, { useEffect, useRef } from "react";
import { ArrowLeft, Send, Check, X, TrendingDown } from "lucide-react";
import { useBazaarStore } from "@/store/useBazaarStore";

export default function NegotiationChatStep() {
  const {
    selectedProduct,
    proposedBid,
    negotiatedPrice,
    chatMessages,
    chatRound,
    userChatInput,
    setUserChatInput,
    isTyping,
    isNegotiating,
    lastOfferStatus,
    submitNegotiationOffer,
    acceptBargainOffer,
    rejectBargainOffer,
    setStep,
  } = useBazaarStore();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const initStartedRef = useRef(false);

  // Initialize chat session once per fresh bargain (messages cleared by startBargainChat)
  useEffect(() => {
    if (!selectedProduct) return;
    if (chatMessages.length > 0) return;
    if (initStartedRef.current) return;
    if (isNegotiating) return;

    initStartedRef.current = true;
    const initMsg = `Namaste. I am interested in the ${selectedProduct.name}. Would you accept ₹${proposedBid}?`;
    void submitNegotiationOffer(proposedBid, initMsg);
  }, [selectedProduct, proposedBid, chatMessages.length, isNegotiating, submitNegotiationOffer]);

  // Reset init guard when thread is cleared (new bargain)
  useEffect(() => {
    if (chatMessages.length === 0 && chatRound === 0) {
      initStartedRef.current = false;
    }
  }, [chatMessages.length, chatRound]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  if (!selectedProduct) return null;

  // Auto midpoint for the quick counter: floor((proposedBid + negotiatedPrice) / 2)
  const midpointCounter = Math.floor((proposedBid + negotiatedPrice) / 2);

  const sellerCountered = lastOfferStatus === "counter-offered" || lastOfferStatus === "rejected";
  const idle = !isTyping && !isNegotiating;
  const roundsLeft = chatRound < 2;
  const showDecisionTree = sellerCountered && idle;
  const canCounter = showDecisionTree && roundsLeft;
  const roundLabel = Math.min(Math.max(chatRound, 1), 2);

  const submitCounter = (bid: number, message: string) => {
    if (isNegotiating || chatRound >= 2) return;
    setUserChatInput("");
    void submitNegotiationOffer(bid, message);
  };

  // Option B (manual) — parse numeric offer; non-numeric prompts for a valid figure
  const handleUserCounterBid = () => {
    if (!userChatInput.trim() || isNegotiating || chatRound >= 2) return;
    const digits = userChatInput.replace(/[^0-9]/g, "");
    if (!digits) {
      window.alert("Please enter a valid monetary figure (e.g. ₹1050).");
      return;
    }
    const bidAmount = parseInt(digits, 10);
    submitCounter(bidAmount, userChatInput);
  };

  // Option B (quick) — auto midpoint counter
  const handleQuickCounter = () => {
    submitCounter(midpointCounter, `Can we meet at ₹${midpointCounter}?`);
  };

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
        <span className="text-[10px] text-[#ff3f6c] font-black uppercase bg-pink-50 border border-pink-100 px-2.5 py-0.5 rounded shadow-3xs">
          Round {roundLabel} of 2
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-4 pb-44">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
          >
            <div
              className={`p-3 rounded-2xl shadow-3xs text-sm font-medium leading-snug ${
                msg.sender === "user"
                  ? "bg-[#ff3f6c] text-white rounded-tr-sm"
                  : "bg-white text-slate-800 border border-gray-100 rounded-tl-sm"
              }`}
            >
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

      <div className="fixed bottom-0 left-0 w-full p-3 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-20 pb-8 flex flex-col gap-2.5">
        {showDecisionTree && (
          <>
            {/* Option A — Accept */}
            <button
              onClick={() => void acceptBargainOffer()}
              disabled={isNegotiating}
              className="w-full bg-[#ff3f6c] hover:bg-[#e0355f] text-white font-black py-3.5 rounded-xl shadow-md shadow-pink-500/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4.5 h-4.5" strokeWidth={3} />
              Accept ₹{negotiatedPrice}
            </button>

            {canCounter ? (
              <>
                {/* Option B — Counter (quick midpoint) */}
                <button
                  onClick={handleQuickCounter}
                  disabled={isNegotiating}
                  className="w-full bg-white border-2 border-[#2d1a3c] text-[#2d1a3c] hover:bg-slate-50 font-black py-3 rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <TrendingDown className="w-4.5 h-4.5" strokeWidth={2.5} />
                  Counter at ₹{midpointCounter}
                </button>

                {/* Option B — Counter (manual) */}
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Or type your own offer..."
                    value={userChatInput}
                    onChange={(e) => setUserChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUserCounterBid()}
                    disabled={isNegotiating}
                    className="flex-1 bg-slate-50 border border-gray-200 text-sm font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c] transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleUserCounterBid}
                    disabled={!userChatInput.trim() || isNegotiating}
                    className="bg-[#2d1a3c] text-white p-3.5 rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Final round — accept the offer or walk away
              </p>
            )}

            {/* Option C — Reject */}
            <button
              onClick={() => rejectBargainOffer()}
              disabled={isNegotiating}
              className="w-full text-gray-500 hover:text-red-500 font-bold py-1.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
              Reject &amp; leave
            </button>
          </>
        )}
      </div>
    </div>
  );
}
