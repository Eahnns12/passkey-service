const { DynamoDB } = require("aws-sdk");
const RegistrationService = require("../../../services/registration-service.cjs");
const {
  ApplicantsRepository,
  CredentialsRepository,
} = require("../../../repositories/index.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/http-response.cjs");

async function registrationResponseHandler(event) {
  try {
    const origin = event.headers.origin;

    if (!origin) {
      throw new JSONError("request agent not supported", {
        statusCode: 400,
        title: "Error",
        instance: "/registration/request",
      });
    }

    const hostname = new URL(origin).hostname;
    const { session, publicKeyCredential } = JSON.parse(event.body);

    const dynamoDB = new DynamoDB.DocumentClient();
    const applicantsRepository = new ApplicantsRepository(dynamoDB);
    const credentialsRepository = new CredentialsRepository(dynamoDB);
    const registrationService = new RegistrationService(
      applicantsRepository,
      credentialsRepository
    );
    const result = await registrationService.response({
      session,
      origin,
      rpId: hostname,
      publicKeyCredential,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = { registrationResponseHandler };
