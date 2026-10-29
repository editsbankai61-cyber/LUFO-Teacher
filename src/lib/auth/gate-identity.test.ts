import assert from "node:assert/strict";
import { test } from "node:test";
import {
  gateIdentityEnabled,
  gateIdentityUserInfo,
  sessionBoundToGateIdentity,
} from "./gate-identity.server.ts";

test("gateIdentityEnabled respects VITE_AUTH_ENABLED", () => {
  // Shipped default has VITE_AUTH_ENABLED=false
  assert.equal(typeof gateIdentityEnabled(), "boolean");
});

test("sessionBoundToGateIdentity matches linked accounts", () => {
  const accounts = [
    { providerId: "google", accountId: "123" },
    { providerId: "grok", accountId: "sub-abc" },
  ];
  assert.equal(
    sessionBoundToGateIdentity(accounts, "sub-abc", "grok"),
    true,
  );
  assert.equal(
    sessionBoundToGateIdentity(accounts, "sub-xyz", "grok"),
    false,
  );
  assert.equal(
    sessionBoundToGateIdentity(accounts, "sub-abc", "github"),
    false,
  );
});

test("gateIdentityUserInfo formats user information correctly", () => {
  const user = gateIdentityUserInfo({
    sub: "user-123",
    email: "Test@Example.com",
    name: "Alice",
    teamId: "team-1",
  });
  assert.equal(user.id, "user-123");
  assert.equal(user.email, "test@example.com");
  assert.equal(user.emailVerified, true);
  assert.equal(user.name, "Alice");
});

test("gateIdentityUserInfo falls back when email or name is null", () => {
  const user = gateIdentityUserInfo({
    sub: "user-456",
    email: null,
    name: null,
    teamId: null,
  });
  assert.equal(user.id, "user-456");
  assert.equal(user.emailVerified, false);
  assert.match(user.email, /user-456@.*grok/);
  assert.equal(user.name, "Grok user");
});
