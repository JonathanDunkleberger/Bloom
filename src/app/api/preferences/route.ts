import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** GET /api/preferences — fetch user preferences (or defaults) */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Return defaults — row may not exist yet
    return NextResponse.json({
      dark_mode: false,
      season: "summer",
      earned_milestone_coins: {},
      stage_drops: {},
    });
  }
  return NextResponse.json(data);
}

/**
 * PUT /api/preferences — upsert user preferences
 * Body: partial { dark_mode, season, earned_milestone_coins, stage_drops }
 */
export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Build update payload from allowed fields
  const allowed: Record<string, unknown> = {};
  if (typeof body.dark_mode === "boolean") allowed.dark_mode = body.dark_mode;
  if (typeof body.season === "string") allowed.season = body.season;
  if (body.earned_milestone_coins && typeof body.earned_milestone_coins === "object") {
    allowed.earned_milestone_coins = body.earned_milestone_coins;
  }
  if (body.stage_drops && typeof body.stage_drops === "object") {
    allowed.stage_drops = body.stage_drops;
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, ...allowed },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
