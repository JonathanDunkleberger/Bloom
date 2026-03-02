import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { NextResponse } from "next/server";

/**
 * GET /api/pro-status
 * Returns whether the current user has an active Tend+ (pro) subscription.
 * Used to verify webhook has landed after Stripe checkout redirect.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ isPro: false });

  const supabase = await createServerSupabaseClient();
  const profile = await ensureProfile(supabase, userId);

  return NextResponse.json({ isPro: profile?.tier === "pro" });
}
