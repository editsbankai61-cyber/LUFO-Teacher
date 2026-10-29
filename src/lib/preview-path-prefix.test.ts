import assert from "node:assert/strict";
import { test } from "node:test";
import { previewPathPrefix, prefixRewrite } from "./preview-path-prefix.ts";

test("identifies path prefix for known preview hosts", () => {
  const prefix = previewPathPrefix(
    "preview.grok.mil",
    "/hds-app-8080-abc/dashboard",
  );
  assert.equal(prefix, "/hds-app-8080-abc");
});

test("returns undefined for unknown hosts", () => {
  const prefix = previewPathPrefix("localhost", "/hds-app-8080-abc/dashboard");
  assert.equal(prefix, undefined);
});

test("rewrites input and output paths with prefix", () => {
  const rewrite = prefixRewrite("/hds-app-8080-abc");
  assert.ok(rewrite.input);
  assert.ok(rewrite.output);

  const inputUrl = rewrite.input({
    url: new URL("https://preview.grok.mil/hds-app-8080-abc/dashboard"),
  });
  const inputPath = inputUrl instanceof URL ? inputUrl.pathname : inputUrl;
  assert.equal(inputPath, "/dashboard");

  const outputUrl = rewrite.output({
    url: new URL("https://preview.grok.mil/dashboard"),
  });
  const outputPath = outputUrl instanceof URL ? outputUrl.pathname : outputUrl;
  assert.equal(outputPath, "/hds-app-8080-abc/dashboard");
});
