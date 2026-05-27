import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, User as UserIcon, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login, loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quick = (role: Role) => {
    loginAs(role);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-brand text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur grid place-items-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="font-display text-2xl font-bold">Suzziee</div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-md">
          <h1 className="text-5xl font-bold leading-tight">Sell beautifully. Manage effortlessly.</h1>
          <p className="mt-4 text-white/80 text-lg">
            The commerce dashboard built for makers who care about every pixel and every product.
          </p>
        </motion.div>
        <div className="relative text-sm text-white/70">© {new Date().getFullYear()} Suzziee Commerce</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand grid place-items-center shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">Suzziee</span>
          </div>

          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-muted-foreground mt-1">Sign in to continue to your dashboard</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@suzziee.co"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/60 border border-transparent focus:border-primary focus:bg-background outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/60 border border-transparent focus:border-primary focus:bg-background outline-none"
                />
              </div>
            </div>
            {err && <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</div>}
            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand text-white font-semibold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>or try a demo account</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quick("admin")}
              className="group flex flex-col items-start gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-glow transition-all text-left"
            >
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">Admin</div>
                <div className="text-xs text-muted-foreground">Full access</div>
              </div>
            </button>
            <button
              onClick={() => quick("user")}
              className="group flex flex-col items-start gap-2 p-4 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-glow transition-all text-left"
            >
              <UserIcon className="h-5 w-5 text-accent-foreground" />
              <div>
                <div className="font-semibold">User</div>
                <div className="text-xs text-muted-foreground">Browse only</div>
              </div>
            </button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground space-y-1">
            <div>Sign in with <strong>any email + password</strong> for Admin access.</div>
            <div><strong>user@suzziee.co</strong> / user123 for shopper view.</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
