import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/ensure-profile";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan } = body; // "annual" | "monthly"

    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

    // If no Stripe key, use dev mode
    if (!STRIPE_SECRET) {
      return NextResponse.json({
        devMode: true,
        message: "Stripe not configured — using dev mode",
      });
    }

    // Resolve price ID from plan
    const priceId =
      plan === "monthly"
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      // No price IDs configured — dev mode fallback
      return NextResponse.json({
        devMode: true,
        message: "Price IDs not configured — using dev mode",
      });
    }

    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Dynamic import to avoid build errors if stripe isn't installed
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET);

    const supabase = await createServerSupabaseClient();

    // Ensure profile exists (auto-creates if Clerk webhook didn't fire)
    const profile = await ensureProfile(supabase, userId);

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://tendhabit.com";

    // Build session params
    const sessionParams: Record<string, unknown> = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/garden?upgraded=true`,
      cancel_url: `${origin}/garden`,
      metadata: { clerk_id: userId },
    };

    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else if (profile?.email) {
      sessionParams.customer_email = profile.email;
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
    );

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Something went wrong creating the checkout session. Please try again." },
      { status: 500 }
    );
  }
}
