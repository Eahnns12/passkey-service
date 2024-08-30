const { RegistrationService } = require("../../../../services/index.cjs");
const {
  ApplicantsRepository,
  CredentialsRepository,
} = require("../../../../repositories/index.cjs");
const JSONError = require("../../../../utils/json-error.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/http-response.cjs");

async function registrationRequestHandler(event) {
  try {
    const origin = event.headers.origin;

    if (!origin) {
      throw new JSONError("request agent not supported", {
        statusCode: 400,
        title: "Error",
        instance: "/webauthn/registration/request",
      });
    }

    const hostname = new URL(origin).hostname;
    const { rpName, userId, userName } = JSON.parse(event.body);

    const applicantsRepository = new ApplicantsRepository();
    const credentialsRepository = new CredentialsRepository();
    const registrationService = new RegistrationService(
      applicantsRepository,
      credentialsRepository
    );

    const result = await registrationService.request({
      rpId: hostname,
      rpName,
      userId,
      userName,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = registrationRequestHandler;
