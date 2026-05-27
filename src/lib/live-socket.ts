// Mock WebSocket service that simulates a real-time push feed.
// Emits product events on a randomized cadence so the UI feels live
// without needing a real WS endpoint.

export type LiveEventKind = "restock" | "low-stock" | "price-drop" | "sold-out" | "trending";

export interface LiveEvent {
  id: string;
  kind: LiveEventKind;
  productId: number;
  productTitle: string;
  thumbnail?: string;
  message: string;
  at: number;
}

type Listener = (e: LiveEvent) => void;

const listeners = new Set<Listener>();
let started = false;
let timer: ReturnType<typeof setTimeout> | null = null;

const POOL: Array<{ id: number; title: string; thumb: string }> = [];

export function seedLivePool(products: Array<{ id: number; title: string; thumbnail: string }>) {
  POOL.length = 0;
  for (const p of products.slice(0, 60)) POOL.push({ id: p.id, title: p.title, thumb: p.thumbnail });
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function craftEvent(): LiveEvent | null {
  if (!POOL.length) return null;
  const p = pick(POOL);
  const kind = pick<LiveEventKind>(["restock", "low-stock", "price-drop", "sold-out", "trending"]);
  const msgs: Record<LiveEventKind, string> = {
    restock: "is back in stock",
    "low-stock": "is running low — only a few left",
    "price-drop": "just got cheaper",
    "sold-out": "is sold out",
    trending: "is trending right now",
  };
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    productId: p.id,
    productTitle: p.title,
    thumbnail: p.thumb,
    message: msgs[kind],
    at: Date.now(),
  };
}

function schedule() {
  const delay = 4500 + Math.random() * 5500; // 4.5s – 10s
  timer = setTimeout(() => {
    const evt = craftEvent();
    if (evt) listeners.forEach((l) => { try { l(evt); } catch {} });
    schedule();
  }, delay);
}

export function startLiveSocket() {
  if (started || typeof window === "undefined") return;
  started = true;
  // Auto-seed pool from the products API if not already seeded
  if (POOL.length === 0) {
    fetch("https://dummyjson.com/products?limit=60&select=id,title,thumbnail")
      .then((r) => r.json())
      .then((d) => seedLivePool(d?.products ?? []))
      .catch(() => {});
  }
  schedule();
}

export function subscribeLive(fn: Listener): () => void {
  listeners.add(fn);
  startLiveSocket();
  return () => { listeners.delete(fn); };
}

export function stopLiveSocket() {
  if (timer) clearTimeout(timer);
  timer = null;
  started = false;
  listeners.clear();
}
