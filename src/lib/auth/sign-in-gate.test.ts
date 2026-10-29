import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveSignInGateState } from "./sign-in-gate.ts";

test("returns pending when isPending is true", () => {
  assert.equal(
    resolveSignInGateState({ isPending: true, hasUser: false }),
    "pending",
  );
  assert.equal(
    resolveSignInGateState({ isPending: true, hasUser: true }),
    "pending",
  );
});

test("returns signed_in when not pending and hasUser is true", () => {
  assert.equal(
    resolveSignInGateState({ isPending: false, hasUser: true }),
    "signed_in",
  );
});

test("returns signed_out when not pending and hasUser is false", () => {
  assert.equal(
    resolveSignInGateState({ isPending: false, hasUser: false }),
    "signed_out",
  );
});
