import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getSanitizedHost,
  isProductionEnvironment,
  normalizeDatabaseUrl,
  validateDatabaseUrl,
} from "./database-url.mjs";

test("normalizeDatabaseUrl handles clean PostgreSQL URLs", () => {
  const url = "postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require";
  assert.equal(normalizeDatabaseUrl(url), url);
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

test("normalizeDatabaseUrl strips accidental variable prefixes", () => {
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
});

test("normalizeDatabaseUrl rejects placeholders that cause ENOTFOUND base", () => {
  assert.equal(normalizeDatabaseUrl("database"), undefined);
  assert.equal(normalizeDatabaseUrl("base"), undefined);
  assert.equal(normalizeDatabaseUrl("DATABASE_URL"), undefined);
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

test("isProductionEnvironment accurately identifies production flags", () => {
  assert.equal(isProductionEnvironment({ NODE_ENV: "production" }), true);
  assert.equal(isProductionEnvironment({ VERCEL: "1" }), true);
  assert.equal(isProductionEnvironment({ VERCEL_ENV: "production" }), true);
  assert.equal(isProductionEnvironment({ VERCEL_ENV: "preview" }), true);
  assert.equal(isProductionEnvironment({ NODE_ENV: "development" }), false);
  assert.equal(isProductionEnvironment({}), false);
});

