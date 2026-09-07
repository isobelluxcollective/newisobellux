import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const adminCheckAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export type PrelaunchSignupRow = {
  id: string;
  full_name: string;
  email: string;
  mobile: string;
  marketing_consent: boolean;
  source: string;
  created_at: string;
};

export const adminGetDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { data: signups, error } = await supabaseAdmin
      .from("prelaunch_signups")
      .select("id, full_name, email, mobile, marketing_consent, source, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (signups ?? []) as PrelaunchSignupRow[];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const last7 = rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * dayMs).length;
    const last24 = rows.filter((r) => now - new Date(r.created_at).getTime() < dayMs).length;
    const consented = rows.filter((r) => r.marketing_consent).length;

    return {
      stats: {
        totalSignups: rows.length,
        last24h: last24,
        last7d: last7,
        marketingConsent: consented,
      },
      signups: rows,
    };
  });
