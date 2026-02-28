import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** GET /api/urge-entries — fetch all urge entries for current user */
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();

  const url = new URL(req.url);
  const habitId = url.searchParams.get("habit_id");
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  let query = supabase
    .from("urge_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (habitId) {
    query = query.eq("habit_id", habitId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

/** POST /api/urge-entries — log a new urge entry */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();

  const body = await req.json();
  const { habit_id, method, tags, note } = body;

  if (!habit_id || !method) {
    return NextResponse.json({ error: "habit_id and method are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("urge_entries")
    .insert({
      user_id: userId,
      habit_id,
      method,
      tags: tags || [],
      note: note || "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
