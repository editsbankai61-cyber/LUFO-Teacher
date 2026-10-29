import { createFileRoute } from "@tanstack/react-router";
import { ProductRouter } from "@/components/Screens";

export const Route = createFileRoute("/app/$section/$detail")({
  component: function DetailPage() {
    const { section, detail } = Route.useParams();
    return <ProductRouter slug={[section, detail]} />;
  },
});
