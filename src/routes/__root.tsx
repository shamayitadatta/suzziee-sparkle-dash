import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
  Navigate,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider, useAuth, type Role } from "@/auth/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">This page wandered off the shelf.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-white font-medium shadow-glow">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Suzziee — Commerce Dashboard" },
      { name: "description", content: "Eye-catching admin dashboard for product sales, analytics, and inventory." },
      { property: "og:title", content: "Suzziee — Commerce Dashboard" },
      { name: "twitter:title", content: "Suzziee — Commerce Dashboard" },
      { property: "og:description", content: "Eye-catching admin dashboard for product sales, analytics, and inventory." },
      { name: "twitter:description", content: "Eye-catching admin dashboard for product sales, analytics, and inventory." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6ab877f-99a2-4b11-ba8f-a3d0265b278e/id-preview-fb49c258--3dad810c-8f3e-4b33-abfb-a93e65a77236.lovable.app-1779823146191.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b6ab877f-99a2-4b11-ba8f-a3d0265b278e/id-preview-fb49c258--3dad810c-8f3e-4b33-abfb-a93e65a77236.lovable.app-1779823146191.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <Outlet />
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Public + role rules. Admin-only routes block users.
const PUBLIC = ["/login"];
const ADMIN_ONLY: Array<{ test: (p: string) => boolean }> = [
  { test: (p) => p === "/" },
  { test: (p) => p.startsWith("/analytics") },
  { test: (p) => p.startsWith("/settings") },
];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC.includes(path);

  if (!user && !isPublic) return <Navigate to="/login" replace />;
  if (user && isPublic) return <Navigate to="/" replace />;

  if (user && user.role === "user" && ADMIN_ONLY.some((r) => r.test(path))) {
    return <Navigate to="/products" replace />;
  }
  return <>{children}</>;
}

export function useRequireRole(role: Role) {
  const { user } = useAuth();
  return user?.role === role;
}
