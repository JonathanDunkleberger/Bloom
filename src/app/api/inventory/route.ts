import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** GET /api/inventory — fetch all owned items for current user */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_inventory")
    .select("item_id")
    .eq("user_id", userId)
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Return as simple string array for client convenience
  return NextResponse.json((data ?? []).map((r: { item_id: string }) => r.item_id));
}

/**
 * POST /api/inventory — add an item to user's inventory
 * Body: { itemId: string }
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId || itemId.length > 100) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("user_inventory")
    .upsert(
      { user_id: userId, item_id: itemId },
      { onConflict: "user_id,item_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/**
 * DELETE /api/inventory — remove an item from user's inventory
 * Body: { itemId: string }
 */
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
  if (!itemId) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("user_inventory")
    .delete()
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
