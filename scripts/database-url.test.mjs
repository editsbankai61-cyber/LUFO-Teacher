import assert from "node:assert/strict";
import { test } from "node:test";
import {
  describeDatabaseEnvKeys,
  findDatabaseUrlFromEnv,
  getSanitizedHost,
  isProductionEnvironment,
  normalizeDatabaseUrl,
  validateDatabaseUrl,
} from "./database-url.mjs";

test("normalizeDatabaseUrl handles clean PostgreSQL URLs", () => {
  const url = "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(normalizeDatabaseUrl(url), url);
});

test("normalizeDatabaseUrl handles case-insensitive schemes", () => {
  const upper = "POSTGRESQL://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(normalizeDatabaseUrl(upper), upper);

  const mixed = "Postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(normalizeDatabaseUrl(mixed), mixed);

  const shortScheme = "POSTGRES://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(normalizeDatabaseUrl(shortScheme), shortScheme);
});

test("normalizeDatabaseUrl strips surrounding quotes", () => {
  const raw = '"postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require"';
  assert.equal(
    normalizeDatabaseUrl(raw),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const single = "'postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require'";
  assert.equal(
    normalizeDatabaseUrl(single),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );
});

test("normalizeDatabaseUrl strips accidental variable and CLI prefixes", () => {
  const raw = "DATABASE_URL=postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(
    normalizeDatabaseUrl(raw),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const rawPostgres = "POSTGRES_URL=postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(
    normalizeDatabaseUrl(rawPostgres),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const rawPrisma = "POSTGRES_PRISMA_URL=postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(
    normalizeDatabaseUrl(rawPrisma),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const exportPrefix = "export DATABASE_URL='postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require'";
  assert.equal(
    normalizeDatabaseUrl(exportPrefix),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const quotedWithVar = 'DATABASE_URL="postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require"';
  assert.equal(
    normalizeDatabaseUrl(quotedWithVar),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const psqlPrefix = "psql 'postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require'";
  assert.equal(
    normalizeDatabaseUrl(psqlPrefix),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const psqlD = 'psql -d "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require"';
  assert.equal(
    normalizeDatabaseUrl(psqlD),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );
});

test("normalizeDatabaseUrl strips trailing semicolons and invisible spaces", () => {
  const withSemi = "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require;";
  assert.equal(
    normalizeDatabaseUrl(withSemi),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );

  const withBom = "\uFEFFpostgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require\u200B";
  assert.equal(
    normalizeDatabaseUrl(withBom),
    "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require",
  );
});

test("normalizeDatabaseUrl rejects placeholders that cause ENOTFOUND base", () => {
  assert.equal(normalizeDatabaseUrl("database"), undefined);
  assert.equal(normalizeDatabaseUrl("base"), undefined);
  assert.equal(normalizeDatabaseUrl("DATABASE_URL"), undefined);
  assert.equal(normalizeDatabaseUrl("none"), undefined);
  assert.equal(normalizeDatabaseUrl("undefined"), undefined);
  assert.equal(normalizeDatabaseUrl("null"), undefined);
  assert.equal(normalizeDatabaseUrl(""), undefined);
  assert.equal(normalizeDatabaseUrl("   "), undefined);
  assert.equal(normalizeDatabaseUrl(undefined), undefined);
  assert.equal(normalizeDatabaseUrl(null), undefined);
});

test("validateDatabaseUrl validates hosts and detects 'base'", () => {
  const valid = validateDatabaseUrl("postgresql://user:secret@ep-cool.neon.tech/neondb?sslmode=require");
  assert.equal(valid.valid, true);
  assert.equal(valid.host, "ep-cool.neon.tech");

  const invalidPlaceholder = validateDatabaseUrl("database");
  assert.equal(invalidPlaceholder.valid, false);
  assert.ok(invalidPlaceholder.error);

  const invalidHost = validateDatabaseUrl("postgresql://user:secret@base/neondb");
  assert.equal(invalidHost.valid, false);
  assert.ok(invalidHost.error?.includes("base"));
});

test("getSanitizedHost returns hostname without exposing credentials", () => {
  const host = getSanitizedHost("postgresql://myuser:supersecretpass@ep-cool.neon.tech:5432/neondb");
  assert.equal(host, "ep-cool.neon.tech");
  assert.equal(host.includes("myuser"), false);
  assert.equal(host.includes("supersecretpass"), false);
});

test("findDatabaseUrlFromEnv checks candidate keys in priority order", () => {
  assert.equal(
    findDatabaseUrlFromEnv({
      POSTGRES_PRISMA_URL: "postgresql://u:p@prisma.neon.tech/db",
    }).key,
    "POSTGRES_PRISMA_URL",
  );

  assert.equal(
    findDatabaseUrlFromEnv({
      DATABASE_URL: "postgresql://u:p@db.neon.tech/db",
      POSTGRES_URL: "postgresql://u:p@pg.neon.tech/db",
    }).key,
    "DATABASE_URL",
  );

  assert.equal(
    findDatabaseUrlFromEnv({
      DATABASE_URL: "",
      POSTGRES_URL: "postgresql://u:p@pg.neon.tech/db",
    }).key,
    "POSTGRES_URL",
  );

  assert.equal(
    findDatabaseUrlFromEnv({
      DATABASE_URL: "invalid",
      POSTGRES_URL: "postgresql://u:p@pg.neon.tech/db",
    }).key,
    "POSTGRES_URL",
  );

  assert.equal(
    findDatabaseUrlFromEnv({}).key,
    undefined,
  );
});

test("describeDatabaseEnvKeys summarizes presence without leaking values", () => {
  const report = describeDatabaseEnvKeys({
    DATABASE_URL: "postgresql://u:p@db.neon.tech/db",
    POSTGRES_URL: "invalid",
  });
  assert.ok(report.includes("DATABASE_URL: valid"));
  assert.ok(report.includes("POSTGRES_URL: invalid/empty"));
  assert.ok(report.includes("POSTGRES_PRISMA_URL: unset"));
  assert.ok(!report.includes("db.neon.tech"));
  assert.ok(!report.includes("u:p"));
});

test("isProductionEnvironment accurately identifies production flags", () => {
  assert.equal(isProductionEnvironment({ NODE_ENV: "production" }), true);
  assert.equal(isProductionEnvironment({ VERCEL_ENV: "production" }), true);
  assert.equal(isProductionEnvironment({ VERCEL: "1" }), true);
  // Preview builds on Vercel must not be treated as strict production failure when DB is unset
  assert.equal(isProductionEnvironment({ VERCEL: "1", VERCEL_ENV: "preview" }), false);
  assert.equal(isProductionEnvironment({ VERCEL_ENV: "preview" }), false);
  assert.equal(isProductionEnvironment({ VERCEL_ENV: "development" }), false);
  assert.equal(isProductionEnvironment({ NODE_ENV: "development" }), false);
  assert.equal(isProductionEnvironment({}), false);
});
