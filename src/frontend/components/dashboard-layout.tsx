import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LayoutDashboard, Package, BarChart3, Settings, Search, Menu, Sparkles, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth, type Role } from "@/lib/auth";
import { LiveFeed } from "@/components/live-feed";

const ALL_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] as Role[] },
  { to: "/products", label: "Products", icon: Package, roles: ["admin", "user"] as Role[] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] as Role[] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["admin"] as Role[] },
] as const;

export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();

  const nav = ALL_NAV.filter((n) => !user || n.roles.includes(user.role));
  const initials = (user?.name ?? "SZ").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-6">
          <Link to={user?.role === "user" ? "/products" : "/"} className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="relative">
              <div className="absolute inset-0 bg-brand rounded-xl blur-md opacity-60 animate-float" />
              <div className="relative h-10 w-10 rounded-xl bg-brand grid place-items-center shadow-glow">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-gradient">Suzziee</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Commerce Suite</div>
            </div>
          </Link>

          <nav className="mt-10 flex-1 space-y-1">
            {nav.map((item) => {
              const active = path === item.to || (item.to !== "/" && path.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-glow"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-brand"
                    />
                  )}
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-sidebar-accent/60 p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand grid place-items-center text-sm font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{user?.name ?? "Guest"}</div>
                <div className="text-xs text-sidebar-foreground/60 truncate flex items-center gap-1">
                  {user?.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
              <button onClick={logout} className="text-sidebar-foreground/60 hover:text-sidebar-foreground" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-border">
          <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search products, orders, customers…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/60 border border-transparent focus:border-primary focus:bg-background outline-none text-sm transition-colors"
              />
            </div>
            {user?.role === "admin" && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            )}
            <LiveFeed />
            <div className="hidden sm:flex h-10 w-10 rounded-xl bg-brand items-center justify-center text-white text-sm font-bold shadow-glow">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
