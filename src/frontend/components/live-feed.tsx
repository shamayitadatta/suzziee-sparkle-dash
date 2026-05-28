import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Radio, TrendingDown, TrendingUp, AlertTriangle, Flame, PackageX, Bell, X } from "lucide-react";
import { subscribeLive, type LiveEvent } from "@/frontend/lib/live-socket";
import { cn } from "@/lib/utils";

const ICONS = {
  restock: TrendingUp,
  "low-stock": AlertTriangle,
  "price-drop": TrendingDown,
  "sold-out": PackageX,
  trending: Flame,
} as const;

const TONES: Record<LiveEvent["kind"], string> = {
  restock: "text-emerald-600 bg-emerald-500/10",
  "low-stock": "text-amber-600 bg-amber-500/10",
  "price-drop": "text-sky-600 bg-sky-500/10",
  "sold-out": "text-rose-600 bg-rose-500/10",
  trending: "text-fuchsia-600 bg-fuchsia-500/10",
};

export function LiveFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<LiveEvent | null>(null);

  useEffect(() => {
    return subscribeLive((e) => {
      setEvents((prev) => [e, ...prev].slice(0, 30));
      setUnread((n) => (open ? 0 : n + 1));
      setToast(e);
      window.setTimeout(() => setToast((t) => (t?.id === e.id ? null : t)), 3500);
    });
  }, [open]);

  useEffect(() => { if (open) setUnread(0); }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 rounded-xl border border-border bg-card hover:border-primary transition-colors"
        title="Live feed"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-brand text-white text-[10px] font-bold grid place-items-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-4 top-16 z-50 w-[min(380px,90vw)] rounded-2xl bg-card shadow-2xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                <div>
                  <div className="font-semibold text-sm">Live feed</div>
                  <div className="text-xs text-muted-foreground">Streaming product updates</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
              {events.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">Waiting for live updates…</div>
              )}
              {events.map((e) => {
                const Icon = ICONS[e.kind];
                return (
                  <Link
                    key={e.id}
                    to="/products/$id"
                    params={{ id: String(e.productId) }}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className={cn("h-9 w-9 rounded-xl grid place-items-center shrink-0", TONES[e.kind])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm leading-snug">
                        <span className="font-medium">{e.productTitle}</span>{" "}
                        <span className="text-muted-foreground">{e.message}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(e.at)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toast */}
      <AnimatePresence>
        {toast && !open && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-card shadow-2xl border border-border p-3 flex items-start gap-3"
          >
            {(() => { const Icon = ICONS[toast.kind]; return (
              <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", TONES[toast.kind])}>
                <Icon className="h-5 w-5" />
              </div>
            ); })()}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{toast.productTitle}</div>
              <div className="text-xs text-muted-foreground">{toast.message}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}
