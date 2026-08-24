import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoFooter from "@/assets/logo_2-removebg-preview.png";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.6 20.1a6.34 6.34 0 0 0 10.86-4.43V8.66a8.16 8.16 0 0 0 4.77 1.52V6.73a4.85 4.85 0 0 1-1.64-.04Z" />
    </svg>
  );
}

const colHeading =
  "text-[10px] uppercase tracking-[0.3em] text-brand-cream/70 font-semibold mb-5";
const linkCls =
  "text-sm text-brand-cream/90 hover:text-brand-cream hover:underline underline-offset-4 transition-colors";

export function SiteFooter() {
  const { user } = useAuth();

  return (
    <footer className="bg-brand-ink text-brand-cream/40 py-20">
      <div className="container mx-auto px-6 border-t border-brand-cream/10 pt-16 max-w-7xl">
        {/* Navigation columns */}
        <div className="grid md:grid-cols-5 gap-12 mb-20">
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center mb-6" aria-label="Isobels home">
              <img
                src={logoFooter}
                alt="Isobels"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain"
                width={200}
                height={48}
              />
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="https://www.instagram.com/isobelluxcollective"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Isobels on Instagram @isobelluxcollective"
                className="text-brand-cream/70 hover:text-brand-cream transition-colors"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://www.tiktok.com/@isobelmarysalter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Isobels on TikTok @isobelmarysalter"
                className="text-brand-cream/70 hover:text-brand-cream transition-colors"
              >
                <TikTokIcon className="size-5" />
              </a>
            </div>
            <p className="text-[11px] text-brand-cream/40">© | 2026 Isobels Luxe Collective</p>
          </div>

          <div>
            <h4 className={colHeading}>Draws</h4>
            <ul className="space-y-3">
              <li><Link to="/raffle" className={linkCls}>Current Draws</Link></li>
              <li><Link to="/winners" className={linkCls}>Past Draws</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={colHeading}>Isobels</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className={linkCls}>About Us</Link></li>
              <li><a href="/about#how-it-works" className={linkCls}>How It Works</a></li>
              <li><Link to="/enter" className={linkCls}>Pricing</Link></li>
              <li><Link to="/public-relations" className={linkCls}>Public Relations</Link></li>
              <li><Link to="/contact" className={linkCls}>Contact Us</Link></li>
              <li><Link to="/faqs" className={linkCls}>FAQs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={colHeading}>Members</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/auth"
                  search={{ redirect: "/enter", mode: "signup" }}
                  className={linkCls}
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" search={{ redirect: "/members" }} className={linkCls}>
                  Log In
                </Link>
              </li>
              <li>
                {user ? (
                  <Link to="/members" className={linkCls}>My Account</Link>
                ) : (
                  <Link to="/login" search={{ redirect: "/members" }} className={linkCls}>
                    My Account
                  </Link>
                )}
              </li>
            </ul>
          </div>

          <div>
            <h4 className={colHeading}>Legal</h4>
            <ul className="space-y-3">
              <li><a href="/terms" className={linkCls}>Terms &amp; Conditions</a></li>
              <li><a href="/privacy" className={linkCls}>Privacy Policy</a></li>
              <li><a href="/cookies" className={linkCls}>Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-brand-cream/5 flex justify-between items-center text-[9px] uppercase tracking-[0.3em]">
          <span>© | {new Date().getFullYear()} Isobels Luxe Collective</span>
          <span>Please Draw Responsibly · 18+</span>
        </div>
        <div className="mt-10 pt-6 border-t border-brand-cream/10">
          <p className="text-[11px] leading-relaxed text-brand-cream/35 max-w-4xl">
            Please note that Isobels draws are a prize draw, not a lottery. Our draws include a free
            postal method of entry. No purchase is necessary to enter. Free postal entry is limited
            to one entry per postcard — multiple entries submitted on a single postcard will not be
            valid. The winner may elect to receive the cash value equivalent of the prize in lieu of
            the physical item. Isobels draws are operated by Isobels Luxe Collective in compliance
            with UK competition law.
          </p>
        </div>
      </div>
    </footer>
  );
}
