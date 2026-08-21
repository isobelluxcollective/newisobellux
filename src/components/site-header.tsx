import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoNav from "@/assets/Logo_1-removebg-preview.png";

const navLinks = [
  { to: "/raffle" as const, label: "Current Draws" },
  { to: "/community" as const, label: "Community" },
  { to: "/winners" as const, label: "Past Winners" },
  { to: "/about" as const, label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream/90 backdrop-blur-md border-b border-brand-ink/5">
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center shrink-0" aria-label="Isobel's home">
          <img
            src={logoNav}
            alt="Isobel's"
            className="h-12 sm:h-14 md:h-20 w-auto object-contain"
            width={180}
            height={44}
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-10 text-[11px] uppercase tracking-[0.2em] font-medium">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-brand-ink hover:text-brand-gold transition-colors"
              activeProps={{ className: "text-brand-gold" }}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/members"
                className="text-brand-ink hover:text-brand-gold transition-colors"
              >
                My Account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-brand-ink hover:text-brand-gold transition-colors uppercase tracking-[0.2em]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              search={{ redirect: "/enter", mode: "signup" }}
              className="text-brand-ink hover:text-brand-gold transition-colors"
            >
              Sign Up / Log In
            </Link>
          )}
          <Link
            to="/enter"
            className="bg-brand-ink text-brand-cream px-8 py-3 rounded-full hover:bg-brand-gold transition-colors duration-300"
          >
            Enter Now
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-brand-ink"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-brand-ink/5 bg-brand-cream">
          <nav className="flex flex-col px-6 py-6 space-y-4 text-sm uppercase tracking-[0.2em] font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-brand-ink hover:text-brand-gold py-2"
                activeProps={{ className: "text-brand-gold" }}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-left text-brand-ink hover:text-brand-gold py-2 uppercase tracking-[0.2em]"
              >
                Sign Out
              </button>
            )}
            <div className="flex flex-col gap-3 pt-2">
              {user ? (
                <Link
                  to="/members"
                  onClick={() => setOpen(false)}
                  className="border border-brand-ink text-brand-ink bg-transparent text-center px-8 py-4 rounded-full hover:bg-brand-ink/5 transition-colors"
                >
                  My Account
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    search={{ redirect: "/enter", mode: "signup" }}
                    onClick={() => setOpen(false)}
                    className="border border-brand-ink text-brand-ink bg-transparent text-center px-8 py-4 rounded-full hover:bg-brand-ink/5 transition-colors"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    search={{ redirect: "/members" }}
                    onClick={() => setOpen(false)}
                    className="bg-brand-ink text-brand-cream text-center px-8 py-4 rounded-full hover:bg-brand-gold transition-colors"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
