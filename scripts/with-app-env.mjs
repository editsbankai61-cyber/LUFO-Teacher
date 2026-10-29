/**
 * Run a command with `.grok/app-env.json` merged into its environment.
 *
 * Only VITE_-prefixed string values are loaded from the app environment file.
 * Existing process environment variables take precedence over file values.
 */

import { spawn } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ENV_REL_PATH = ".grok/app-env.json";

const VITE_PREFIX = "VITE_";

export function parseAppEnv(text) {
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }

  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    return {};
  }

  const env = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) continue;
    if (typeof value !== "string") continue;

    env[key] = value;
  }

  return env;
}

export function readAppEnv(root) {
  try {
    return parseAppEnv(
      readFileSync(join(root, APP_ENV_REL_PATH), "utf8")
    );
  } catch {
    return {};
  }
}

export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

export function exitStatusFromChild(code, signal) {
  if (signal) {
    const signo = osConstants.signals[signal];
    return 128 + (typeof signo === "number" ? signo : 1);
  }

  return code ?? 1;
}

export function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

export function isMainModule(moduleUrl) {
  const entry = process.argv[1];

  if (!entry) return false;

  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

function main(argv) {
  const [command, ...args] = argv;

  if (!command) {
    console.error(
      "usage: node scripts/with-app-env.mjs <command> [args...]"
    );
    process.exitCode = 2;
    return;
  }

  const env = mergeAppEnv(
    readAppEnv(projectRoot()),
    process.env
  );

  const isWindows = process.platform === "win32";
  const isExe =
    isWindows &&
    (command === process.execPath ||
      command.toLowerCase() === "node" ||
      command.toLowerCase().endsWith(".exe"));
  const useShell = isWindows && !isExe;
  const cmdToRun =
    useShell && command.includes(" ") && !command.startsWith('"')
      ? `"${command}"`
      : command;

  const child = spawn(cmdToRun, args, {
    stdio: "inherit",
    env,
    shell: useShell,
    windowsHide: true,
  });

  let finished = false;

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      if (!finished) {
        child.kill(signal);
      }
    });
  }

  child.on("error", (err) => {
    if (finished) return;
    finished = true;

    console.error(
      `[with-app-env] failed to run ${command}:`,
      err?.message || err
    );

    process.exitCode = 127;
  });

  child.on("exit", (code, signal) => {
    if (finished) return;
    finished = true;

    process.exitCode = exitStatusFromChild(code, signal);
  });
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
