// @ts-check
import { parse as parsePgConnectionString } from "pg-connection-string";

/**
 * Common environment variable names used by Vercel and Neon for PostgreSQL.
 */
export const DATABASE_URL_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL_UNPOOLED",
  "NEON_DATABASE_URL",
  "POSTGRESQL_URL",
];

/**
 * Clean and normalize a raw database connection string.
 *
 * Handles:
 * - Case-insensitive scheme: `POSTGRESQL://` or `Postgresql://`
 * - Accidental export prefix: `export DATABASE_URL=...`
 * - Accidental variable assignment prefix: `DATABASE_URL=postgresql://...`
 * - Accidental CLI prefix: `psql 'postgresql://...'` or `psql -d '...'`
 * - Surrounding quotes (single, double, or backticks): `"postgresql://..."`
 * - Zero-width spaces and trailing semicolons
 * - Rejection of invalid placeholders like "base" or "database"
 *
 * @param {string | undefined | null} raw
 * @returns {string | undefined}
 */
export function normalizeDatabaseUrl(raw) {
  if (!raw || typeof raw !== "string") return undefined;
  let s = raw.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (!s) return undefined;

  // Strip leading export command if present
  s = s.replace(/^export\s+/i, "").trim();

  // Strip common accidental variable assignment prefixes
  s = s.replace(
    /^(DATABASE_URL|POSTGRES_URL|POSTGRES_PRISMA_URL|POSTGRES_URL_NON_POOLING|DATABASE_URL_UNPOOLED|NEON_DATABASE_URL|POSTGRESQL_URL)\s*=\s*/i,
    "",
  ).trim();

  // Strip psql CLI prefixes
  s = s.replace(/^psql(\s+-d)?\s+/i, "").trim();

  // Strip surrounding quotes
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith("`") && s.endsWith("`"))
  ) {
    s = s.slice(1, -1).trim();
  }

  // Handle case where value was pasted as "export VAR=..." or "VAR=..." inside quotes
  s = s.replace(/^export\s+/i, "").trim();
  s = s.replace(
    /^(DATABASE_URL|POSTGRES_URL|POSTGRES_PRISMA_URL|POSTGRES_URL_NON_POOLING|DATABASE_URL_UNPOOLED|NEON_DATABASE_URL|POSTGRESQL_URL)\s*=\s*/i,
    "",
  ).trim();
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith("`") && s.endsWith("`"))
  ) {
    s = s.slice(1, -1).trim();
  }

  // Strip trailing semicolons
  s = s.replace(/;+$/, "").trim();

  if (!s) return undefined;

  // Reject placeholder values that pg-connection-string misparses as host 'base'
  const lower = s.toLowerCase();
  if (
    lower === "base" ||
    lower === "database" ||
    lower === "database_url" ||
    lower === "postgres_url" ||
    lower === "none" ||
    lower === "undefined" ||
    lower === "null"
  ) {
    return undefined;
  }

  // Validate scheme: case-insensitive check for postgres:// or postgresql://, or host= keyword
  if (
    !lower.startsWith("postgres://") &&
    !lower.startsWith("postgresql://") &&
    !lower.includes("host=") &&
    !lower.includes("dbname=")
  ) {
    return undefined;
  }

  return s;
}

/**
 * Inspect environment and find the first valid database connection URL.
 *
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {{ key?: string; url?: string; raw?: string }}
 */
export function findDatabaseUrlFromEnv(env = process.env) {
  for (const key of DATABASE_URL_ENV_KEYS) {
    const raw = env[key];
    if (raw && typeof raw === "string" && raw.trim()) {
      const normalized = normalizeDatabaseUrl(raw);
      if (normalized) {
        return { key, url: normalized, raw };
      }
    }
  }
  return { key: undefined, url: undefined, raw: undefined };
}

/**
 * Return non-sensitive status report of inspected database environment keys.
 *
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {string}
 */
export function describeDatabaseEnvKeys(env = process.env) {
  const parts = DATABASE_URL_ENV_KEYS.map((key) => {
    const val = env[key];
    if (!val || typeof val !== "string" || !val.trim()) {
      return `${key}: unset`;
    }
    const normalized = normalizeDatabaseUrl(val);
    return `${key}: ${normalized ? "valid" : "invalid/empty"}`;
  });
  return parts.join(", ");
}

/**
 * Validate that a database URL is well-formed for PostgreSQL.
 *
 * @param {string | undefined | null} url
 * @returns {{ valid: boolean; host?: string; error?: string }}
 */
export function validateDatabaseUrl(url) {
  const normalized = normalizeDatabaseUrl(url);
  if (!normalized) {
    return {
      valid: false,
      error: "DATABASE_URL is missing, empty, or an invalid placeholder",
    };
  }

  try {
    const parsed = parsePgConnectionString(normalized);
    const host = parsed.host;

    if (!host || host === "base") {
      return {
        valid: false,
        error: `Invalid database host '${host || "empty"}'. Ensure the URL starts with postgres:// or postgresql:// and specifies a valid server hostname.`,
      };
    }

    return { valid: true, host };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to parse database connection string: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Check if running in production (Vercel Production or standard production Node.js).
 * Specifically distinguishes Vercel Preview/Development from true Production.
 *
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {boolean}
 */
export function isProductionEnvironment(env = process.env) {
  // If explicitly flagged as preview or development on Vercel, it is not production
  if (env.VERCEL_ENV === "preview" || env.VERCEL_ENV === "development") {
    return false;
  }
  return (
    env.NODE_ENV === "production" ||
    env.VERCEL_ENV === "production" ||
    (env.VERCEL === "1" && !env.VERCEL_ENV)
  );
}

/**
 * Safely extract the host name from a connection string for logs without exposing credentials.
 *
 * @param {string | undefined | null} rawUrl
 * @returns {string}
 */
export function getSanitizedHost(rawUrl) {
  const validation = validateDatabaseUrl(rawUrl);
  return validation.valid && validation.host ? validation.host : "[invalid-or-missing]";
}
