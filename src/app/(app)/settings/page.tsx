import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, ExternalLink, ChevronLeft } from "lucide-react";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) return null;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, stripe_subscription_id")
    .eq("clerk_id", userId)
    .single();

  const isPro = profile?.tier === "pro";

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 14px 100px", fontFamily: "'DM Sans',sans-serif" }}>
      <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Settings</h1>

      <div className="card" style={{ padding: 18, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Crown size={18} color={isPro ? "#f59e0b" : "rgba(0,0,0,0.15)"} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{isPro ? "Bloom Pro" : "Free Plan"}</span>
          </div>
          {isPro ? (
            <SettingsClient />
          ) : (
            <Link href="/pricing" style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", background: "rgba(99,102,241,0.06)", padding: "6px 14px", borderRadius: 8, textDecoration: "none" }}>
              Upgrade
            </Link>
          )}
        </div>
        {!isPro && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.04)", fontSize: 11, color: "rgba(0,0,0,0.3)" }}>
            <p>Free: 5 habits, all features</p>
            <p style={{ color: "#6366f1", marginTop: 3 }}>Pro: Unlimited habits, exclusive creatures</p>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Account</div>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.3)", marginBottom: 8 }}>
          Manage your account settings, profile, and security through Clerk.
        </p>
        <Link href="/garden" style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
          <ChevronLeft size={14} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
