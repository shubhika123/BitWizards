"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import PinCard from "../../../components/OutfitCircle/PinCard";
import { addMemberByUsername, getBoard } from "../../../lib/OutfitCircleApi";
import { CheckCircle2, Clock3, LayoutGrid, MapPin, Plus, ShieldCheck, Sparkles, UserPlus, Users } from "lucide-react";

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = Number(params.boardId);
  const [data, setData] = useState<any>(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"board" | "members">("board");

  const load = async () => {
    const boardData = await getBoard(boardId);
    setData(boardData);
  };

  useEffect(() => {
    void load();
  }, [boardId]);

  const members = useMemo(() => (Array.isArray(data?.members) ? data.members : []), [data]);
  const pins = useMemo(() => (Array.isArray(data?.pins) ? data.pins : []), [data]);
  const currentUserId = data?.board?.created_by ?? 1;

  const handleAddMember = async () => {
    const username = inviteUsername.trim();
    if (!username) {
      setInviteMessage("Enter a Myntra username to invite.");
      return;
    }

    setAddingMember(true);
    setInviteMessage(null);

    try {
      await addMemberByUsername(boardId, username);
      setInviteUsername("");
      await load();
      setInviteMessage(`Invite sent to @${username}. They can accept it to join the board.`);
    } catch (error) {
      console.error(error);
      setInviteMessage(error instanceof Error ? error.message : "Unable to send this invite right now.");
    } finally {
      setAddingMember(false);
    }
  };

  if (!data) return null;

  const getInitials = (name?: string, username?: string) => {
    const source = name || username || "U";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";
  };

  return (
    <div className="bg-[#fffafc] min-h-screen">
      <Header />
      <div className="px-3.5 py-4">
        <div className="rounded-[26px] border border-rose-100 bg-white p-4 shadow-sm mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-black tracking-[0.28em] uppercase text-[#ff3f6c]">Outfit Circle</span>
              <h2 className="text-lg font-black text-[#282c3f] mt-1">{data.board.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#fff1f3] text-[#ff3f6c] px-2.5 py-1 text-[10px] font-bold">{members.length} members</span>
                <span className="rounded-full bg-[#f6f7f9] text-gray-700 px-2.5 py-1 text-[10px] font-bold">{pins.length} pinned items</span>
              </div>
            </div>
            <div className="rounded-full bg-[#fff5da] text-[#b45309] px-3 py-1 text-[10px] font-black uppercase tracking-wide">
              Myntra Classic
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-full bg-[#f5f5f6] p-1 border border-rose-100">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("board")}
              className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === "board"
                  ? "bg-white text-[#ff3f6c] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === "members"
                  ? "bg-white text-[#ff3f6c] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Members
            </button>
          </div>
        </div>

        {activeTab === "board" ? (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-[#ff3f6c]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Board Showcase</span>
              </div>

              <div className="rounded-[20px] bg-gradient-to-r from-[#fff5f6] to-[#fffaf2] border border-amber-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff3f6c]">Classic Edit</div>
                    <div className="text-sm font-black text-[#282c3f] mt-1">Curate your outfit story</div>
                  </div>
                  <div className="rounded-full bg-[#ff3f6c] text-white px-3 py-1 text-[10px] font-black">{pins.length} saved</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">Pinned Items</span>
                <button className="flex items-center gap-1 bg-[#ff3f6c] text-white text-[10px] font-black px-3 py-1.5 rounded-full">
                  <Plus className="w-3.5 h-3.5" /> Pin Item
                </button>
              </div>

              {pins.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-rose-200 bg-[#fff9fb] p-6 text-center">
                  <div className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">Board is empty</div>
                  <div className="text-[10px] text-gray-500 mt-1">Pin your first product to start curating the board.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pins.map((pin: any) => (
                    <PinCard key={pin.pin_id} pin={pin} userId={currentUserId} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "members" ? (
          <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#ff3f6c]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Manage Members</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 rounded-full border border-gray-200 bg-[#fafafa] px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff3f6c]" />
                <input
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="Invite another Myntra user by username"
                  className="w-full bg-transparent outline-none text-[11px] text-gray-700 placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleAddMember}
                disabled={addingMember}
                className="rounded-full bg-[#ff3f6c] px-4 py-2 text-[10px] font-black uppercase tracking-wide text-white disabled:opacity-60"
              >
                <span className="flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  {addingMember ? "Sending..." : "Send Invite"}
                </span>
              </button>
            </div>

            {inviteMessage && (
              <div className="mt-3 rounded-xl bg-[#f9fafb] border border-rose-100 px-3 py-2 text-[11px] text-gray-700">
                {inviteMessage}
              </div>
            )}

            <div className="mt-4 grid gap-2">
              {members.map((member: any) => {
                const isPending = member.invite_status === "pending";
                const isAdmin = member.role === "admin";

                return (
                  <div
                    key={`${member.user_id}-${member.role}-${member.invite_status}`}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-[#fbfbfc] px-3 py-2.5 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff3f6c] to-[#f59e0b] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                        {getInitials(member.name, member.username)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black text-[#282c3f] truncate">{member.name || member.username}</div>
                        <div className="text-[10px] text-gray-500 truncate">@{member.username}</div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin className="w-3 h-3 text-[#ff3f6c]" />
                          <span>{member.city || "City not set"}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${isAdmin ? "bg-[#fff1f3] text-[#ff3f6c]" : "bg-[#f6f7f9] text-gray-700"}`}>
                            {isAdmin ? "Board owner" : member.role}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${isPending ? "bg-[#fff8e6] text-[#b45309]" : "bg-[#ecfdf5] text-[#047857]"}`}>
                            {isPending ? "Pending invite" : "Accepted"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPending ? <Clock3 className="w-3.5 h-3.5 text-amber-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}