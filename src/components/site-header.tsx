import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import logoNav from "@/assets/Isobel_Logo__updated_-removebg-preview.png";

const INSTAGRAM_URL = "https://www.instagram.com/isobelluxcollective";

/** Stage 1 header: large logo + Instagram / Follow the Drop. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream/90 backdrop-blur-md border-b border-brand-ink/5">
      <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3 max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center shrink-0" aria-label="Isobels home">
          <img
            src={logoNav}
            alt="Isobels"
            className="h-24 sm:h-28 md:h-32 w-auto object-contain"
            width={360}
            height={88}
          />
        </Link>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 shrink-0 text-brand-oxblood hover:opacity-80 transition-opacity"
          aria-label="Follow Isobels on Instagram"
        >
          <span className="font-serif text-sm sm:text-base md:text-lg italic tracking-tight">
            Follow the Drop
          </span>
          <Instagram className="size-5 sm:size-6" strokeWidth={1.75} />
        </a>
      </div>
    </header>
  );
}
