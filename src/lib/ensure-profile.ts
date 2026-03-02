import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures a profile row exists for the given Clerk user.
 * If no profile exists, creates one with sensible defaults.
 * Returns the profile data.
 *
 * This is critical because the Clerk webhook that normally creates profiles
 * may not have fired (local dev, misconfigured webhook, etc.).
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  clerkId: string,
  email?: string
): Promise<{
  id: string;
  clerk_id: string;
  email: string;
  tier: string;
  coins: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  streak_freezes: Record<string, number>;
}> {
  // Try to fetch existing profile
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) return existing;

  // Profile doesn't exist — create one
  const { data: created, error } = await supabase
    .from("profiles")
    .upsert(
      {
        clerk_id: clerkId,
        email: email || "",
        tier: "free",
        coins: 250,
        streak_freezes: {},
      },
      { onConflict: "clerk_id" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create profile:", error);
    // Return a default profile object so callers don't crash
    return {
      id: "",
      clerk_id: clerkId,
      email: email || "",
      tier: "free",
      coins: 250,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      streak_freezes: {},
    };
  }

  return created;
}
