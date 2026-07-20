"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Check } from "lucide-react";
import { getUserBoards, pinProduct, createBoard } from "../../lib/OutfitCircleApi";

interface ProductToPin {
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_price?: number;
  product_url?: string;
}

export default function PinToBoardModal({
  product,
<<<<<<< HEAD
  userId,
=======
  products,
>>>>>>> b9903d536626042459928effaeaf4bf2ed5924ba
  onClose,
  onPinned,
}: {
<<<<<<< HEAD
  product: ProductToPin;
  userId: number;
=======
  product?: ProductToPin;
  products?: ProductToPin[];
>>>>>>> b9903d536626042459928effaeaf4bf2ed5924ba
  onClose: () => void;
  onPinned?: () => void;
}) {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedBoardId, setPinnedBoardId] = useState<number | null>(null);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const loadBoards = async () => {
    const data = await getUserBoards(userId);
    setBoards(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadBoards();
  }, [userId]);

  const handlePin = async (boardId: number) => {
<<<<<<< HEAD
    await pinProduct({ board_id: boardId, pinned_by: userId, ...product });
=======
    const itemsToPin = products || (product ? [product] : []);
    if (itemsToPin.length === 0) return;

    await Promise.all(
      itemsToPin.map((item) =>
        pinProduct({ board_id: boardId, pinned_by: CURRENT_USER_ID, ...item })
      )
    );
    
>>>>>>> b9903d536626042459928effaeaf4bf2ed5924ba
    setPinnedBoardId(boardId);
    onPinned?.();
    setTimeout(onClose, 700);
  };

  const handleCreateAndPin = async () => {
    if (!newBoardName.trim()) return;
    const board = await createBoard(newBoardName.trim(), userId);
    await handlePin(board.board_id);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[9999]">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 w-full sm:max-w-sm max-h-[70vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-sm text-[#282c3f]">Pin to Board</h3>
          <button onClick={onClose}>
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <span className="text-[10px] text-gray-400 font-bold">Loading boards...</span>
        ) : (
          <div className="space-y-2">
            {boards.map((b) => (
              <button
                key={b.board_id}
                onClick={() => handlePin(b.board_id)}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2.5 transition-colors"
              >
                <span className="text-xs font-bold text-[#282c3f]">{b.name}</span>
                {pinnedBoardId === b.board_id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[9px] font-black text-[#ff3f6c] uppercase">Pin</span>
                )}
              </button>
            ))}

            {boards.length === 0 && (
              <span className="text-[10px] text-gray-400 font-bold block py-2">
                No boards yet — create one below.
              </span>
            )}
          </div>
        )}

        {!showNewBoard ? (
          <button
            onClick={() => setShowNewBoard(true)}
            className="w-full flex items-center justify-center gap-1.5 mt-3 border border-dashed border-gray-300 rounded-xl py-2.5 text-[10px] font-black text-gray-500 hover:text-[#ff3f6c] hover:border-[#ff3f6c] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Board
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board name"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#ff3f6c]"
            />
            <button
              onClick={handleCreateAndPin}
              className="bg-[#ff3f6c] text-white text-[10px] font-black px-3 rounded-lg uppercase"
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return null;
}