const { getInstance, AuthenticationService } = require("../../../../core.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/http-response.cjs");
const getOriginAndHostname = require("../../../../utils/get-origin-and-hostname.cjs");
const validate = require("../../../../utils/validate.cjs");

async function authenticationRequestHandler(event) {
  try {
    const { hostname: rpId } = getOriginAndHostname(event);

    const params = { rpId };

    const authenticationService = getInstance(AuthenticationService);

    const validatedRequest = validate(
      authenticationService.request.bind(authenticationService),
      authenticationService.schemas.authentication.request
    );

    const result = await validatedRequest(params);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = authenticationRequestHandler;
