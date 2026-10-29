import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const staticDir = join(root, ".vercel/output/static");
const serverFunc = join(
  root,
  ".vercel/output/functions/__server.func/index.mjs",
);
const distDir = join(root, "dist");

process.on("unhandledRejection", () => {});

async function main() {
  if (!existsSync(staticDir)) {
    console.error(
      "[prepare-cap] .vercel/output/static does not exist. Run `npm run build` first.",
    );
    process.exit(1);
  }

  mkdirSync(distDir, { recursive: true });
  cpSync(staticDir, distDir, { recursive: true });
  console.log("[prepare-cap] Copied static assets to dist/");

  process.env.VITE_AUTH_ENABLED = "false";
  const mod = await import(pathToFileURL(serverFunc).href);
  const req = new Request("http://localhost/");
  const res = await mod.default.fetch(req);
  const html = await res.text();

  writeFileSync(join(distDir, "index.html"), html, "utf8");
  console.log(`[prepare-cap] Generated dist/index.html (${html.length} bytes)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[prepare-cap] Error:", err);
  process.exit(1);
});
