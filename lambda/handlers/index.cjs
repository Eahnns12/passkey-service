const registrationRequestHandler = require("./webauthn/registration/request/post.cjs");
const registrationResponseHandler = require("./webauthn/registration/response/post.cjs");
const authenticationRequestHandler = require("./webauthn/authentication/request/post.cjs");
const authenticationResponseHandler = require("./webauthn/authentication/response/post.cjs");

module.exports = {
  registrationRequestHandler,
  registrationResponseHandler,
  authenticationRequestHandler,
  authenticationResponseHandler,
};
