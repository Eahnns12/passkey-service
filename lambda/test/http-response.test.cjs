const assert = require("node:assert");
const test = require("node:test");
const {
  successResponse,
  errorResponse,
} = require("../utils/http-response.cjs");

test("http-response", async (t) => {
  await t.test("successResponse creates correct response structure", (t) => {
    const result = { data: "test data" };
    const response = successResponse(result);

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.headers, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    });
    assert.strictEqual(response.body, JSON.stringify(result));
  });

  await t.test(
    "errorResponse creates correct error response structure",
    (t) => {
      const error = {
        statusCode: 400,
        title: "Test Error",
        message: "This is a test error",
      };
      const response = errorResponse(error);

      assert.strictEqual(response.statusCode, 400);
      assert.deepStrictEqual(response.headers, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "application/problem+json",
      });
      const body = JSON.parse(response.body);
      assert.strictEqual(body.title, "Test Error");
      assert.strictEqual(body.status, 400);
      assert.strictEqual(body.detail, "This is a test error");
    }
  );
});
