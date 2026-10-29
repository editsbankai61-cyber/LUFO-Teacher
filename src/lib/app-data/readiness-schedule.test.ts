import assert from "node:assert/strict";
import { test } from "node:test";
import {
  READINESS_PROBE_MAX_TOTAL_MS,
  readinessProbeDelayMs,
  readinessProbeExhausted,
} from "./readiness-schedule.ts";

test("returns graduated delay based on attempt count", () => {
  assert.equal(readinessProbeDelayMs(0), 1_000);
  assert.equal(readinessProbeDelayMs(1), 2_000);
  assert.equal(readinessProbeDelayMs(2), 3_000);
  assert.equal(readinessProbeDelayMs(3), 5_000);
  assert.equal(readinessProbeDelayMs(4), 5_000);
  assert.equal(readinessProbeDelayMs(10), 5_000);
  assert.equal(readinessProbeDelayMs(-1), 1_000);
});

test("detects when probe window is exhausted", () => {
  const start = 1_000_000;
  assert.equal(readinessProbeExhausted(start, start + 10_000), false);
  assert.equal(
    readinessProbeExhausted(start, start + READINESS_PROBE_MAX_TOTAL_MS - 1),
    false,
  );
  assert.equal(
    readinessProbeExhausted(start, start + READINESS_PROBE_MAX_TOTAL_MS),
    true,
  );
  assert.equal(
    readinessProbeExhausted(start, start + READINESS_PROBE_MAX_TOTAL_MS + 5_000),
    true,
  );
});
