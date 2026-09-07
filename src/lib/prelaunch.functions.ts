import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ukMobileRegex = /^(?:(?:\+44|0044|0)\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;

function normalizeMobile(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^00/, "+");
  let d = digits;
  if (d.startsWith("+44")) d = "0" + d.slice(3);
  else if (d.startsWith("44") && d.length >= 12) d = "0" + d.slice(2);
  return d.replace(/\D/g, "");
}

const schema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .max(40)
    .refine((v) => ukMobileRegex.test(v.replace(/\s+/g, " ").trim()), {
      message: "Enter a valid UK mobile number",
    }),
  marketingConsent: z.boolean().refine((v) => v === true, {
    message: "Please confirm marketing consent to continue",
  }),
});

export type PrelaunchSignupResult =
  | { ok: true }
  | { ok: false; code: "duplicate" | "validation" | "server"; message: string };

export const submitPrelaunchSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<PrelaunchSignupResult> => {
    const email = data.email.toLowerCase();
    const mobileNormalized = normalizeMobile(data.mobile);

    if (!/^07\d{9}$/.test(mobileNormalized)) {
      return {
        ok: false,
        code: "validation",
        message: "Enter a valid UK mobile number",
      };
    }

    const { error } = await supabaseAdmin.from("prelaunch_signups").insert({
      full_name: data.fullName,
      email,
      mobile: data.mobile.trim(),
      mobile_normalized: mobileNormalized,
      marketing_consent: true,
      source: "prelaunch",
    });

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          code: "duplicate",
          message: "This email or mobile number is already registered for the pre-launch list.",
        };
      }
      // Table missing / schema not applied yet
      if (error.code === "PGRST205" || /prelaunch_signups/i.test(error.message)) {
        console.error("[prelaunch-signup] table missing — apply migration 20260907120000_prelaunch_signups.sql");
        return {
          ok: false,
          code: "server",
          message:
            "Sign-up storage is not set up yet. Please ask the site admin to apply the prelaunch_signups database migration.",
        };
      }
      console.error("[prelaunch-signup]", error);
      return {
        ok: false,
        code: "server",
        message: "Something went wrong. Please try again.",
      };
    }

    return { ok: true };
  });
