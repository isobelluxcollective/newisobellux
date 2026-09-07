import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitPrelaunchSignup } from "@/lib/prelaunch.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const inputCls =
  "w-full rounded-md border border-brand-ink/15 bg-white px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 focus:outline-none focus:border-brand-oxblood transition-colors";

export function PrelaunchSignupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const submit = useServerFn(submitPrelaunchSignup);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setFullName("");
    setEmail("");
    setMobile("");
    setMarketingConsent(false);
    setError(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm();
      setSuccess(false);
    }
    onOpenChange(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!marketingConsent) {
      setError("Please tick the marketing consent box to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submit({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          marketingConsent: true as const,
        },
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setSuccess(true);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border-brand-ink/10 bg-brand-cream p-6 sm:p-8">
        {success ? (
          <div className="py-6 text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-semibold">
              You&apos;re on the list
            </p>
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl italic text-brand-ink text-center">
                Thank you for signing up
              </DialogTitle>
              <DialogDescription className="text-sm text-brand-ink/70 leading-relaxed pt-2 text-center">
                We&apos;ll be in touch with news about our first draw and your chance to receive free
                pre-launch tickets. Watch your inbox.
              </DialogDescription>
            </DialogHeader>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="mt-4 inline-flex rounded-full bg-brand-oxblood px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold text-brand-cream hover:bg-brand-gold transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl sm:text-3xl italic text-brand-ink">
                Sign up for our first drop
              </DialogTitle>
              <DialogDescription className="text-sm text-brand-ink/65 leading-relaxed pt-1">
                Enter your details for the chance to receive free tickets to our first draw.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
                  Full name
                </label>
                <input
                  required
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={120}
                  className={inputCls}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
                  Email address
                </label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-ink/60 mb-2">
                  Mobile phone number
                </label>
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={40}
                  className={inputCls}
                  placeholder="07XXX XXX XXX"
                />
                <p className="mt-1.5 text-[11px] text-brand-ink/45">UK mobile numbers only</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 size-4 shrink-0 rounded border-brand-ink/30 accent-brand-oxblood"
                />
                <span className="text-xs text-brand-ink/70 leading-relaxed">
                  I agree to receive updates about Isobels draws, promotions and news by email and
                  SMS. You can withdraw consent at any time. See our{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-brand-oxblood"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {error ? (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-brand-oxblood py-3.5 text-xs uppercase tracking-[0.2em] font-bold text-brand-cream hover:bg-brand-gold transition-colors disabled:opacity-60"
              >
                {submitting ? "Signing up…" : "Sign up now"}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
