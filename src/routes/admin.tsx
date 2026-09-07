import { useState } from "react";
import {
  Outlet,
  createFileRoute,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  ExternalLink,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/admin/login";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/admin/login" });
  }

  if (isLogin) {
    return (
      <div className="min-h-screen bg-[#f4efe6] text-brand-ink">
        <Outlet />
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-6">
        <Link to="/admin" className="block" onClick={() => setMobileOpen(false)}>
          <p className="font-serif text-2xl italic tracking-tight text-brand-cream">Isobels</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-brand-gold">Admin</p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[10px] uppercase tracking-[0.22em] text-brand-cream/40">
          Overview
        </p>
        <Link
          to="/admin"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            pathname === "/admin" || pathname === "/admin/"
              ? "bg-brand-oxblood text-brand-cream"
              : "text-brand-cream/70 hover:bg-white/5 hover:text-brand-cream",
          )}
        >
          <LayoutDashboard className="size-4 shrink-0" strokeWidth={1.75} />
          Dashboard
        </Link>
        <a
          href="/admin#signups"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-cream/70 transition-colors hover:bg-white/5 hover:text-brand-cream"
        >
          <Users className="size-4 shrink-0" strokeWidth={1.75} />
          Pre-launch list
        </a>

        <p className="mb-3 mt-8 px-3 text-[10px] uppercase tracking-[0.22em] text-brand-cream/40">
          Quick links
        </p>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-cream/70 transition-colors hover:bg-white/5 hover:text-brand-cream"
        >
          <ExternalLink className="size-4 shrink-0" strokeWidth={1.75} />
          View public site
        </a>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="truncate text-xs text-brand-cream/50 mb-3">{user?.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-lg border border-white/15 px-3 py-2.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-brand-cream/80 hover:bg-white/5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4efe6] text-brand-ink">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-brand-ink/10 bg-brand-ink px-4 py-3 text-brand-cream">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 hover:bg-white/10"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-serif text-lg italic">Isobels Admin</span>
        <span className="w-9" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-brand-ink shadow-xl">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-2 text-brand-cream/70 hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-brand-ink text-brand-cream">
          {sidebar}
        </aside>

        <div className="lg:pl-64 flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
