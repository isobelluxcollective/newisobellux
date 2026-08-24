import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  kind: z.enum(["pr", "contact"]),
  reference: z.string().regex(/^(PR|CU)-\d{6}$/),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
});

export const submitContactEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const subject =
      data.kind === "pr"
        ? `[PR] Isobels Enquiry — Ref: ${data.reference}`
        : `[CONTACT] Isobels Enquiry — Ref: ${data.reference}`;

    // TODO: wire to hello@isobel.co.uk once domain is confirmed.
    // For now we log the submission server-side so it's retrievable from logs.
    console.log("[contact-enquiry]", {
      to: "hello@isobel.co.uk",
      subject,
      body: {
        reference: data.reference,
        name: data.name,
        email: data.email,
        phone: data.phone || "(not provided)",
        message: data.message,
      },
    });

    return { ok: true, reference: data.reference };
  });
