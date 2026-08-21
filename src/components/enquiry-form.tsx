import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactEnquiry } from "@/lib/contact.functions";

interface Props {
  kind: "pr" | "contact";
  submitLabel: string;
}

function generateRef(kind: "pr" | "contact") {
  const prefix = kind === "pr" ? "PR" : "CU";
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${n}`;
}

export function EnquiryForm({ kind, submitLabel }: Props) {
  const submit = useServerFn(submitContactEnquiry);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+44 ");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const ref = generateRef(kind);
    try {
      await submit({
        data: {
          kind,
          reference: ref,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() === "+44" ? "" : phone.trim(),
          message: message.trim(),
        },
      });
      setReference(ref);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    const successText =
      kind === "pr"
        ? `Thank you. We've received your enquiry. Your reference number is ${reference}. We'll be in touch shortly.`
        : `Thank you. We've received your message. Your reference number is ${reference}. We'll be in touch shortly.`;
    return (
      <div className="border border-brand-ink/10 rounded-2xl p-10 bg-white text-center">
        <p className="font-serif text-2xl italic text-brand-ink leading-relaxed">
          {successText}
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-brand-ink/15 bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 focus:outline-none focus:border-brand-ink transition-colors";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
          Name
        </label>
        <input
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
          Email address
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
          Phone number <span className="normal-case tracking-normal text-brand-ink/40">(optional)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={40}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
          Message
        </label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={5000}
          rows={7}
          className={inputCls + " resize-y"}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-ink text-brand-cream rounded-full py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-brand-gold transition-colors disabled:opacity-60"
      >
        {submitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
