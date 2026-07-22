// lib/OutfitCircleApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://bitwizards.onrender.com";const BASE = `${API_BASE}/outfit-circle`;
export interface PinnedProduct {
  pin_id: number;
  board_id: number;
  pinned_by: number;
  pinned_by_name?: string;
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_price?: number;
  product_url?: string;
  purchases?: PinPurchase[];

  // Reimagined Sizing/Fit/Voice Reviews
  fit_video_url?: string;
  fit_review_text?: string;
  fit_height?: number;
  fit_weight?: number;
  fit_size_purchased?: string;
  fit_audio_review_url?: string;
  fit_feedback_badges?: string;

  // Local Bazaar/Group-buy
  group_buy_eligible?: boolean;
  group_buy_discount_rate?: number;
  min_orders_required?: number;
  is_local_bazaar_item?: boolean;
  bazaar_shop_name?: string;

  // AI Canvas positions
  canvas_x?: number;
  canvas_y?: number;
  canvas_scale?: number;
  canvas_z_index?: number;
}
async function handle(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function getUserByUsername(username: string) {
  const res = await fetch(`${BASE}/users/by-username/${encodeURIComponent(username)}`);
  if (res.status === 404) return null;
  return handle(res);
}

export async function getUserBoards(userId: number) {
  const res = await fetch(`${BASE}/users/${userId}/boards`);
  return handle(res);
}

export async function getBoard(boardId: number) {
  const res = await fetch(`${BASE}/boards/${boardId}`);
  return handle(res);
}

export async function createBoard(
  name: string,
  createdBy: number,
  memberIds: number[] = [],
  circleType: string = "classic",
  city: string | null = null,
  description: string | null = null,
  creatorAvatarUrl: string | null = null
) {
  const res = await fetch(`${BASE}/boards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      created_by: createdBy,
      member_ids: memberIds,
      circle_type: circleType,
      city,
      description,
      creator_avatar_url: creatorAvatarUrl,
    }),
  });
  return handle(res);
}

export async function addMemberByUsername(boardId: number, username: string) {
  const res = await fetch(`${BASE}/boards/${boardId}/members/by-username/${encodeURIComponent(username)}`, {
    method: "POST",
  });
  return handle(res);
}

export async function acceptBoardInvite(boardId: number, userId: number, username: string) {
  const res = await fetch(`${BASE}/boards/${boardId}/members/${userId}/accept`, {
    method: "POST",
    headers: { "X-User-Username": username },
  });
  return handle(res);
}

export async function pinProduct(payload: {
  board_id: number;
  pinned_by: number;
  product_id: string;
  product_name: string;
  product_image_url: string;
  product_price?: number;
  product_url?: string;

  // Reimagined parameters
  fit_video_url?: string;
  fit_review_text?: string;
  fit_height?: number;
  fit_weight?: number;
  fit_size_purchased?: string;
  fit_audio_review_url?: string;
  fit_feedback_badges?: string;
  group_buy_eligible?: boolean;
  group_buy_discount_rate?: number;
  min_orders_required?: number;
  is_local_bazaar_item?: boolean;
  bazaar_shop_name?: string;
  canvas_x?: number;
  canvas_y?: number;
  canvas_scale?: number;
  canvas_z_index?: number;
}) {
  const res = await fetch(`${BASE}/pins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function getBoardPins(boardId: number) {
  const res = await fetch(`${BASE}/boards/${boardId}/pins`);
  return handle(res);
}

export async function unpinProduct(pinId: number) {
  const res = await fetch(`${BASE}/pins/${pinId}`, { method: "DELETE" });
  return handle(res);
}

export async function createPoll(payload: {
  pin_id: number;
  created_by: number;
  question?: string;
  options?: string[];
  closes_at?: string;
}) {
  const res = await fetch(`${BASE}/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function getPollForPin(pinId: number) {
  const res = await fetch(`${BASE}/pins/${pinId}/poll`);
  if (res.status === 404) return null;
  return handle(res);
}

export async function castVote(pollId: number, optionId: number, userId: number) {
  const res = await fetch(`${BASE}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poll_id: pollId, option_id: optionId, user_id: userId }),
  });
  return handle(res);
}
export async function purchaseProduct(pinId: number, userId: number) {
  const res = await fetch(`${BASE}/pins/${pinId}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  return handle(res);
}

export interface PinPurchase {
  user_id: number;
  user_name?: string;
}

export async function getGullyBoards(city?: string) {
  const url = city ? `${BASE}/boards/gully?city=${encodeURIComponent(city)}` : `${BASE}/boards/gully`;
  const res = await fetch(url);
  return handle(res);
}

export async function updatePinCanvas(
  pinId: number,
  canvas: { canvas_x?: number; canvas_y?: number; canvas_scale?: number; canvas_z_index?: number }
) {
  const res = await fetch(`${BASE}/pins/${pinId}/canvas`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(canvas),
  });
  return handle(res);
}

export async function submitContestGuess(payload: {
  user_id: number;
  product_name: string;
  category: string;
  guessed_price: number;
  actual_price: number;
  coins_won: number;
  result_msg: string;
}) {
  const res = await fetch(`/api/contest/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function getContestHistory(userId: number) {
  const res = await fetch(`/api/contest/history?user_id=${userId}`);
  return handle(res);
}

export async function getContestStatus(userId: number) {
  const res = await fetch(`/api/contest/status?user_id=${userId}`);
  return handle(res);
}