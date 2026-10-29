import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LearnerBridge } from "@/components/learner-bridge";
import { assertContentIntegrity } from "@/lib/content-validation";
import appCss from "../styles.css?url";

assertContentIntegrity();

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:wght@450;600;750;850&family=Noto+Sans+Bengali:wght@500;700&family=Noto+Sans+Devanagari:wght@500;700&family=Noto+Sans+Gujarati:wght@500;700&family=Noto+Sans+Gurmukhi:wght@500;700&family=Noto+Sans+Kannada:wght@500;700&family=Noto+Sans+Malayalam:wght@500;700&family=Noto+Sans+Oriya:wght@500;700&family=Noto+Sans+Tamil:wght@500;700&family=Noto+Sans+Telugu:wght@500;700&family=Noto+Nastaliq+Urdu:wght@500;700&display=swap";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LUFO — Let language feel alive" },
      { name: "description", content: "Learn ten Indian languages through lessons, stories, games, scripts, and a 3D atlas." },
      { name: "theme-color", content: "#090b16" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONT_HREF },
    ],
  }),
  component: Root,
});

function Root() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <LearnerBridge>
            <Outlet />
          </LearnerBridge>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
