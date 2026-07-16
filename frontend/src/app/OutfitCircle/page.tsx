"use client";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import BoardCard from "../../components/OutfitCircle/BoardCard";
import CreateBoardModal from "../../components/OutfitCircle/CreateBoard";
import { getUserBoards } from "../../lib/OutfitCircleApi";
import { Plus } from "lucide-react";

const CURRENT_USER_ID = 1; // replace with real auth context

export default function OutfitCirclePage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const loadBoards = async () => {
  const data = await getUserBoards(CURRENT_USER_ID);
  setBoards(Array.isArray(data) ? data : []);
};

  useEffect(() => {
    loadBoards();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-[#282c3f] uppercase tracking-wide">Outfit Circle</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full"
          >
            <Plus className="w-3.5 h-3.5" /> New Board
          </button>
        </div>

        <div className="space-y-2.5">
          {boards.map((b) => (
            <BoardCard key={b.board_id} board={b} />
          ))}
        </div>
      </div>

      {showModal && (
        <CreateBoardModal
          userId={CURRENT_USER_ID}
          onClose={() => setShowModal(false)}
          onCreated={loadBoards}
        />
      )}
    </div>
  );
}