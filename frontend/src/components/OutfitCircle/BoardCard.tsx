"use client";
import Link from "next/link";
import { Users, MapPin, GraduationCap, Award, FolderHeart } from "lucide-react";

export default function BoardCard({ board }: { board: any }) {
  const isGully = board.circle_type === "gully";
  const isCollege = board.circle_type === "college";
  const isCreator = board.circle_type === "creator";

  const getBadgeStyle = () => {
    if (isGully) return { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "📍 Gully Circle" };
    if (isCollege) return { bg: "bg-indigo-50 text-indigo-700 border-indigo-100", label: "🎓 College Hub" };
    if (isCreator) return { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "✨ Creator Circle" };
    return { bg: "bg-rose-50 text-[#ff3f6c] border-rose-100", label: "👥 Shared Board" };
  };

  const badge = getBadgeStyle();

  return (
    <Link
      href={`/OutfitCircle/${board.board_id}`}
      className="bg-white border border-[#eaeaec] rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isGully && <MapPin className="w-4 h-4 text-emerald-500" />}
          {isCollege && <GraduationCap className="w-4 h-4 text-indigo-500" />}
          {isCreator && <Award className="w-4 h-4 text-amber-500" />}
          {!isGully && !isCollege && !isCreator && <FolderHeart className="w-4 h-4 text-[#ff3f6c]" />}
          <span className="font-black text-sm text-[#282c3f] tracking-wide">{board.name}</span>
        </div>
        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      {board.description && (
        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed font-semibold">
          {board.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-dashed border-gray-100">
        <div className="flex items-center gap-2">
          {board.city && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
              <MapPin className="w-2.5 h-2.5 text-gray-400" /> {board.city}
            </span>
          )}
        </div>
        <span className="text-[9px] font-black text-[#ff3f6c] uppercase tracking-wide">Enter Circle →</span>
      </div>
    </Link>
  );
}