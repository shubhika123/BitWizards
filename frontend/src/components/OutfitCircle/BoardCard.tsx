"use client";
import Link from "next/link";
import { Users } from "lucide-react";

export default function BoardCard({ board }: { board: { board_id: number; name: string } }) {
  return (
    <Link
      href={`/OutfitCircle/${board.board_id}`}
      className="bg-white border border-[#eaeaec] rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-[#ff3f6c]" />
        <span className="font-black text-sm text-[#282c3f]">{board.name}</span>
      </div>
      <span className="text-[10px] font-bold text-gray-400">View →</span>
    </Link>
  );
}