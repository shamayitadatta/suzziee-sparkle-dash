import { useEffect, useState } from "react";

const KEY = "suzziee.hidden.products";

function read(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

const listeners = new Set<() => void>();
let hidden = read();

function notify() {
  hidden = read();
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) notify();
  });
}

export function usePublished() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const isPublished = (id: number) => !hidden.has(id);
  const toggle = (id: number) => {
    const next = new Set(hidden);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    localStorage.setItem(KEY, JSON.stringify(Array.from(next)));
    notify();
  };

  return { isPublished, toggle, hiddenCount: hidden.size };
}
