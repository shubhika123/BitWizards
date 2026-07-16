"use client";
import { useState } from "react";
import { X } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await createBoard(name, userId);
    setLoading(false);
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-3 right-3">
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <h3 className="font-black text-sm text-[#282c3f] mb-3">Create a Board</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goa Trip"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-3 outline-none focus:border-[#ff3f6c]"
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-[#ff3f6c] text-white text-xs font-black py-2 rounded-lg uppercase tracking-wide"
        >
          {loading ? "Creating..." : "Create Board"}
        </button>
      </div>
    </div>
  );
}