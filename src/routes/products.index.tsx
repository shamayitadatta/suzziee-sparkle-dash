import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Search, Star, SlidersHorizontal, ArrowUpDown, Grid3x3, List, X, Eye, EyeOff, Columns3, GripVertical, ChevronUp, ChevronDown, Radio } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { fetchProducts, type Product } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { usePublished } from "@/hooks/use-published";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/")({
  component: () => (
    <DashboardLayout>
      <ProductsPage />
    </DashboardLayout>
  ),
});

type SortKey = "name" | "price-asc" | "price-desc" | "rating";
type ColKey = "image" | "name" | "category" | "price" | "stock" | "rating" | "actions";

const COL_LABELS: Record<ColKey, string> = {
  image: "Image", name: "Name", category: "Category",
  price: "Price", stock: "Stock", rating: "Rating", actions: "Actions",
};
const DEFAULT_COLS: ColKey[] = ["image", "name", "category", "price", "stock", "rating", "actions"];
const COLS_KEY = "suzziee.columns";

function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { isPublished, toggle } = usePublished();

  // Real-time polling — refresh every 15s to simulate live updates
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts(100),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });

  // Simulated live stock perturbation (visible, deterministic-ish per refetch)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 8000);
    return () => clearInterval(id);
  }, []);

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("rating");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const PAGE_SIZE = 12;

  // Column customization (list view)
  const [columns, setColumns] = useState<ColKey[]>(DEFAULT_COLS);
  const [hiddenCols, setHiddenCols] = useState<Set<ColKey>>(new Set());
  const [showColPanel, setShowColPanel] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.columns) setColumns(parsed.columns);
        if (parsed.hidden) setHiddenCols(new Set(parsed.hidden));
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(COLS_KEY, JSON.stringify({ columns, hidden: Array.from(hiddenCols) }));
  }, [columns, hiddenCols]);

  const moveCol = (idx: number, dir: -1 | 1) => {
    setColumns((c) => {
      const next = [...c];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return c;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };
  const toggleCol = (k: ColKey) =>
    setHiddenCols((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });

  const allProducts = data?.products ?? [];

  // Apply role-based visibility
  const visible = useMemo(() => {
    if (!isAdmin) return allProducts.filter((p) => isPublished(p.id));
    if (showHiddenOnly) return allProducts.filter((p) => !isPublished(p.id));
    return allProducts;
  }, [allProducts, isAdmin, showHiddenOnly, isPublished]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    visible.forEach((p) => set.add(p.category));
    return Array.from(set).sort();
  }, [visible]);

  const filtered = useMemo(() => {
    let list = visible;
    if (debounced) {
      const q = debounced.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.category));
    const sorted = [...list];
    switch (sort) {
      case "name": sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
      case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
      case "rating": sorted.sort((a, b) => b.rating - a.rating); break;
    }
    return sorted;
  }, [visible, debounced, selectedCats, sort]);

  const paged = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paged.length < filtered.length;

  const toggleCat = useCallback((c: string) => {
    setPage(1);
    setSelectedCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }, []);

  const liveStock = useCallback((p: Product) => {
    // Deterministic small jitter from tick & id, so users see numbers move
    const delta = ((p.id * 13 + tick * 7) % 11) - 5;
    return Math.max(0, p.stock + delta);
  }, [tick]);

  const visibleCols = columns.filter((c) => !hiddenCols.has(c) && (c !== "actions" || isAdmin));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">{isAdmin ? "Products" : "Shop"}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
            <span>{filtered.length} {filtered.length === 1 ? "item" : "items"}</span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
              <Radio className="h-3 w-3 animate-pulse" /> Live • updated {timeAgo(dataUpdatedAt)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowHiddenOnly((v) => !v)}
              className={cn("px-3 py-2.5 rounded-xl border text-sm font-medium", showHiddenOnly ? "bg-brand text-white border-transparent" : "bg-card border-border")}
            >
              {showHiddenOnly ? "Showing hidden" : "All products"}
            </button>
          )}
          {view === "list" && (
            <button
              onClick={() => setShowColPanel((v) => !v)}
              className="p-2.5 rounded-xl border bg-card border-border"
              title="Customize columns"
            >
              <Columns3 className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => setView("grid")} className={cn("p-2.5 rounded-xl border", view === "grid" ? "bg-brand text-white border-transparent" : "bg-card border-border")}>
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")} className={cn("p-2.5 rounded-xl border", view === "list" ? "bg-brand text-white border-transparent" : "bg-card border-border")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Column customization panel */}
      <AnimatePresence>
        {view === "list" && showColPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-card shadow-card overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><Columns3 className="h-4 w-4" /> Customize columns</h3>
                <button onClick={() => { setColumns(DEFAULT_COLS); setHiddenCols(new Set()); }} className="text-xs text-primary font-medium">Reset</button>
              </div>
              <div className="space-y-2">
                {columns.map((col, i) => {
                  if (col === "actions" && !isAdmin) return null;
                  const hidden = hiddenCols.has(col);
                  return (
                    <div key={col} className="flex items-center gap-2 p-2 rounded-xl bg-muted/40">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className={cn("flex-1 text-sm font-medium", hidden && "opacity-50")}>{COL_LABELS[col]}</span>
                      <button onClick={() => moveCol(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-background disabled:opacity-30">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveCol(i, 1)} disabled={i === columns.length - 1} className="p-1 rounded hover:bg-background disabled:opacity-30">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggleCol(col)} className="p-1.5 rounded hover:bg-background">
                        {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="rounded-3xl bg-card shadow-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products…"
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-muted/60 border border-transparent focus:border-primary focus:bg-background outline-none text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full lg:w-auto appearance-none pl-10 pr-8 py-3 rounded-2xl bg-muted/60 border border-transparent focus:border-primary outline-none text-sm font-medium"
            >
              <option value="rating">Top Rated</option>
              <option value="name">Name (A–Z)</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {categories.map((c) => {
            const active = selectedCats.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all",
                  active ? "bg-brand text-white shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/70"
                )}
              >
                {c.replace(/-/g, " ")}
              </button>
            );
          })}
          {selectedCats.length > 0 && (
            <button onClick={() => setSelectedCats([])} className="text-xs text-primary font-medium ml-1">Clear</button>
          )}
        </div>
      </div>

      {/* Grid / Table */}
      {isLoading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-72 rounded-3xl bg-muted/50 animate-shimmer" />)}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              liveStock={liveStock(p)}
              isAdmin={isAdmin}
              published={isPublished(p.id)}
              onToggle={() => toggle(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
                  {visibleCols.map((c) => (
                    <th key={c} className="p-3 px-4 font-medium whitespace-nowrap">{COL_LABELS[c]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    {visibleCols.map((c) => (
                      <td key={c} className="p-3 px-4">
                        {c === "image" && (
                          <Link to="/products/$id" params={{ id: String(p.id) }} className="block h-12 w-12 rounded-lg overflow-hidden bg-muted">
                            <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                          </Link>
                        )}
                        {c === "name" && (
                          <Link to="/products/$id" params={{ id: String(p.id) }} className="font-medium hover:text-primary">{p.title}</Link>
                        )}
                        {c === "category" && <span className="capitalize text-muted-foreground">{p.category.replace(/-/g, " ")}</span>}
                        {c === "price" && <span className="font-semibold">${p.price}</span>}
                        {c === "stock" && (
                          <span className={cn("font-medium tabular-nums", liveStock(p) === 0 && "text-destructive")}>{liveStock(p)}</span>
                        )}
                        {c === "rating" && (
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {p.rating.toFixed(2)}
                          </span>
                        )}
                        {c === "actions" && isAdmin && (
                          <button
                            onClick={() => toggle(p.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium",
                              isPublished(p.id)
                                ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                                : "bg-muted text-muted-foreground hover:bg-muted/70"
                            )}
                          >
                            {isPublished(p.id) ? <><Eye className="h-3.5 w-3.5" /> Published</> : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {paged.length === 0 && !isLoading && (
        <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button onClick={() => setPage((p) => p + 1)} className="px-6 py-3 rounded-2xl bg-brand text-white font-semibold shadow-glow hover:scale-105 transition-transform">
            Load more ({filtered.length - paged.length} left)
          </button>
        </div>
      )}
    </div>
  );
}

function timeAgo(ts: number) {
  if (!ts) return "now";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

interface CardProps {
  product: Product;
  index: number;
  liveStock: number;
  isAdmin: boolean;
  published: boolean;
  onToggle: () => void;
}

const ProductCard = memo(function ProductCard({ product, index, liveStock, isAdmin, published, onToggle }: CardProps) {
  const inStock = liveStock > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -6 }}
      className="relative"
    >
      <Link
        to="/products/$id"
        params={{ id: String(product.id) }}
        className={cn("group block rounded-3xl bg-card shadow-card overflow-hidden h-full", !published && "opacity-70")}
      >
        <div className="relative aspect-square bg-gradient-to-br from-muted to-secondary overflow-hidden">
          <img src={product.thumbnail} alt={product.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
          {product.discountPercentage > 10 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
              -{Math.round(product.discountPercentage)}%
            </div>
          )}
          {!published && isAdmin && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-foreground text-background text-xs font-bold flex items-center gap-1">
              <EyeOff className="h-3 w-3" /> Hidden
            </div>
          )}
          <div className={cn("absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur tabular-nums", inStock ? "bg-emerald-500/90 text-white" : "bg-destructive/90 text-white")}>
            {inStock ? `${liveStock} in stock` : "Out of stock"}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted-foreground capitalize">{product.category.replace(/-/g, " ")}</div>
          <h3 className="mt-1 font-semibold truncate group-hover:text-primary transition-colors">{product.title}</h3>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xl font-bold font-display">${product.price}</div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
      {isAdmin && (
        <button
          onClick={(e) => { e.preventDefault(); onToggle(); }}
          className={cn(
            "absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur",
            published ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
          )}
          title={published ? "Hide from users" : "Publish to users"}
        >
          {published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {published ? "Live" : "Hidden"}
        </button>
      )}
    </motion.div>
  );
});
