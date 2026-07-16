"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import PinCard from "../../../components/OutfitCircle/PinCard";
import { getBoard } from "../../../lib/OutfitCircleApi";
import { Plus } from "lucide-react";

const CURRENT_USER_ID = 1;

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = Number(params.boardId);
  const [data, setData] = useState<any>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const load = () => getBoard(boardId).then(setData);

  useEffect(() => {
    load();
  }, [boardId]);

  if (!data) return null;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <h2 className="text-sm font-black text-[#282c3f] mb-3">{data.board.name}</h2>

        

        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-black text-gray-700">Pinned Items</span>
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full"
          >
            <Plus className="w-3.5 h-3.5" /> Pin Item
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {data.pins.map((pin: any) => (
            <PinCard key={pin.pin_id} pin={pin} userId={CURRENT_USER_ID} />
          ))}
        </div>
      </div>

    </div>
  );
}