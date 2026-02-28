import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { MILESTONES } from "@/lib/constants";

const MILESTONE_DAYS: number[] = MILESTONES.map((m) => m.days);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createServerSupabaseClient();

  // Verify habit belongs to user
  const { data: habit } = await supabase.from("habits").select("id").eq("id", id).eq("user_id", userId).single();
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Accept client's local date to avoid timezone mismatch (fallback to UTC)
  let today: string;
  try {
    const body = await req.json();
    // Validate date format YYYY-MM-DD
    if (body?.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      today = body.date;
    } else {
      today = new Date().toISOString().split("T")[0];
    }
  } catch {
    today = new Date().toISOString().split("T")[0];
  }

  // Check if already logged today
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", id)
    .eq("log_date", today)
    .maybeSingle();

  if (existing) {
    // Remove the log (un-check)
    await supabase.from("habit_logs").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  }

  // Insert new log
  const { data: log, error } = await supabase
    .from("habit_logs")
    .insert({ habit_id: id, log_date: today })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check for milestones
  const { count } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("habit_id", id);

  const totalDays = count ?? 0;
  let milestone = null;

  if (MILESTONE_DAYS.includes(totalDays)) {
    // Check if this milestone already exists
    const { data: existingMilestone } = await supabase
      .from("milestones")
      .select("id")
      .eq("habit_id", id)
      .eq("milestone_type", "streak")
      .eq("value", totalDays)
      .maybeSingle();

    if (!existingMilestone) {
      const { data: m } = await supabase
        .from("milestones")
        .insert({
          habit_id: id,
          milestone_type: "streak",
          value: totalDays,
        })
        .select()
        .single();
      milestone = m;
    }
  }

  return NextResponse.json({ action: "logged", log, milestone });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { milestone_id } = body;

  if (!milestone_id) {
    return NextResponse.json({ error: "milestone_id required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Verify habit belongs to user
  const { data: habit } = await supabase.from("habits").select("id").eq("id", id).eq("user_id", userId).single();
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("milestones")
    .update({ seen: true })
    .eq("id", milestone_id)
    .eq("habit_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
