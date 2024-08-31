const {
  registrationRequestHandler,
  registrationResponseHandler,
  authenticationRequestHandler,
  authenticationResponseHandler,
} = require("./handlers/index.cjs");
const { errorResponse } = require("./utils/http-response.cjs");

async function handler(event) {
  const path = String(event.path).toLowerCase();
  const method = String(event.httpMethod).toUpperCase();
  const route = `${method} ${path}`;

  const routes = new Map([
    ["POST /webauthn/registration/request", registrationRequestHandler],
    ["POST /webauthn/registration/response", registrationResponseHandler],
    ["POST /webauthn/authentication/request", authenticationRequestHandler],
    ["POST /webauthn/authentication/response", authenticationResponseHandler],
  ]);

  if (routes.has(route)) {
    return routes.get(route)(event);
  } else {
    return errorResponse("unregistered route", { instance: "/webauthn" });
  }
}

module.exports = { handler };
