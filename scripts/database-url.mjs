// @ts-check
import { parse as parsePgConnectionString } from "pg-connection-string";

/**
 * Clean and normalize a raw database connection string.
 *
 * Handles:
 * - Accidental variable assignment prefix: `DATABASE_URL=postgresql://...`
 * - Accidental CLI prefix: `psql 'postgresql://...'`
 * - Surrounding quotes (single, double, or backticks): `"postgresql://..."`
 * - Leading and trailing whitespace
 * - Rejection of invalid placeholders like "base" or "database"
 *
 * @param {string | undefined | null} raw
 * @returns {string | undefined}
 */
export function normalizeDatabaseUrl(raw) {
  if (!raw || typeof raw !== "string") return undefined;
  let s = raw.trim();
  if (!s) return undefined;

  // Strip common accidental prefixes
  s = s.replace(/^DATABASE_URL\s*=\s*/i, "").trim();
  s = s.replace(/^POSTGRES_URL\s*=\s*/i, "").trim();
  s = s.replace(/^psql\s+/i, "").trim();

  // Strip surrounding quotes
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith("`") && s.endsWith("`"))
  ) {
    s = s.slice(1, -1).trim();
  }

  // Handle case where value was pasted as "DATABASE_URL=..." inside quotes
  s = s.replace(/^DATABASE_URL\s*=\s*/i, "").trim();
  s = s.replace(/^POSTGRES_URL\s*=\s*/i, "").trim();
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith("`") && s.endsWith("`"))
  ) {
    s = s.slice(1, -1).trim();
  }

  if (!s) return undefined;

  // Reject placeholder values that pg-connection-string misparses as host 'base'
  const lower = s.toLowerCase();
  if (lower === "base" || lower === "database" || lower === "database_url" || lower === "postgres_url") {
    return undefined;
  }

  // Validate scheme: must start with postgres:// or postgresql://, or contain host=
  if (!s.startsWith("postgres://") && !s.startsWith("postgresql://")) {
    if (!s.includes("host=") && !s.includes("dbname=")) {
      return undefined;
    }
  }

  return s;
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
 * Check if running in production (Vercel or standard production Node.js).
 *
 * @param {Record<string, string | undefined>} [env=process.env]
 * @returns {boolean}
 */
export function isProductionEnvironment(env = process.env) {
  return (
    env.NODE_ENV === "production" ||
    env.VERCEL === "1" ||
    Boolean(env.VERCEL_ENV)
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

