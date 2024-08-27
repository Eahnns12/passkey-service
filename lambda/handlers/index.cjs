const {
  registrationRequestHandler,
} = require("./registration/request/post.cjs");

const {
  registrationResponseHandler,
} = require("./registration/response/post.cjs");

module.exports = { registrationRequestHandler, registrationResponseHandler };
