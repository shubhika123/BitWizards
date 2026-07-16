"use client";
import { useEffect, useState } from "react";
import { getPollForPin, castVote, createPoll } from "../../lib/OutfitCircleApi";

export default function PollWidget({ pinId, userId }: { pinId: number; userId: number }) {
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPoll = async () => {
    const data = await getPollForPin(pinId);
    setPoll(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPoll();
  }, [pinId]);

  const handleStartPoll = async () => {
    await createPoll({ pin_id: pinId, created_by: userId, question: "Should we get this?", options: ["Yes", "No"] });
    loadPoll();
  };

  const handleVote = async (optionId: number) => {
    await castVote(poll.poll.poll_id, optionId, userId);
    loadPoll();
  };

  if (loading) return null;

  if (!poll) {
    return (
      <button
        onClick={handleStartPoll}
        className="text-[9px] font-black text-[#ff3f6c] border border-[#ff3f6c] rounded-full px-2.5 py-1 mt-2"
      >
        Start Poll
      </button>
    );
  }

  const totalVotes = poll.options.reduce((sum: number, o: any) => sum + o.votes, 0);

  return (
    <div className="mt-2 space-y-1.5">
      <span className="text-[9px] font-black text-gray-600">{poll.poll.question}</span>
      {poll.options.map((opt: any) => {
        const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
        return (
          <button
            key={opt.option_id}
            onClick={() => handleVote(opt.option_id)}
            className="w-full relative bg-gray-100 rounded-lg overflow-hidden text-left"
          >
            <div
              className="absolute inset-y-0 left-0 bg-[#ffe0e9]"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex justify-between px-2 py-1">
              <span className="text-[9px] font-bold text-gray-700">{opt.label}</span>
              <span className="text-[9px] font-black text-gray-500">{pct}%</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}