import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/register")({
  component: function RegisterPage() {
    return <AuthScreen mode="register" />;
  },
});
