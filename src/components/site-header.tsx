import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoNav from "@/assets/Logo_1-removebg-preview.png";

const primaryLinks: Array<
  | { to: "/raffle" | "/community" | "/winners" | "/about"; label: string }
  | { href: string; label: string }
> = [
  { to: "/raffle", label: "Current Draws" },
  { to: "/community", label: "Community" },
  { to: "/winners", label: "Past Winners" },
  { to: "/about", label: "About" },
  { href: "/about#how-it-works", label: "How It Works" },
];

const secondaryLinks: Array<
  { href: string; label: string } | { to: "/faqs" | "/contact"; label: string }
> = [
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream/90 backdrop-blur-md border-b border-brand-ink/5">
      <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3 max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center shrink-0" aria-label="Isobels home">
          <img
            src={logoNav}
            alt="Isobels"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            width={180}
            height={44}
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/enter"
            className="bg-brand-ink text-brand-cream px-5 sm:px-8 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold hover:bg-brand-gold transition-colors duration-300"
          >
            Enter Now
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu-drawer"
            onClick={() => setOpen(true)}
            className="p-2.5 text-brand-ink hover:bg-brand-ink/5 rounded-full transition-colors"
          >
            <Menu className="size-6" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/45 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      {/* Right drawer — Daymade-style */}
      <aside
        id="site-menu-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed top-0 right-0 z-[70] flex h-dvh w-[min(100%,22rem)] sm:w-[24rem] flex-col bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-end px-5 pt-5 pb-2">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-2 text-brand-ink/70 hover:text-brand-ink rounded-full hover:bg-brand-ink/5 transition-colors"
          >
            <X className="size-6" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-8 pt-4 pb-8">
          <ul className="space-y-5">
            {primaryLinks.map((l) => (
              <li key={l.label}>
                {"href" in l ? (
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-[1.05rem] sm:text-lg font-medium text-brand-ink/85 hover:text-brand-ink transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block text-[1.05rem] sm:text-lg font-medium text-brand-ink/85 hover:text-brand-ink transition-colors"
                    activeProps={{ className: "text-brand-ink" }}
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="my-8 border-t border-brand-ink/10" />

          <ul className="space-y-4">
            {secondaryLinks.map((l) => (
              <li key={l.label}>
                {"href" in l ? (
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-brand-ink/60 hover:text-brand-ink transition-colors"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-brand-ink/60 hover:text-brand-ink transition-colors"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 pb-8 pt-2 flex gap-3">
          {user ? (
            <>
              <a
                href="/members"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-brand-ink py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-brand-cream hover:bg-brand-gold transition-colors"
              >
                My Account
              </a>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 rounded-full border border-brand-ink/25 bg-white py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-brand-ink hover:bg-brand-ink/5 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ redirect: "/enter", mode: "signup" }}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-brand-ink py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-brand-cream hover:bg-brand-gold transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                search={{ redirect: "/members" }}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-brand-ink/25 bg-white py-3.5 text-center text-xs font-bold uppercase tracking-[0.16em] text-brand-ink hover:bg-brand-ink/5 transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </aside>
    </header>
  );
}
