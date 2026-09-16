import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import logoFooter from "@/assets/logo_2-removebg-preview.png";

const linkCls =
  "text-sm text-brand-cream/90 hover:text-brand-cream hover:underline underline-offset-4 transition-colors";

/** Stage 1 footer: brand + Instagram + Privacy / Cookie only. */
export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-brand-cream/40 py-16 md:py-20">
      <div className="container mx-auto px-6 border-t border-brand-cream/10 pt-14 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-14">
          <div>
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
            </div>
            <p className="text-[11px] text-brand-cream/40">© | 2026 Isobels Luxe Collective</p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-brand-cream/70 font-semibold mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className={linkCls}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className={linkCls}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-cream/5 flex flex-wrap justify-between gap-3 items-center text-[9px] uppercase tracking-[0.3em]">
          <span>© | {new Date().getFullYear()} Isobels Luxe Collective</span>
          <span>Please Draw Responsibly · 18+</span>
        </div>
      </div>
    </footer>
  );
}
