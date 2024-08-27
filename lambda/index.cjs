const {
  registrationRequestHandler,
  registrationResponseHandler,
} = require("./handlers/index.cjs");
const { successResponse, errorResponse } = require("./utils/http-response.cjs");

async function handler(event, context) {
  const path = String(event.path).toLowerCase();
  const method = String(event.httpMethod).toUpperCase();
  const route = `${method} ${path}`;

  const routes = new Map();
  routes.set("POST /registration/request", registrationRequestHandler);
  routes.set("POST /registration/response", registrationResponseHandler);
  routes.set("POST /authentication/response", null);
  routes.set("POST /authentication/response", null);

  if (routes.has(route)) {
    return routes.get(route)(event);
  } else {
    return errorResponse({
      statusCode: 500,
      body: {
        title: "Internal Server Error",
        detail: null,
        instance: event.resource,
      },
    });
  }
}

module.exports = { handler };
