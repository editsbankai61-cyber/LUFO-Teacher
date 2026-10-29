import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyCallToolError } from "./errors.ts";
import { isConnectorPending, isLoginRequired } from "./login.ts";

test("identifies when login is required", () => {
  assert.equal(
    isLoginRequired({ ok: false, data: null, loginRequired: true }),
    true,
  );
  assert.equal(
    isLoginRequired({ ok: false, data: null, loginRequired: false }),
    false,
  );
  assert.equal(
    isLoginRequired({ ok: true, data: {} }),
    false,
  );
});

test("identifies when connector is pending", () => {
  assert.equal(
    isConnectorPending({ ok: false, data: null, pending: true }),
    true,
  );
  assert.equal(
    isConnectorPending({ ok: false, data: null }),
    false,
  );
});

test("classifyCallToolError handles success", () => {
  assert.equal(classifyCallToolError({ ok: true, data: "ok" }), null);
});

test("classifyCallToolError classifies different error states", () => {
  assert.equal(
    classifyCallToolError({ ok: false, data: null, pending: true })?.kind,
    "pending",
  );
  assert.equal(
    classifyCallToolError({ ok: false, data: null, loginRequired: true })?.kind,
    "login",
  );
  assert.equal(
    classifyCallToolError({ ok: false, data: null, errorMessage: "user not_connected" })?.kind,
    "not_connected",
  );
  assert.equal(
    classifyCallToolError({ ok: false, data: null, errorMessage: "user scope_denied" })?.kind,
    "scope_denied",
  );
  assert.equal(
    classifyCallToolError({ ok: false, data: null, errorMessage: "access_denied by policy" })?.kind,
    "access_denied",
  );
});
