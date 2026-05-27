import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Star, ShoppingCart, Heart, Truck, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { fetchProduct } from "@/lib/api";

export const Route = createFileRoute("/products/$id")({
  component: () => (
    <DashboardLayout>
      <ProductDetail />
    </DashboardLayout>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading || !product) {
    return (
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="aspect-square rounded-3xl bg-muted animate-shimmer" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded animate-shimmer" />
          <div className="h-4 w-full bg-muted rounded animate-shimmer" />
          <div className="h-4 w-5/6 bg-muted rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail];
  const next = () => setActiveImg((i) => (i + 1) % images.length);
  const prev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="space-y-6">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Carousel */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-muted to-secondary shadow-card">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={images[activeImg]}
                alt={product.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 h-full w-full object-contain p-8"
              />
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass grid place-items-center hover:scale-110 transition-transform">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full glass grid place-items-center hover:scale-110 transition-transform">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            {product.discountPercentage > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-sm font-bold shadow-lg">
                -{Math.round(product.discountPercentage)}% OFF
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 h-20 w-20 rounded-xl overflow-hidden bg-muted border-2 transition-all ${
                    activeImg === i ? "border-primary shadow-glow scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium capitalize">
              {product.category.replace(/-/g, " ")}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{product.title}</h1>
            {product.brand && <p className="text-muted-foreground mt-1">by {product.brand}</p>}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
              ))}
              <span className="ml-2 font-semibold">{product.rating.toFixed(2)}</span>
            </div>
            <span className="text-sm text-muted-foreground">• {product.stock} in stock</span>
          </div>

          <div className="flex items-end gap-3">
            <div className="text-5xl font-bold text-gradient font-display">${product.price}</div>
            {product.discountPercentage > 0 && (
              <div className="text-lg text-muted-foreground line-through mb-1">
                ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-muted text-xs capitalize">#{t}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card shadow-card">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 grid place-items-center">
                <Truck className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold">Free Shipping</div>
                <div className="text-muted-foreground">2–4 days</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card shadow-card">
              <div className="h-10 w-10 rounded-xl bg-sky-500/15 text-sky-600 grid place-items-center">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-xs">
                <div className="font-semibold">Warranty</div>
                <div className="text-muted-foreground">1 year</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand text-white font-semibold shadow-glow"
            >
              <ShoppingCart className="h-5 w-5" /> Add to cart
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="h-14 w-14 rounded-2xl bg-card shadow-card grid place-items-center text-foreground hover:text-destructive transition-colors"
            >
              <Heart className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
