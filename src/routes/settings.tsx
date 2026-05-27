import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";

export const Route = createFileRoute("/settings")({
  component: () => (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your workspace</p>
        </div>
        <div className="rounded-3xl bg-card shadow-card p-8 text-center">
          <p className="text-muted-foreground">Settings panel coming soon ✨</p>
        </div>
      </div>
    </DashboardLayout>
  ),
});
