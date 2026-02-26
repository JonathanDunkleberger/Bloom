import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { coins, streakFreezes } = body;

  if (typeof coins !== "number") {
    return NextResponse.json({ error: "coins must be a number" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Build update payload — always update coins, optionally update streak_freezes
  const updatePayload: Record<string, unknown> = { coins };
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
