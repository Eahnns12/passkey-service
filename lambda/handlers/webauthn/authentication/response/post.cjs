const { DynamoDB } = require("aws-sdk");
const { AuthenticationService } = require("../../../../services/index.cjs");
const {
  ApplicantsRepository,
  CredentialsRepository,
} = require("../../../../repositories/index.cjs");
const JSONError = require("../../../../utils/json-error.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/http-response.cjs");

async function authenticationResponseHandler(event) {
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
    const { session, publicKeyCredential } = JSON.parse(event.body);

    const dynamoDB = new DynamoDB.DocumentClient();
    const applicantsRepository = new ApplicantsRepository(dynamoDB);
    const credentialsRepository = new CredentialsRepository(dynamoDB);
    const authenticationService = new AuthenticationService(
      applicantsRepository,
      credentialsRepository
    );

    const result = await authenticationService.response({
      session,
      rpId: hostname,
      origin,
      publicKeyCredential,
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

module.exports = authenticationResponseHandler;
