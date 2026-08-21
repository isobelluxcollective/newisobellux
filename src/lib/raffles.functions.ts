import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Raffle } from "@/lib/raffle-data";

// ---------- Public reads (uses admin client, but only returns non-draft rows) ----------

export const getLiveRaffles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("raffles")
    .select("*")
    .eq("status", "live")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: false })
    .order("draw_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Raffle[];
});

export const getFeaturedRaffles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("raffles")
    .select("*")
    .eq("status", "live")
    .eq("featured", true)
    .order("sort_order", { ascending: false })
    .order("draw_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Raffle[];
});

export const getRaffleById = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) => {
    if (!/^[0-9a-fA-F-]{36}$/.test(d.id)) throw new Error("Invalid id");
    return d;
  })
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("raffles")
      .select("*")
      .eq("id", data.id)
      .in("status", ["live", "closed"])
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as Raffle | null) ?? null;
  });

// ---------- Admin writes ----------

const raffleInputSchema = z.object({
  draw_number: z.string().trim().min(1).max(20),
  title: z.string().trim().min(1).max(120),
  italic: z.string().trim().max(120).default(""),
  prize_name: z.string().trim().min(1).max(200),
  prize_short: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  ticket_price: z.number().min(0.5).max(10000),
  hero_image_url: z.string().trim().max(2000).default(""),
  draw_date: z.string().min(1),
  odds: z.string().trim().max(200).default(""),
  retail_value: z.string().trim().max(100).default(""),
  status: z.enum(["draft", "live", "closed"]).default("live"),
  featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(100000).default(0),
});

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

export const adminListRaffles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("raffles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Raffle[];
  });

export const adminCreateRaffle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => raffleInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("raffles")
      .insert(data)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Raffle;
  });

export const adminUpdateRaffle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid() }).and(raffleInputSchema.partial()).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { id, ...patch } = data;
    const { data: row, error } = await supabaseAdmin
      .from("raffles")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Raffle;
  });

export const adminDeleteRaffle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("raffles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
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
