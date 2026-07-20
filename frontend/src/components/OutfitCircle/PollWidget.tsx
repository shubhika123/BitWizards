"use client";

import { useEffect, useState } from "react";
import { getPollForPin, castVote, createPoll } from "../../lib/OutfitCircleApi";

export default function PollWidget({
  pinId,
  userId,
}: {
  pinId: number;
  userId: number;
}) {
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["Yes", "No"]);

  const loadPoll = async () => {
    try {
      const data = await getPollForPin(pinId);
      setPoll(data);
    } catch {
      setPoll(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoll();
  }, [pinId]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreatePoll = async () => {
    if (!question.trim()) return alert("Enter a question");

    const validOptions = options.filter((o) => o.trim());

    if (validOptions.length < 2) {
      return alert("Minimum 2 options required");
    }

    await createPoll({
      pin_id: pinId,
      created_by: userId,
      question,
      options: validOptions,
    });

    setShowCreateModal(false);
    setQuestion("");
    setOptions(["Yes", "No"]);
    loadPoll();
  };

  const handleVote = async (optionId: number) => {
    await castVote(poll.poll.poll_id, optionId, userId);
    loadPoll();
  };

  if (loading) return null;

  return (
    <>
      {!poll ? (
        <>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-[10px] font-bold text-[#ff3f6c] border border-[#ff3f6c] rounded-full px-3 py-1 hover:bg-[#fff1f5] transition"
            >
              + Start Poll
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl w-[340px] p-5 shadow-xl">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Create Poll
                </h2>

                <label className="text-xs font-semibold text-gray-500">
                  Question
                </label>

                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Which outfit should I buy?"
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                />

                <label className="text-xs font-semibold text-gray-500">
                  Options
                </label>

                <div className="space-y-2 mt-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={option}
                        onChange={(e) =>
                          updateOption(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff3f6c]"
                      />

                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="text-red-500 text-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addOption}
                  className="mt-3 text-sm font-semibold text-[#ff3f6c]"
                >
                  + Add Option
                </button>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleCreatePoll}
                    className="px-5 py-2 rounded-lg bg-[#ff3f6c] text-white font-semibold"
                  >
                    Create Poll
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-3 rounded-xl bg-[#fff8fa] border border-pink-100 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-gray-800">
              🗳 {poll.poll.question}
            </h3>

            <span className="text-[9px] text-gray-500">
              {poll.options.reduce(
                (sum: number, o: any) => sum + o.votes,
                0
              )}{" "}
              votes
            </span>
          </div>

          {poll.options.map((opt: any) => {
            const totalVotes = poll.options.reduce(
              (sum: number, o: any) => sum + o.votes,
              0
            );

            const pct = totalVotes
              ? Math.round((opt.votes / totalVotes) * 100)
              : 0;

            return (
              <button
                key={opt.option_id}
                onClick={() => handleVote(opt.option_id)}
                className="relative w-full mb-2 overflow-hidden rounded-xl border border-pink-100 bg-white"
              >
                <div
                  className="absolute left-0 top-0 h-full bg-[#ffd6e2] transition-all"
                  style={{ width: `${pct}%` }}
                />

                <div className="relative flex justify-between items-center px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-700">
                    {opt.label}
                  </span>
                  
                  <span className="text-[10px] font-bold text-[#ff3f6c]">
                    {pct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}