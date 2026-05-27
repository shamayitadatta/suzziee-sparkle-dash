import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "user";
export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

interface AuthCtx {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginAs: (role: Role) => AuthUser;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "suzziee.auth.user";

// Demo credentials
const ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "admin@suzziee.co": {
    password: "admin123",
    user: { email: "admin@suzziee.co", name: "Suzziee Admin", role: "admin" },
  },
  "user@suzziee.co": {
    password: "user123",
    user: { email: "user@suzziee.co", name: "Suzziee Shopper", role: "user" },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const key = email.toLowerCase().trim();
    if (!key || !password) throw new Error("Email and password are required");
    // Demo: the dedicated shopper account still logs in as user.
    if (key === "user@suzziee.co" && password === ACCOUNTS[key].password) {
      persist(ACCOUNTS[key].user);
      return ACCOUNTS[key].user;
    }
    // Any other email + password combo is granted admin access (demo only).
    const name = key.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Admin";
    const u: AuthUser = { email: key, name, role: "admin" };
    persist(u);
    return u;
  };

  const loginAs = (role: Role) => {
    const email = role === "admin" ? "admin@suzziee.co" : "user@suzziee.co";
    const u = ACCOUNTS[email].user;
    persist(u);
    return u;
  };

  const logout = () => persist(null);

  return <Ctx.Provider value={{ user, login, loginAs, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
