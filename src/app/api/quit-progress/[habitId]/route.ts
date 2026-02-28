import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * PUT /api/quit-progress/[habitId] — upsert quit progress for a habit
 * Body: { quitDate, dailyCost, reason, urges, bestStreak }
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const { habitId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { quitDate, dailyCost, reason, urges, bestStreak } = body;

  // Basic validation
  if (typeof quitDate !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(quitDate)) {
    return NextResponse.json({ error: "quitDate must be a valid date string" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Verify the habit belongs to the user
  const { data: habit, error: habitErr } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (habitErr || !habit) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("quit_progress")
    .upsert(
      {
        user_id: userId,
        habit_id: habitId,
        quit_date: quitDate,
        daily_cost: typeof dailyCost === "number" ? dailyCost : 0,
        reason: typeof reason === "string" ? reason : "",
        urges: Array.isArray(urges) ? urges : [],
        best_streak: typeof bestStreak === "number" ? bestStreak : 0,
      },
      { onConflict: "user_id,habit_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * DELETE /api/quit-progress/[habitId] — delete quit progress for a habit
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ habitId: string }> }
) {
  const { habitId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("quit_progress")
    .delete()
    .eq("user_id", userId)
    .eq("habit_id", habitId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
