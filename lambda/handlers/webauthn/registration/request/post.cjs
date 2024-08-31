const { getInstance, RegistrationService } = require("../../../../core.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/http-response.cjs");
const getOriginAndHostname = require("../../../../utils/get-origin-and-hostname.cjs");
const getBody = require("../../../../utils/get-body.cjs");
const validate = require("../../../../utils/validate.cjs");

async function registrationRequestHandler(event) {
  try {
    const { hostname: rpId } = getOriginAndHostname(event);
    const { rpName, userId, userName, userDisplayName } = getBody(event);

    const params = { rpId, rpName, userId, userName, userDisplayName };

    const registrationService = getInstance(RegistrationService);

    const validatedRequest = validate(
      registrationService.request.bind(registrationService),
      registrationService.schemas.registration.request
    );

    const result = await validatedRequest(params);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = registrationRequestHandler;
