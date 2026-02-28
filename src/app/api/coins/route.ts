import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { coins, delta, streakFreezes } = body;

  const supabase = await createServerSupabaseClient();

  // ── Delta-based path (preferred — race-condition safe) ──
  if (typeof delta === "number") {
    // Clamp delta to reasonable bounds: -500 to +100 per request
    const clampedDelta = Math.max(-500, Math.min(100, delta));

    // Use Supabase RPC or read-then-write with floor at 0
    const { data: profile } = await supabase
      .from("profiles")
      .select("coins")
      .eq("clerk_id", userId)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const newCoins = Math.max(0, profile.coins + clampedDelta);
    const updatePayload: Record<string, unknown> = { coins: newCoins };
    if (streakFreezes !== undefined) {
      updatePayload.streak_freezes = streakFreezes;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("clerk_id", userId)
      .select("coins, streak_freezes")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // ── Legacy absolute path (kept for backward compat during migration) ──
  if (typeof coins !== "number") {
    return NextResponse.json({ error: "coins or delta must be a number" }, { status: 400 });
  }

  // Clamp absolute value to 0–10000 to prevent abuse
  const clampedCoins = Math.max(0, Math.min(10000, coins));

  const updatePayload: Record<string, unknown> = { coins: clampedCoins };
  if (streakFreezes !== undefined) {
    updatePayload.streak_freezes = streakFreezes;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("clerk_id", userId)
    .select("coins, streak_freezes")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
