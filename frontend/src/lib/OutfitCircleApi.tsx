const BASE_URL = "http://127.0.0.1:8000/outfit-circle";

export async function getUserBoards(userId: number) {
  const res = await fetch(`${BASE_URL}/users/${userId}/boards`);
  return res.json();
}
export async function addMemberByUsername(boardId: number, username: string) {
  const res = await fetch(`${BASE_URL}/boards/${boardId}/members/by-username/${username}`, {
    method: "POST",
  });
  return res.json();
}
export async function createBoard(name: string, createdBy: number, memberIds: number[] = []) {
  const res = await fetch(`${BASE_URL}/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, created_by: createdBy, member_ids: memberIds }),
  });
  return res.json();
}

export async function getBoard(boardId: number) {
  const res = await fetch(`${BASE_URL}/boards/${boardId}`);
  return res.json();
}

export async function pinProduct(payload: {
  board_id: number;
  pinned_by: number;
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_price?: number;
  product_url?: string;
}) {
  const res = await fetch(`${BASE_URL}/pins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function createPoll(payload: {
  pin_id: number;
  created_by: number;
  question?: string;
  options?: string[];
}) {
  const res = await fetch(`${BASE_URL}/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getPollForPin(pinId: number) {
  const res = await fetch(`${BASE_URL}/pins/${pinId}/poll`);
  if (res.status === 404) return null;
  return res.json();
}

export async function castVote(pollId: number, optionId: number, userId: number) {
  const res = await fetch(`${BASE_URL}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poll_id: pollId, option_id: optionId, user_id: userId }),
  });
  return res.json();
}