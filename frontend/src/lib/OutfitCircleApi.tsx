const BASE_URL = "http://127.0.0.1:8000/outfit-circle";
// lib/OutfitCircleApi.ts (additions)

export interface Purchase {
  user_id: number;
  user_name: string;
  purchased_at: string;
}

export interface PinnedProduct {
  pin_id: number;
  board_id: number;
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_price?: number;
  product_url?: string;
  pinned_by: number;
  purchases: Purchase[];
}

export async function getBoardPins(boardId: number): Promise<PinnedProduct[]> {
  const res = await fetch(`${BASE_URL}/boards/${boardId}/pins`);
  return res.json();
}

export async function purchaseProduct(pinId: number, userId: number) {
  const res = await fetch(`${BASE_URL}/pins/${pinId}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json(); // returns updated pin with new purchases array
}
export async function getUserBoards(userId: number) {
  const res = await fetch(`${BASE_URL}/users/${userId}/boards`);
  return res.json();
}

export async function addMemberByUsername(boardId: number, username: string) {
  const res = await fetch(`${BASE_URL}/boards/${boardId}/members/by-username/${username}`, {
    method: "POST",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Invite failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function acceptBoardInvite(boardId: number, userId: number, username: string) {
  const res = await fetch(`${BASE_URL}/boards/${boardId}/members/${userId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Username": username,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Accept invite failed: ${res.status} ${errorText}`);
  }

  return res.json();
}
export async function createBoard(name: string, createdBy: number, memberIds: number[] = []) {
  const res = await fetch(`${BASE_URL}/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, created_by: createdBy, member_ids: memberIds }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Board creation failed: ${res.status} ${errorText}`);
  }

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