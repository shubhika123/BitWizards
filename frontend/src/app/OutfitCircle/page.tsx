"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import BoardCard from "../../components/OutfitCircle/BoardCard";
import CreateBoardModal from "../../components/OutfitCircle/CreateBoard";
import { acceptBoardInvite, getBoard, getUserBoards, getGullyBoards } from "../../lib/OutfitCircleApi";
import { useAuthStore } from "../../store/authStore";
import { Mail, MapPin, Plus, Sparkles, Users } from "lucide-react";

export default function OutfitCirclePage() {
  const { user } = useAuthStore();
  const [boards, setBoards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const [invitationItems, setInvitationItems] = useState<any[]>([]);

  const currentUserId = user?.user_id ?? null;
  const currentUsername = user?.username ?? "";
  const [gullyBoards, setGullyBoards] = useState<any[]>([]);

  const loadBoards = async (userId: number) => {
    const data = await getUserBoards(userId);
    setBoards(Array.isArray(data) ? data : []);
  };

  const loadGullyBoards = async () => {
    try {
      const data = await getGullyBoards();
      setGullyBoards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUserId != null) {
      void loadBoards(currentUserId);
    } else {
      setBoards([]);
    }
    void loadGullyBoards();
  }, [currentUserId]);

  useEffect(() => {
    if (!boards.length || !currentUsername) {
      setInvitationItems([]);
      return;
    }

    let cancelled = false;

    const loadInvitations = async () => {
      const invitationResults = await Promise.all(
        boards.map(async (board) => {
          const boardData = await getBoard(board.board_id);
          const pendingMembers = (Array.isArray(boardData?.members) ? boardData.members : []).filter(
            (member: any) => member.invite_status === "pending" && member.username === currentUsername,
          );

          return pendingMembers.map((member: any) => ({
            ...member,
            boardId: board.board_id,
            boardName: boardData?.board?.name ?? `Board ${board.board_id}`,
          }));
        }),
      );

      if (!cancelled) {
        setInvitationItems(invitationResults.flat());
      }
    };

    void loadInvitations();

    return () => {
      cancelled = true;
    };
  }, [boards, currentUsername]);

  const invitationCount = useMemo(() => invitationItems.length, [invitationItems]);

  const handleAcceptInvite = async (boardId: number, userId: number, username: string) => {
    setAcceptingInvite(true);
    setInviteMessage(null);

    try {
      await acceptBoardInvite(boardId, userId, username);
      setInviteMessage("Invite accepted. This member is now part of the board.");
      if (currentUserId != null) await loadBoards(currentUserId);
    } catch (error) {
      console.error(error);
      setInviteMessage(error instanceof Error ? error.message : "Unable to accept this invite right now.");
    } finally {
      setAcceptingInvite(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-[#282c3f] uppercase tracking-wide">Outfit Circle</h2>
          <button
            onClick={() => setShowModal(true)}
            disabled={currentUserId == null}
            className="flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> New Board
          </button>
        </div>

        {currentUserId == null && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
            You need to be logged in to see your boards and invitations.
          </div>
        )}

        <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-[#ff3f6c]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Invitations</span>
          </div>

          {inviteMessage && (
            <div className="mb-3 rounded-xl bg-[#f9fafb] border border-rose-100 px-3 py-2 text-[11px] text-gray-700">
              {inviteMessage}
            </div>
          )}

          {invitationCount === 0 ? (
            <div className="rounded-[20px] border border-dashed border-rose-200 bg-[#fff9fb] p-6 text-center">
              <div className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">No active invitations</div>
              <div className="text-[10px] text-gray-500 mt-1">Invites sent to @{currentUsername || "your username"} will show up here.</div>
            </div>
          ) : (
            <div className="grid gap-2">
              {invitationItems.map((item: any) => (
                <div
                  key={`${item.boardId}-${item.user_id}-${item.username}`}
                  className="rounded-2xl border border-gray-200 bg-[#fbfbfc] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-black text-[#282c3f] truncate">{item.boardName}</div>
                      <div className="text-[10px] text-gray-500 truncate">@{item.username}</div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                        <MapPin className="w-3 h-3 text-[#ff3f6c]" />
                        <span>{item.city || "City not set"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptInvite(item.boardId, item.user_id, currentUsername)}
                      disabled={acceptingInvite}
                      className="rounded-full bg-[#ff3f6c] px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-white disabled:opacity-60"
                    >
                      {acceptingInvite ? "Accepting..." : "Accept Invite"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Gully & Community Circles (Local Discovery Layer) */}
        <div className="rounded-[24px] border border-emerald-100 bg-[#f4fbf7] p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800 block">Nearby Gully Circles</span>
              <span className="text-[8px] font-bold text-emerald-600 block">Style hubs in Patna, Coimbatore, Vizag, & Belgaum</span>
            </div>
          </div>

          {gullyBoards.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-emerald-200 bg-white p-6 text-center">
              <div className="text-[10px] text-gray-500 font-bold">No nearby circles found. Create one to start!</div>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {gullyBoards.map((gb) => (
                <div key={gb.board_id} className="bg-white border border-emerald-50 rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-gray-800">{gb.name}</span>
                    <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {gb.circle_type === "gully" ? "📍 Gully" : gb.circle_type === "college" ? "🎓 College" : "✨ Creator"}
                    </span>
                  </div>
                  {gb.description && <p className="text-[9.5px] text-gray-500 font-semibold leading-relaxed">{gb.description}</p>}
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold border-t border-dashed border-gray-100 pt-2 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-500" /> {gb.members_count || 1} members • {gb.pins_count || 0} pins
                    </span>
                    <Link href={`/OutfitCircle/${gb.board_id}`} className="text-emerald-700 font-black uppercase tracking-wider hover:underline">
                      Join & Style →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-2.5 mt-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">My Boards & Subscriptions</span>
        </div>

        <div className="space-y-2.5">
          {boards.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-rose-200 bg-[#fffcfd] p-6 text-center text-[10px] font-bold text-gray-500">
              No boards created yet. Create a classic board or a gully circle above!
            </div>
          ) : (
            boards.map((b) => (
              <BoardCard key={b.board_id} board={b} />
            ))
          )}
        </div>
      </div>

      {showModal && currentUserId != null && (
        <CreateBoardModal
          userId={currentUserId}
          onClose={() => setShowModal(false)}
          onCreated={() => loadBoards(currentUserId)}
        />
      )}
    </div>
  );
}