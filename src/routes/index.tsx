import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  Package, Star, DollarSign, Layers, TrendingUp, ArrowUpRight, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard-layout";
import { fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: () => (
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  ),
});

function DashboardHome() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts(100),
  });

  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const total = products.length;
    const avgRating = total ? products.reduce((s, p) => s + p.rating, 0) / total : 0;
    const inventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const byCategory: Record<string, number> = {};
    products.forEach((p) => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
    const categories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
    return { total, avgRating, inventoryValue, categories };
  }, [data]);

  const top = useMemo(
    () => [...(data?.products ?? [])].sort((a, b) => b.rating - a.rating).slice(0, 5),
    [data]
  );

  const trend = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
        sales: Math.round(40 + Math.sin(i / 1.5) * 25 + i * 6 + Math.random() * 20),
        revenue: Math.round(60 + Math.cos(i / 2) * 30 + i * 5 + Math.random() * 25),
      })),
    []
  );

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-brand p-6 sm:p-10 text-white shadow-glow"
      >
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Welcome back, Suzziee
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
              Your shop is glowing today ✨
            </h1>
            <p className="mt-2 text-white/80 max-w-xl">
              {isLoading ? "Loading insights…" : `Tracking ${stats.total} products across ${stats.categories.length} categories.`}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-white text-foreground px-5 py-3 font-semibold hover:scale-105 transition-transform"
          >
            Browse products <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats.total} accent="from-fuchsia-500 to-purple-500" delay={0} />
        <StatCard icon={Star} label="Average Rating" value={stats.avgRating.toFixed(2)} accent="from-amber-400 to-orange-500" delay={0.05} />
        <StatCard icon={DollarSign} label="Inventory Value" value={`$${stats.inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="from-emerald-400 to-teal-500" delay={0.1} />
        <StatCard icon={Layers} label="Categories" value={stats.categories.length} accent="from-sky-400 to-indigo-500" delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-3xl bg-card shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Sales Performance</h3>
              <p className="text-sm text-muted-foreground">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-4 w-4" /> +18.2%
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="sales" stroke="var(--chart-3)" fill="url(#g2)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-card shadow-card p-6"
        >
          <h3 className="font-semibold text-lg">Category Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Top categories by count</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.categories.slice(0, 5)} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {stats.categories.slice(0, 5).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {stats.categories.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 capitalize">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.name.replace(/-/g, " ")}
                </span>
                <span className="font-semibold">{c.value}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Top products + bar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-3xl bg-card shadow-card p-6"
        >
          <h3 className="font-semibold text-lg mb-4">Top-rated Products</h3>
          <div className="space-y-3">
            {top.map((p, i) => (
              <Link
                key={p.id}
                to="/products/$id"
                params={{ id: String(p.id) }}
                className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-muted transition-colors"
              >
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.category.replace(/-/g, " ")}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${p.price}</div>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="h-3 w-3 fill-current" /> {p.rating.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs font-bold text-muted-foreground w-6 text-right">#{i + 1}</div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-3xl bg-card shadow-card p-6"
        >
          <h3 className="font-semibold text-lg mb-4">Stock by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categories.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => v.slice(0, 6)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, accent, delay,
}: { icon: any; label: string; value: string | number; accent: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-card p-5"
    >
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl sm:text-3xl font-bold font-display">{value}</div>
    </motion.div>
  );
}
