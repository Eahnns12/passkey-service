function createResponse({ statusCode, headers = {}, body = {} } = {}) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

function successResponse({ statusCode, body = {} } = {}) {
  return createResponse({
    statusCode,
    headers: { "Content-Type": "application/json" },
    body,
  });
}

function errorResponse({ statusCode = 400, body = {} } = {}) {
  return createResponse({
    statusCode,
    headers: { "Content-Type": "application/problem+json" },
    body: {
      title: body?.name || "Unknown Error",
      status: statusCode,
      detail: body?.message,
      instance: body?.instance || "/",
    },
  });
}

module.exports = { successResponse, errorResponse };
