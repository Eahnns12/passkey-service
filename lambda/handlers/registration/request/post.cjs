const RegistrationService = require("../../../services/registration-service.cjs");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/http-response.cjs");

async function registrationRequestHandler(event) {
  try {
    const origin = event.headers.origin;
    const rpID = new URL(origin).hostname;
    const { userID, userName } = JSON.parse(event.body);

    const registrationService = new RegistrationService();

    const result = await registrationService.request({
      rpID,
      userID,
      userName,
    });

    return successResponse({ statusCode: 200, body: result });
  } catch (error) {
    return errorResponse({ statusCode: error.statusCode, body: { ...error } });
  }
}

module.exports = { registrationRequestHandler };
