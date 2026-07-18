"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import BoardCard from "../../components/OutfitCircle/BoardCard";
import CreateBoardModal from "../../components/OutfitCircle/CreateBoard";
import { acceptBoardInvite, getBoard, getUserBoards } from "../../lib/OutfitCircleApi";
import { CheckCircle2, Mail, MapPin, Plus, Sparkles } from "lucide-react";

const CURRENT_USER_ID = 1; // replace with real auth context
const SESSION_USERNAME_KEY = "outfit_circle_active_username";

export default function OutfitCirclePage() {
  const [boards, setBoards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sessionUsername, setSessionUsername] = useState("testuser");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const [invitationItems, setInvitationItems] = useState<any[]>([]);

  const loadBoards = async () => {
    const data = await getUserBoards(CURRENT_USER_ID);
    setBoards(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const storedUsername = window.localStorage.getItem(SESSION_USERNAME_KEY);
    if (storedUsername) {
      setSessionUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    void loadBoards();
  }, []);

  useEffect(() => {
    if (!boards.length) {
      setInvitationItems([]);
      return;
    }

    let cancelled = false;

    const loadInvitations = async () => {
      const invitationResults = await Promise.all(
        boards.map(async (board) => {
          const boardData = await getBoard(board.board_id);
          const pendingMembers = (Array.isArray(boardData?.members) ? boardData.members : []).filter(
            (member: any) => member.invite_status === "pending" && member.username === sessionUsername,
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
  }, [boards, sessionUsername]);

  const invitationCount = useMemo(() => invitationItems.length, [invitationItems]);

  const handleSessionUsernameSave = () => {
    const nextUsername = sessionUsername.trim();
    if (!nextUsername) {
      setInviteMessage("Enter a username to use as the active Circle session.");
      return;
    }

    window.localStorage.setItem(SESSION_USERNAME_KEY, nextUsername);
    setInviteMessage(`Active Circle session switched to @${nextUsername}.`);
  };

  const handleAcceptInvite = async (boardId: number, userId: number, username: string) => {
    setAcceptingInvite(true);
    setInviteMessage(null);

    try {
      await acceptBoardInvite(boardId, userId, username);
      setInviteMessage("Invite accepted. This member is now part of the board.");
      await loadBoards();
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
            className="flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full"
          >
            <Plus className="w-3.5 h-3.5" /> New Board
          </button>
        </div>

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
              <div className="text-[10px] text-gray-500 mt-1">Switch the session username and this area will show invites for that user.</div>
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
                      onClick={() => handleAcceptInvite(item.boardId, item.user_id, sessionUsername)}
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