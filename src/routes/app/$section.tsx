import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/$section")({
  component: function SectionLayout() {
    return <Outlet />;
  },
});
