import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Package, Star, DollarSign, Layers } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard-layout";
import { fetchProducts } from "@/lib/api";

export const Route = createFileRoute("/analytics")({
  component: () => (
    <DashboardLayout>
      <Analytics />
    </DashboardLayout>
  ),
});

function Analytics() {
  const { data } = useQuery({ queryKey: ["products", "all"], queryFn: () => fetchProducts(100) });

  const m = useMemo(() => {
    const products = data?.products ?? [];
    const cats: Record<string, { name: string; count: number; value: number; rating: number }> = {};
    products.forEach((p) => {
      const c = cats[p.category] ?? { name: p.category, count: 0, value: 0, rating: 0 };
      c.count += 1;
      c.value += p.price * p.stock;
      c.rating += p.rating;
      cats[p.category] = c;
    });
    const categoryData = Object.values(cats).map((c) => ({
      ...c,
      avgRating: +(c.rating / c.count).toFixed(2),
      value: Math.round(c.value),
    }));
    return {
      total: products.length,
      avgRating: products.length ? products.reduce((s, p) => s + p.rating, 0) / products.length : 0,
      invValue: products.reduce((s, p) => s + p.price * p.stock, 0),
      categoryCount: categoryData.length,
      categoryData,
    };
  }, [data]);

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep insights across your catalog</p>
      </div>

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Package} label="Total Products" value={m.total} accent="from-fuchsia-500 to-purple-500" />
        <Kpi icon={Star} label="Avg Rating" value={m.avgRating.toFixed(2)} accent="from-amber-400 to-orange-500" />
        <Kpi icon={DollarSign} label="Inventory Value" value={`$${m.invValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="from-emerald-400 to-teal-500" />
        <Kpi icon={Layers} label="Categories" value={m.categoryCount} accent="from-sky-400 to-indigo-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-card shadow-card p-6">
          <h3 className="font-semibold text-lg mb-1">Inventory Value by Category</h3>
          <p className="text-sm text-muted-foreground mb-4">Total stock value per category (USD)</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} width={110} tickFormatter={(v) => v.replace(/-/g, " ")} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl bg-card shadow-card p-6">
          <h3 className="font-semibold text-lg mb-1">Category Distribution</h3>
          <p className="text-sm text-muted-foreground mb-4">Number of products per category</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="20%" outerRadius="100%" data={m.categoryData.slice(0, 6).map((c, i) => ({ ...c, fill: COLORS[i % COLORS.length] }))} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="count" background cornerRadius={8} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 11, textTransform: "capitalize" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl bg-card shadow-card overflow-hidden">
        <div className="p-6 pb-3">
          <h3 className="font-semibold text-lg">Category Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-y border-border bg-muted/30">
                <th className="p-3 px-6 font-medium">Category</th>
                <th className="p-3 font-medium">Products</th>
                <th className="p-3 font-medium">Avg Rating</th>
                <th className="p-3 px-6 font-medium text-right">Inventory Value</th>
              </tr>
            </thead>
            <tbody>
              {m.categoryData.map((c) => (
                <tr key={c.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3 px-6 font-medium capitalize">{c.name.replace(/-/g, " ")}</td>
                  <td className="p-3">{c.count}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {c.avgRating}
                    </span>
                  </td>
                  <td className="p-3 px-6 text-right font-semibold">${c.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-2xl bg-card shadow-card p-5">
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold font-display">{value}</div>
    </motion.div>
  );
}
