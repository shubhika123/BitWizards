"use client";
import { useState } from "react";
import { X, Sparkles, MapPin } from "lucide-react";
import { createBoard } from "../../lib/OutfitCircleApi";

export default function CreateBoardModal({
  userId,
  onClose,
  onCreated,
}: {
  userId: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [circleType, setCircleType] = useState("classic");
  const [city, setCity] = useState("Patna");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    try {
      // Pass the new reimagined properties to createBoard
      await createBoard(
        name,
        userId,
        [],
        circleType,
        circleType !== "classic" ? city : null,
        description || null,
        circleType === "creator" ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" : null
      );
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to create board right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative border border-rose-100 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-rose-50 text-[#ff3f6c]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-black text-sm text-[#282c3f] uppercase tracking-wider">Create Circle Board</h3>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Circle Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Patna Gully Fashion Circle"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 outline-none focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c] transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Circle Type</label>
            <select
              value={circleType}
              onChange={(e) => setCircleType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 outline-none focus:border-[#ff3f6c] bg-white transition-all"
            >
              <option value="classic">Classic Shared Board</option>
              <option value="gully">📍 Gully/Mohalla Local Circle</option>
              <option value="college">🎓 College/Campus Hub</option>
              <option value="creator">✨ Creator Style Circle</option>
            </select>
          </div>

          {circleType !== "classic" && (
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#ff3f6c]" /> Target City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Patna, Vizag, Belgaum"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 outline-none focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c] transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this circle style focus?"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs mt-1 outline-none focus:border-[#ff3f6c] focus:ring-1 focus:ring-[#ff3f6c] transition-all resize-none"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="w-full bg-[#ff3f6c] text-white text-xs font-black py-2.5 rounded-xl uppercase tracking-wider shadow-lg shadow-rose-100 hover:bg-[#e63560] active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Creating..." : "Create Circle"}
          </button>
        </div>
      </div>
    </div>
  );
}