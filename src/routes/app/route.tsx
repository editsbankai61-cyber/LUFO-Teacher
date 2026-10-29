import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/app")({
  component: function AppLayout() {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  },
});
