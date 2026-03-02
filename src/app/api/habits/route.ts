import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { NextResponse } from "next/server";
import { FREE_HABIT_LIMIT } from "@/lib/constants";
import { rollDragonSpecies } from "@/lib/sprites";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();

  const profile = await ensureProfile(supabase, userId);
  const isPro = profile?.tier === "pro";

  if (!isPro) {
    const { count } = await supabase
      .from("habits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_archived", false);
    if ((count || 0) >= FREE_HABIT_LIMIT)
      return NextResponse.json(
        { error: `Free plan limited to ${FREE_HABIT_LIMIT} habits. Upgrade to Tend+!` },
        { status: 403 }
      );
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Habit name is required (max 100 characters)." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: userId,
      name,
      color: body.color || "#6366f1",
      icon_name: body.icon_name || "Target",
      category: body.category || "general",
      creature_type: (typeof body.creature_type === "number" && body.creature_type >= 1 && body.creature_type <= 36)
        ? body.creature_type
        : rollDragonSpecies(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
