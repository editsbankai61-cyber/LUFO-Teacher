import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/login")({
  component: function LoginPage() {
    return <AuthScreen mode="login" />;
  },
});
