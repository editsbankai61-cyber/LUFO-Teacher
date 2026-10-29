import { createFileRoute } from "@tanstack/react-router";
import { ProductRouter } from "@/components/Screens";

export const Route = createFileRoute("/app/$section")({
  component: function SectionPage() {
    const { section } = Route.useParams();
    return <ProductRouter slug={[section]} />;
  },
});
