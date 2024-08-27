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

function successResponse(result = {}) {
  return createResponse({
    statusCode: result.statusCode || 200,
    headers: { "Content-Type": "application/json", ...result.headers },
    body: result.body !== undefined ? result.body : result,
  });
}

function errorResponse(error = {}) {
  return createResponse({
    statusCode: error.statusCode || 500,
    headers: { "Content-Type": "application/problem+json" },
    body: {
      title: error.title || error.name || "Unknown Error",
      status: error.statusCode || 500,
      type: error.type || "about:blank",
      detail: error.detail || error.message,
      instance: error.instance || null,
    },
  });
}

module.exports = { successResponse, errorResponse };
