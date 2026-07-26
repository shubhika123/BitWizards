"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import PinCard from "../../../components/OutfitCircle/PinCard";
import { addMemberByPhone, getBoard, updatePinCanvas } from "../../../lib/OutfitCircleApi";
import { Clock3, MapPin, Plus, ShieldCheck, Sparkles, UserPlus, Users } from "lucide-react";

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = Number(params.boardId);
  const [data, setData] = useState<any>(null);
  const [invitePhone, setInvitePhone] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"board" | "members" | "canvas">("board");

  // Canvas Co-Styling state variables
  const [selectedPinId, setSelectedPinId] = useState<number | null>(null);
  const [pinsState, setPinsState] = useState<any[]>([]);

  const load = async () => {
    const boardData = await getBoard(boardId);
    setData(boardData);
    if (boardData?.pins) {
      setPinsState(boardData.pins);
    }
  };

  useEffect(() => {
    void load();
  }, [boardId]);

  const handleUpdatePinPosition = (pinId: number, field: string, amount: number) => {
    setPinsState((prev) =>
      prev.map((p) => {
        if (p.pin_id === pinId) {
          const val = (p[field] || (field === "canvas_scale" ? 1.0 : 0)) + amount;
          return { ...p, [field]: val };
        }
        return p;
      })
    );
  };

  const handleSaveLayout = async (pin: any) => {
    try {
      await updatePinCanvas(pin.pin_id, {
        canvas_x: pin.canvas_x || 120,
        canvas_y: pin.canvas_y || 150,
        canvas_scale: pin.canvas_scale || 1.0,
      });
      alert("Style layout synced to circle members!");
      await load();
    } catch (e) {
      console.error(e);
      alert("Failed to save layout.");
    }
  };

  const members = useMemo(() => (Array.isArray(data?.members) ? data.members : []), [data]);
  const pins = useMemo(() => (Array.isArray(data?.pins) ? data.pins : []), [data]);
  const currentUserId = data?.board?.created_by ?? 1;

  const handleAddMember = async () => {
    const phone = invitePhone.replace(/\D/g, "");
    if (phone.length !== 10) {
      setInviteMessage("Enter a valid 10-digit phone number to invite.");
      return;
    }

    setAddingMember(true);
    setInviteMessage(null);

    try {
      await addMemberByPhone(boardId, phone);
      setInvitePhone("");
      await load();
      setInviteMessage(`Invite sent to +91 ${phone}. They can accept it to join the board.`);
    } catch (error) {
      console.error(error);
      setInviteMessage(error instanceof Error ? error.message : "Unable to send this invite right now.");
    } finally {
      setAddingMember(false);
    }
  };

  if (!data) return null;

  const getInitials = (name?: string, phone?: string) => {
    const source = name || "G";
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
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab("board")}
              className={`rounded-full px-2 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                activeTab === "board" ? "bg-white text-[#ff3f6c] shadow-sm" : "text-gray-500"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab("canvas")}
              className={`rounded-full px-2 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                activeTab === "canvas" ? "bg-white text-[#ff3f6c] shadow-sm" : "text-gray-500"
              }`}
            >
              AI Runway
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`rounded-full px-2 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                activeTab === "members" ? "bg-white text-[#ff3f6c] shadow-sm" : "text-gray-500"
              }`}
            >
              Members
            </button>
          </div>
        </div>

        {activeTab === "board" ? (
          <div className="space-y-4">
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
        ) : activeTab === "canvas" ? (
          <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#ff3f6c]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#282c3f]">AI Digital Runway</span>
            </div>
            <p className="text-[9.5px] text-gray-500 font-bold mb-4 leading-relaxed">
              Co-style outfits on your digital twins. Select a product below and use coordinates to align tops and palazzos.
            </p>

            {/* Virtual Runway Stage */}
            <div className="h-80 w-full bg-gradient-to-b from-[#fff5f6] to-[#fff1f3] rounded-3xl relative overflow-hidden border border-rose-100 shadow-inner flex justify-center items-end pb-8">
              {/* Grid Lines for scale */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffe4e6_1px,transparent_1px),linear-gradient(to_bottom,#ffe4e6_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

              {/* Digital Twin Avatars */}
              <div className="absolute bottom-6 flex justify-around w-full px-4 z-10 pointer-events-none">
                {members.slice(0, 3).map((m: any, idx: number) => (
                  <div key={m.user_id} className="flex flex-col items-center">
                    {/* Dummy Twin Mannequin */}
                    <div className="h-28 w-12 rounded-full border-2 border-[#ff3f6c]/30 bg-white/70 backdrop-blur-sm shadow flex items-center justify-center relative">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[8px] font-black text-[#ff3f6c]">
                        {getInitials(m.name, m.phone)}
                      </div>
                      <div className="absolute -bottom-1 bg-[#282c3f] text-white text-[7px] px-1 rounded font-black uppercase">
                        Twin {idx + 1}
                      </div>
                    </div>
                    <span className="text-[8.5px] font-black text-gray-500 mt-1.5 truncate max-w-[60px]">
                      +91 {m.phone || "..."}
                    </span>
                  </div>
                ))}
              </div>

              {/* Positioned Pins on Canvas */}
              {pinsState.map((pin: any) => {
                const x = pin.canvas_x || 120;
                const y = pin.canvas_y || 150;
                const scale = pin.canvas_scale || 1.0;
                const isSelected = selectedPinId === pin.pin_id;

                return (
                  <div
                    key={pin.pin_id}
                    onClick={() => setSelectedPinId(pin.pin_id)}
                    style={{
                      position: "absolute",
                      left: `${x}px`,
                      top: `${y}px`,
                      transform: `scale(${scale})`,
                      cursor: "pointer",
                      zIndex: isSelected ? 50 : 20,
                    }}
                    className={`transition-all duration-75 ${
                      isSelected
                        ? "ring-2 ring-[#ff3f6c] ring-offset-2 rounded-xl p-1 bg-white/50 shadow-lg"
                        : "hover:scale-[1.05]"
                    }`}
                  >
                    <img
                      src={pin.product_image_url}
                      alt={pin.product_name}
                      className="w-12 h-12 object-contain shrink-0"
                    />
                  </div>
                );
              })}
            </div>

            {/* Layout Adjuster Controls */}
            {selectedPinId && (
              <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                {(() => {
                  const selPin = pinsState.find((p) => p.pin_id === selectedPinId);
                  if (!selPin) return null;

                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-800 uppercase tracking-wide truncate max-w-[150px]">
                          Styling: {selPin.product_name}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveLayout(selPin)}
                            className="bg-[#047857] text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full hover:bg-emerald-700 transition"
                          >
                            Save Layout
                          </button>
                          <button
                            onClick={() => setSelectedPinId(null)}
                            className="bg-gray-400 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-full hover:bg-gray-500 transition"
                          >
                            Deselect
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Position Move</span>
                          <div className="grid grid-cols-3 gap-1.5 w-24">
                            <div />
                            <button
                              onClick={() => handleUpdatePinPosition(selectedPinId, "canvas_y", -10)}
                              className="bg-white border rounded text-[10px] font-black hover:bg-gray-100 h-6 flex items-center justify-center"
                            >
                              ▲
                            </button>
                            <div />
                            <button
                              onClick={() => handleUpdatePinPosition(selectedPinId, "canvas_x", -10)}
                              className="bg-white border rounded text-[10px] font-black hover:bg-gray-100 h-6 flex items-center justify-center"
                            >
                              ◀
                            </button>
                            <div className="h-6" />
                            <button
                              onClick={() => handleUpdatePinPosition(selectedPinId, "canvas_x", 10)}
                              className="bg-white border rounded text-[10px] font-black hover:bg-gray-100 h-6 flex items-center justify-center"
                            >
                              ▶
                            </button>
                            <div />
                            <button
                              onClick={() => handleUpdatePinPosition(selectedPinId, "canvas_y", 10)}
                              className="bg-white border rounded text-[10px] font-black hover:bg-gray-100 h-6 flex items-center justify-center"
                            >
                              ▼
                            </button>
                            <div />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Resize Scaling</span>
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleUpdatePinPosition(selectedPinId, "canvas_scale", -0.1)}
                              className="bg-white border px-3 py-1 text-[11px] font-black rounded hover:bg-gray-100 transition"
                            >
                              Smaller -
                            </button>
                            <span className="text-[9px] font-black text-gray-700">
                              {(selPin.canvas_scale || 1.0).toFixed(1)}x
                            </span>
                            <button
                              onClick={() => handleUpdatePinPosition(selectedPinId, "canvas_scale", 0.1)}
                              className="bg-white border px-3 py-1 text-[11px] font-black rounded hover:bg-gray-100 transition"
                            >
                              Larger +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#ff3f6c]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#282c3f]">Manage Members</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 rounded-full border border-gray-200 bg-[#fafafa] px-3 py-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff3f6c]" />
                <input
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
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
        )}
      </div>
    </div>
  );
}