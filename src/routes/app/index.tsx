import { createFileRoute } from "@tanstack/react-router";
import { ProductRouter } from "@/components/Screens";

export const Route = createFileRoute("/app/")({
  component: function AppHome() {
    return <ProductRouter />;
  },
});
