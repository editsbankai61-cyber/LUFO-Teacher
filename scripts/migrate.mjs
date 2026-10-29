#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. Each file is applied in one transaction and
 * recorded in a `_migrations` table, so it runs once and is safe to re-run.
 *
 * The read is non-recursive, so the opt-in auth schema under migrations/auth/
 * is not applied to an app that never asked for sign-in.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import { isMigrationFile, pendingMigrations } from "./migration-plan.mjs";
import {
  getSanitizedHost,
  isProductionEnvironment,
  normalizeDatabaseUrl,
  validateDatabaseUrl,
} from "./database-url.mjs";

const rawDatabaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const validation = validateDatabaseUrl(databaseUrl);

if (!validation.valid || !databaseUrl) {
  if (isProductionEnvironment()) {
    console.error(
      `[migrate] Production database configuration error: ${validation.error || "DATABASE_URL is missing"}. ` +
        "Ensure DATABASE_URL or POSTGRES_URL is configured with a valid connection string in Vercel environment variables.",
    );
    process.exit(1);
  }
  console.log(
    `[migrate] DATABASE_URL not set (${validation.error}) — skipping (the PGLite fallback migrates itself in local dev).`,
  );
  process.exit(0);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

async function main() {
  let topEntries = [];
  try {
    topEntries = await readdir(migrationsDir);
  } catch {
    console.log("[migrate] no migrations/ directory — nothing to do.");
    return;
  }

  let authEntries = [];
  try {
    authEntries = await readdir(join(migrationsDir, "auth"));
  } catch {
    // No migrations/auth/ directory
  }

  const topFiles = topEntries.filter(isMigrationFile);
  const authFiles = authEntries.filter(isMigrationFile);
  const candidateNames = Array.from(new Set([...topFiles, ...authFiles]));

  if (candidateNames.length === 0) {
    console.log("[migrate] no migrations found — nothing to do.");
    return;
  }

  const sanitizedHost = getSanitizedHost(databaseUrl);
  console.log(`[migrate] Connecting to PostgreSQL at ${sanitizedHost}...`);

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 1,
    ssl:
      databaseUrl.includes("sslmode=require") || databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
  });
  const client = await pool.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    const pending = pendingMigrations(candidateNames, applied);
    if (pending.length === 0) {
      console.log("[migrate] database schema is already up to date.");
      return;
    }

    let count = 0;
    for (const { name } of pending) {
      const topPath = join(migrationsDir, name);
      const authPath = join(migrationsDir, "auth", name);
      const filePath = existsSync(topPath) ? topPath : authPath;
      const text = await readFile(filePath, "utf8");
      try {
        await client.query("BEGIN");
        // pg's simple-query protocol runs a whole multi-statement file at once.
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      console.log(`[migrate] applied ${name}`);
      count += 1;
    }
    console.log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err?.message || err);
  // pg errors carry the context needed to debug a bad SQL file.
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) console.error(`[migrate]   ${key}: ${err[key]}`);
  }
  process.exit(1);
});
