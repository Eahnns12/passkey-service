const test = require("node:test");
const assert = require("node:assert");
const JSONError = require("../utils/json-error.cjs");

test("JSONError", async (t) => {
  await t.test("creates an instance with correct properties", () => {
    const error = new JSONError("Test error message", {
      statusCode: 400,
      title: "Test Error",
      type: "test:error",
      instance: "/test",
    });

    assert(error instanceof Error);
    assert.strictEqual(error.message, "Test error message");
    assert.strictEqual(error.statusCode, 400);
    assert.strictEqual(error.title, "Test Error");
    assert.strictEqual(error.detail, "Test error message");
    assert.strictEqual(error.type, "test:error");
    assert.strictEqual(error.instance, "/test");
  });
});
