import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectRoot } from "./with-app-env.mjs";

const root = projectRoot();

test("all required game routes and files exist in the project", () => {
  const layoutPath = join(root, "src/routes/app/$section.tsx");
  const indexPath = join(root, "src/routes/app/$section/index.tsx");
  const detailPath = join(root, "src/routes/app/$section/$detail.tsx");

  assert.ok(existsSync(layoutPath), "src/routes/app/$section.tsx must exist");
  assert.ok(existsSync(indexPath), "src/routes/app/$section/index.tsx must exist");
  assert.ok(existsSync(detailPath), "src/routes/app/$section/$detail.tsx must exist");

  const layoutContent = readFileSync(layoutPath, "utf-8");
  assert.ok(
    layoutContent.includes("<Outlet />") || layoutContent.includes("<Outlet/>"),
    "app/$section.tsx must render <Outlet /> so detail routes are not blocked",
  );

  const indexContent = readFileSync(indexPath, "utf-8");
  assert.ok(
    indexContent.includes("ProductRouter") && indexContent.includes("slug={[section]}"),
    "app/$section/index.tsx must pass section slug to ProductRouter",
  );

  const detailContent = readFileSync(detailPath, "utf-8");
  assert.ok(
    detailContent.includes("ProductRouter") && detailContent.includes("slug={[section, detail]}"),
    "app/$section/$detail.tsx must pass both section and detail slugs to ProductRouter",
  );
});

test("all 8 educational game modes are defined with instructions and categories", () => {
  const gamesPath = join(root, "src/components/Games.tsx");
  const gamesContent = readFileSync(gamesPath, "utf-8");

  const expectedGameIds = [
    "word-match",
    "memory-match",
    "sentence-builder",
    "listening-challenge",
    "quick-quiz",
    "speed-challenge",
    "picture-vocabulary",
    "daily-challenge",
  ];

  for (const id of expectedGameIds) {
    assert.ok(
      gamesContent.includes(`id: "${id}"`),
      `Games.tsx must contain definition for game id "${id}"`,
    );
  }
});

test("game cards in Games.tsx link directly to /app/games/${game.id}", () => {
  const gamesPath = join(root, "src/components/Games.tsx");
  const gamesContent = readFileSync(gamesPath, "utf-8");

  assert.ok(
    gamesContent.includes('href={`/app/games/${game.id}`}'),
    "Game cards must link to `/app/games/${game.id}`",
  );
});

test("GamePlayer handles unknown game IDs with Game Not Found state", () => {
  const gamesPath = join(root, "src/components/Games.tsx");
  const gamesContent = readFileSync(gamesPath, "utf-8");

  assert.ok(
    gamesContent.includes("Game Not Found"),
    "GamePlayer must contain a Game Not Found fallback state",
  );
  assert.ok(
    gamesContent.includes("Return to Game Catalogue"),
    "GamePlayer must provide a Return to Game Catalogue button",
  );
});

test("scroll restoration is configured in root route", () => {
  const rootPath = join(root, "src/routes/__root.tsx");
  const rootContent = readFileSync(rootPath, "utf-8");

  assert.ok(
    rootContent.includes("ScrollRestoration"),
    "__root.tsx must include ScrollRestoration component",
  );
});

test("app main layout specifies ample top padding to prevent header clipping", () => {
  const stylesPath = join(root, "src/styles.css");
  const stylesContent = readFileSync(stylesPath, "utf-8");

  assert.ok(
    stylesContent.includes(".app-topbar"),
    "styles.css must style .app-topbar",
  );
  assert.ok(
    stylesContent.includes(".screen-heading"),
    "styles.css must style .screen-heading",
  );
});

