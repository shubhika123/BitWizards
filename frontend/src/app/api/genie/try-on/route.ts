import { NextRequest, NextResponse } from "next/server";

// Increase timeout to 3 minutes to allow the full Pruna pipeline
// (person upload + garment uploads + Try-Sync prediction) to complete
export const maxDuration = 180;

export async function POST(req: NextRequest) {
  console.log("[API Route] POST /api/genie/try-on - received request");

  let body: unknown;
  try {
    body = await req.json();
    console.log("[API Route] Parsed request body successfully");
  } catch (e) {
    console.error("[API Route] Failed to parse request body:", e);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const backendUrl = "http://127.0.0.1:8000/api/genie/try-on";
  console.log(`[API Route] Forwarding to FastAPI backend: ${backendUrl}`);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // node-fetch / undici signal for long timeout
      signal: AbortSignal.timeout(170_000), // 170 seconds
    });
  } catch (e) {
    console.error("[API Route] Failed to reach FastAPI backend:", e);
    return NextResponse.json(
      { error: `Backend unreachable: ${String(e)}` },
      { status: 502 }
    );
  }

  console.log(`[API Route] FastAPI responded with status: ${backendResponse.status}`);

  const responseText = await backendResponse.text();
  console.log(`[API Route] FastAPI raw response body: ${responseText.slice(0, 500)}`);

  if (!backendResponse.ok) {
    console.error(`[API Route] FastAPI returned error ${backendResponse.status}: ${responseText}`);
    return NextResponse.json(
      { error: responseText },
      { status: backendResponse.status }
    );
  }

  let responseJson: unknown;
  try {
    responseJson = JSON.parse(responseText);
    console.log("[API Route] Parsed FastAPI JSON response:", responseJson);
  } catch (e) {
    console.error("[API Route] FastAPI returned non-JSON body:", responseText);
    return NextResponse.json(
      { error: "Backend returned invalid JSON" },
      { status: 502 }
    );
  }

  console.log("[API Route] ✅ Sending success response to frontend");
  return NextResponse.json(responseJson, { status: 200 });
}
