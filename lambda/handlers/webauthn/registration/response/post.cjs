const { getInstance, RegistrationService } = require("../../../../core.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/http-response.cjs");
const getOriginAndHostname = require("../../../../utils/get-origin-and-hostname.cjs");
const getBody = require("../../../../utils/get-body.cjs");
const validate = require("../../../../utils/validate.cjs");

async function registrationResponseHandler(event) {
  try {
    const { origin, hostname: rpId } = getOriginAndHostname(event);
    const { session, publicKeyCredential } = getBody(event);

    const params = { origin, rpId, session, publicKeyCredential };

    const registrationService = getInstance(RegistrationService);

    const validatedRequest = validate(
      registrationService.response.bind(registrationService),
      registrationService.schemas.registration.response
    );

    const result = await validatedRequest(params);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = registrationResponseHandler;
