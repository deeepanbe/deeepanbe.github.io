import test from "node:test";
import assert from "node:assert/strict";
import { backoff } from "./autonomous-loop.js";

test("backoff increases and caps", () => {
  assert.equal(backoff(0), 800);
  assert.equal(backoff(1), 1600);
  assert.equal(backoff(10), 8000);
});
