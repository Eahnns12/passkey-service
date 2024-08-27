const RegistrationService = require("../../../services/registration-service.cjs");
const ChallengesRepository = require("../../../repositories/challenges-repository.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/http-response.cjs");

async function registrationResponseHandler(event) {
  try {
    const origin = event.headers.origin;
    const hostname = new URL(origin).hostname;
    const { session, publicKeyCredential, user } = JSON.parse(event.body);

    const challengesRepository = new ChallengesRepository();
    const registrationService = new RegistrationService(challengesRepository);

    const result = await registrationService.response({
      session,
      origin,
      rpID: hostname,
      publicKeyCredential,
      user,
    });

    return successResponse({ statusCode: 200, body: result });
  } catch (error) {
    return errorResponse({ statusCode: error.statusCode, body: { ...error } });
  }
}

module.exports = { registrationResponseHandler };
